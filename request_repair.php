<?php
// request_repair.php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$nombre      = $data['name']        ?? '';
$email       = $data['email']       ?? '';
$phone       = $data['phone']       ?? '';
$descripcion = $data['description'] ?? '';
$services    = $data['services']    ?? [];
$total       = $data['total']       ?? 0;

if (!$nombre || !$email) {
    echo json_encode([
        'success' => false,
        'message' => 'Nombre y correo son obligatorios.'
    ]);
    exit;
}

if (!is_array($services) || count($services) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Debes seleccionar al menos un servicio.'
    ]);
    exit;
}

try {
    // 1) Asegurarnos de que el correo exista en tabla_cliente para no romper la FK
    // Usa el mismo estilo de columna que en register.php (CORREO)
    $check = $pdo->prepare("SELECT 1 FROM tabla_cliente WHERE CORREO = ?");
    $check->execute([$email]);
    if (!$check->fetch()) {
        // Si no existe, lo creamos con datos básicos
        $insertCli = $pdo->prepare("
            INSERT INTO tabla_cliente (NOMBRE, CORREO, contrasena, FECHA_REGISTRO)
            VALUES (?, ?, ?, NOW())
        ");
        // contrasena en blanco o un placeholder
        $insertCli->execute([$nombre, $email, '']);
    }

    // 2) Construir texto de tipo de reparación (ej. "Cambio de suela, Limpieza profunda")
    $nombresServicios = array_map(function($s) {
        return isset($s['servicio']) ? $s['servicio'] : '';
    }, $services);
    $nombresServicios = array_filter($nombresServicios);
    $tipoReparacion = implode(', ', $nombresServicios);
    if ($tipoReparacion === '') {
        $tipoReparacion = 'Múltiples servicios';
    }

    // IMPORTANTE: por si tu columna sigue en VARCHAR(100)
    $tipoReparacion = mb_substr($tipoReparacion, 0, 100);

    // 3) Enriquecer descripción con teléfono
    $descripcionCompleta = $descripcion;
    if ($phone) {
        $descripcionCompleta .= ($descripcionCompleta ? "\n" : "") . "Teléfono de contacto: " . $phone;
    }

    // 4) Generar código único de reparación
    $codigoReparacion = 'RP-' . date('YmdHis') . '-' . strtoupper(bin2hex(random_bytes(2)));

    // 5) Insertar en tabla_reparacion
    $sql = "
        INSERT INTO tabla_reparacion
            (ID_EMPLEADO, TIPO_REPARACION, DESCRIPCION, COSTO, FECHA_RECEPCION, FECHA_ENTREGA, ESTADO, CODIGO_REPARACION, correo)
        VALUES
            (NULL, ?, ?, ?, CURDATE(), NULL, 'Pendiente', ?, ?)
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $tipoReparacion,
        $descripcionCompleta,
        $total,
        $codigoReparacion,
        $email
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Solicitud de reparación registrada correctamente.',
        'codigo'  => $codigoReparacion
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar la reparación: ' . $e->getMessage()
    ]);
}
?>
