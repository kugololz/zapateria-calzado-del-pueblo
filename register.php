<?php
// register.php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

// Extract fields
$nombre = $data['name'] ?? '';
$email  = $data['email'] ?? '';
$pass   = $data['password'] ?? '';

// Validation
if (!$nombre || !$email || !$pass) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios']);
    exit;
}

try {
    // 1. Check if email already exists
    // CHANGE: using "SELECT 1" to avoid column name errors (like ID_CLIENTE vs id)
    $stmt = $pdo->prepare("SELECT 1 FROM tabla_cliente WHERE CORREO = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
        exit;
    }

    // 2. Insert new user
    // Make sure your table has columns: NOMBRE, CORREO, contrasena, FECHA_REGISTRO
    $sql = "INSERT INTO tabla_cliente (NOMBRE, CORREO, contrasena, FECHA_REGISTRO) VALUES (?, ?, ?, NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nombre, $email, $pass]);

    // 3. Return success
    echo json_encode([
        'success' => true, 
        'user' => [
            'name' => $nombre,
            'email' => $email
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error DB: ' . $e->getMessage()]);
}
?>