<?php
// checkout.php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

// Podrías recibir método de pago desde JS, por ahora fijo:
$metodoPago = $data['metodo_pago'] ?? 'Tarjeta';

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Usuario no identificado']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Get the Active Cart
    $stmt = $pdo->prepare("SELECT ID_CARRITO FROM tabla_carrito WHERE correo = ? AND ESTADO = 'Activo'");
    $stmt->execute([$email]);
    $cart = $stmt->fetch();

    if (!$cart) {
        throw new Exception("No hay carrito activo para procesar");
    }
    $cartId = (int)$cart['ID_CARRITO'];

    // 2. Get items to check/update stock
    $stmt = $pdo->prepare("SELECT ID_PRODUCTO, CANTIDAD FROM tabla_detalle_carrito WHERE ID_CARRITO = ?");
    $stmt->execute([$cartId]);
    $items = $stmt->fetchAll();

    if (empty($items)) {
        throw new Exception("El carrito está vacío");
    }

    $totalVenta = 0;
    $ventaItems = []; // Para luego insertar en tabla_detalle_venta

    foreach ($items as $item) {
        // Check Stock & Price
        $stockCheck = $pdo->prepare("SELECT STOCK, PRECIO FROM tabla_producto WHERE ID_PRODUCTO = ?");
        $stockCheck->execute([$item['ID_PRODUCTO']]);
        $prodData = $stockCheck->fetch();

        if (!$prodData) {
            throw new Exception("Producto no válido (ID: " . $item['ID_PRODUCTO'] . ")");
        }

        if ($prodData['STOCK'] < $item['CANTIDAD']) {
            throw new Exception("Stock insuficiente para el producto ID: " . $item['ID_PRODUCTO']);
        }

        // Deduct Stock
        $updateStock = $pdo->prepare("UPDATE tabla_producto SET STOCK = STOCK - ? WHERE ID_PRODUCTO = ?");
        $updateStock->execute([$item['CANTIDAD'], $item['ID_PRODUCTO']]);

        $precioUnit = (float)$prodData['PRECIO'];
        $cant       = (int)$item['CANTIDAD'];
        $subtotal   = $precioUnit * $cant;

        $totalVenta += $subtotal;

        // Guardamos para la tabla_detalle_venta
        $ventaItems[] = [
            'id_producto' => (int)$item['ID_PRODUCTO'],
            'cantidad'    => $cant,
            'precio'      => $precioUnit,
            'subtotal'    => $subtotal
        ];
    }

    // 3. Crear registro en tabla_venta (cabecera del pedido)

    // Generar código de referencia único (ej: VT-250303-AB12)
    $codigoVenta = 'VT-' . date('ymdHis') . '-' . strtoupper(bin2hex(random_bytes(2)));
    // CODIGO_VENTA es VARCHAR(30), esto cabe de sobra.

    $insertVenta = $pdo->prepare("
        INSERT INTO tabla_venta
            (ID_EMPLEADO, FECHA_VENTA, TOTAL, METODO_PAGO, ESTADO_RETIRO, CODIGO_VENTA, correo)
        VALUES
            (NULL, CURDATE(), ?, ?, 'Pendiente', ?, ?)
    ");
    $insertVenta->execute([$totalVenta, $metodoPago, $codigoVenta, $email]);
    $idVenta = (int)$pdo->lastInsertId();

    // 4. Insertar detalle de la venta (productos del pedido)
    $insertDetalle = $pdo->prepare("
        INSERT INTO tabla_detalle_venta
            (ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO, SUBTOTAL)
        VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($ventaItems as $vi) {
        $insertDetalle->execute([
            $idVenta,
            $vi['id_producto'],
            $vi['cantidad'],
            $vi['precio'],
            $vi['subtotal']
        ]);
        // Nota: tu trigger en tabla_detalle_venta también calcula SUBTOTAL,
        // pero pasar el valor explícito no causa problema.
    }

    // 5. Mark Cart as 'Pagado'
    $updateCart = $pdo->prepare("UPDATE tabla_carrito SET ESTADO = 'Pagado' WHERE ID_CARRITO = ?");
    $updateCart->execute([$cartId]);

    $pdo->commit();

    echo json_encode([
        'success'   => true,
        'message'   => 'Compra realizada con éxito',
        'reference' => $codigoVenta
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
