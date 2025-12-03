<?php
header('Content-Type: application/json');
require 'db.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? '';
$productId = $data['productId'] ?? 0;
$quantity = $data['quantity'] ?? 1;

if (!$email || !$productId) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    $pdo->beginTransaction();

    // 1. Check if User exists (Safety check)
    $stmt = $pdo->prepare("SELECT correo FROM tabla_cliente WHERE correo = ?");
    $stmt->execute([$email]);
    if (!$stmt->fetch()) {
        throw new Exception("Usuario no encontrado");
    }

    // 2. Find an ACTIVE cart for this user
    // Note: We use 'correo' because of your previous database migration
    $stmt = $pdo->prepare("SELECT ID_CARRITO FROM tabla_carrito WHERE correo = ? AND ESTADO = 'Activo'");
    $stmt->execute([$email]);
    $cart = $stmt->fetch();

    $cartId = null;

    if ($cart) {
        $cartId = $cart['ID_CARRITO'];
    } else {
        // 3. If no active cart, Create one
        $stmt = $pdo->prepare("INSERT INTO tabla_carrito (correo, FECHA_CREACION, ESTADO) VALUES (?, NOW(), 'Activo')");
        $stmt->execute([$email]);
        $cartId = $pdo->lastInsertId();
    }

    // 4. Get Product Price for Subtotal calculation
    $stmt = $pdo->prepare("SELECT PRECIO FROM tabla_producto WHERE ID_PRODUCTO = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    
    if (!$product) throw new Exception("Producto no válido");
    
    $price = $product['PRECIO'];

    // 5. Check if product is already in this cart
    $stmt = $pdo->prepare("SELECT ID_DETALLE, CANTIDAD FROM tabla_detalle_carrito WHERE ID_CARRITO = ? AND ID_PRODUCTO = ?");
    $stmt->execute([$cartId, $productId]);
    $existingItem = $stmt->fetch();

    if ($existingItem) {
        // UPDATE existing item
        $newQty = $existingItem['CANTIDAD'] + $quantity;
        $newSubtotal = $newQty * $price;
        
        $update = $pdo->prepare("UPDATE tabla_detalle_carrito SET CANTIDAD = ?, SUBTOTAL = ? WHERE ID_DETALLE = ?");
        $update->execute([$newQty, $newSubtotal, $existingItem['ID_DETALLE']]);
    } else {
        // INSERT new item
        // Note: The Trigger 'tr_Calcular_Subtotal_Insert' in your SQL would calculate subtotal, 
        // but passing it explicitly is safer.
        $subtotal = $quantity * $price;
        $insert = $pdo->prepare("INSERT INTO tabla_detalle_carrito (ID_CARRITO, ID_PRODUCTO, CANTIDAD, SUBTOTAL) VALUES (?, ?, ?, ?)");
        $insert->execute([$cartId, $productId, $quantity, $subtotal]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Producto agregado al carrito']);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
