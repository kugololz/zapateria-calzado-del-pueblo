<?php
// get_orders.php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Usuario no identificado']);
    exit;
}

try {
    $sql = "
        SELECT
            v.ID_VENTA,
            v.CODIGO_VENTA,
            v.FECHA_VENTA,
            v.TOTAL,
            v.METODO_PAGO,
            v.ESTADO_RETIRO,
            COUNT(*) AS num_items
        FROM tabla_venta v
        LEFT JOIN tabla_detalle_venta d ON v.ID_VENTA = d.ID_VENTA
        WHERE v.correo = ?
        GROUP BY
            v.ID_VENTA,
            v.CODIGO_VENTA,
            v.FECHA_VENTA,
            v.TOTAL,
            v.METODO_PAGO,
            v.ESTADO_RETIRO
        ORDER BY v.FECHA_VENTA DESC, v.ID_VENTA DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email]);
    $ventas = $stmt->fetchAll();

    $orders = [];
    foreach ($ventas as $v) {
        $orders[] = [
            'id_venta'  => (int)$v['ID_VENTA'],
            'codigo'    => $v['CODIGO_VENTA'],
            'fecha'     => $v['FECHA_VENTA'],
            'total'     => (float)$v['TOTAL'],
            'metodo'    => $v['METODO_PAGO'],
            'estado'    => $v['ESTADO_RETIRO'],
            'num_items' => (int)$v['num_items']
        ];
    }

    echo json_encode(['success' => true, 'orders' => $orders]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error DB: ' . $e->getMessage()]);
}
?>
