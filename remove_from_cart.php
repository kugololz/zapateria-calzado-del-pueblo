<?php
// remove_from_cart.php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id_detalle = $data['id_detalle'] ?? 0;

if (!$id_detalle) {
    echo json_encode(['success' => false, 'message' => 'ID inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM tabla_detalle_carrito WHERE ID_DETALLE = ?");
    $stmt->execute([$id_detalle]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error DB: ' . $e->getMessage()]);
}
?>