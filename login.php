<?php
// login.php
header('Content-Type: application/json');
require 'db.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos']);
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT * FROM tabla_cliente WHERE correo = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // In a real app, use password_verify($password, $user['contrasena'])
        // For this prototype, we compare directly as per your request
        if ($password === $user['contrasena']) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'name' => $user['nombre'],
                    'email' => $user['correo']
                    // Add other fields if needed
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de base de datos']);
}
?>