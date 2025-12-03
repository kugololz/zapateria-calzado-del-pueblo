<?php
// get_products.php
header('Content-Type: application/json');
require 'db.php';

try {
    $stmt = $pdo->query("
        SELECT 
            ID_PRODUCTO, 
            NOMBRE, 
            PRECIO, 
            DESCRIPCION, 
            TALLA, 
            IMAGEN_URL,
            STOCK
        FROM tabla_producto
    ");
    $productos_db = $stmt->fetchAll();

    $lista_final = [];

    foreach ($productos_db as $prod) {
        $img = !empty($prod['IMAGEN_URL']) 
               ? $prod['IMAGEN_URL'] 
               : 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=812&q=80';

        $lista_final[] = [
            'id'          => (int)$prod['ID_PRODUCTO'],
            'name'        => $prod['NOMBRE'],
            'price'       => (float)$prod['PRECIO'],
            'description' => $prod['DESCRIPCION'],
            'sizes'       => [$prod['TALLA']],
            'image'       => $img,
            'stock'       => $prod['STOCK'] !== null ? (int)$prod['STOCK'] : 0
        ];
    }

    echo json_encode($lista_final, JSON_UNESCAPED_UNICODE);

} catch(PDOException $e) {
    echo json_encode(['error' => 'Error al obtener productos']);
}
?>
