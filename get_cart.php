<?php
header('Content-Type: application/json');
require 'db.php';

// 1. Receive the email (sent from JavaScript)
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Usuario no identificado']);
    exit;
}

try {
    // 2. Find the ACTIVE cart ID for this user
    // We use 'correo' because of your previous database updates
    $stmt = $pdo->prepare("SELECT ID_CARRITO FROM tabla_carrito WHERE correo = ? AND ESTADO = 'Activo'");
    $stmt->execute([$email]);
    $cart = $stmt->fetch();

    if (!$cart) {
        // If no active cart exists, return an empty list
        echo json_encode(['success' => true, 'items' => []]);
        exit;
    }

    // 3. Get the Product Details (Name, Price, Image) for that cart
    // We Join 'tabla_detalle_carrito' with 'tabla_producto'
    $query = "
        SELECT 
            d.ID_DETALLE, 
            d.CANTIDAD, 
            p.ID_PRODUCTO, 
            p.NOMBRE, 
            p.PRECIO, 
            p.TALLA, 
            p.IMAGEN_URL
        FROM tabla_detalle_carrito d
        JOIN tabla_producto p ON d.ID_PRODUCTO = p.ID_PRODUCTO
        WHERE d.ID_CARRITO = ?
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$cart['ID_CARRITO']]);
    $results = $stmt->fetchAll();

    // 4. Format the data for JavaScript
    $items = [];
    foreach ($results as $row) {
        // Fallback image if DB is empty
        $img = !empty($row['IMAGEN_URL']) ? $row['IMAGEN_URL'] : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=812&q=80';
        
        $items[] = [
            'id_detalle' => $row['ID_DETALLE'], // We might need this later for deleting
            'productId' => $row['ID_PRODUCTO'],
            'name' => $row['NOMBRE'],
            'price' => (float)$row['PRECIO'],
            'size' => $row['TALLA'],
            'cantidad' => (int)$row['CANTIDAD'],
            'image' => $img
        ];
    }

    echo json_encode(['success' => true, 'items' => $items]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error DB: ' . $e->getMessage()]);
}
?>