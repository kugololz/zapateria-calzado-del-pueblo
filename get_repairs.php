<?php
// get_repairs.php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Usuario no identificado']);
    exit;
}

try {
    // Solo reparaciones PENDIENTES de este correo
    $sql = "
        SELECT
            ID_REPARACION,
            TIPO_REPARACION,
            DESCRIPCION,
            COSTO,
            FECHA_RECEPCION,
            FECHA_ENTREGA,
            ESTADO,
            CODIGO_REPARACION,
            correo
        FROM tabla_reparacion
        WHERE correo = ?
          AND ESTADO = 'Pendiente'
        ORDER BY FECHA_RECEPCION DESC, ID_REPARACION DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email]);
    $rows = $stmt->fetchAll();

    $repairs = [];
    foreach ($rows as $r) {
        $repairs[] = [
            'id_reparacion' => (int)$r['ID_REPARACION'],
            'codigo'        => $r['CODIGO_REPARACION'],
            'tipo'          => $r['TIPO_REPARACION'],
            'descripcion'   => $r['DESCRIPCION'],
            'costo'         => $r['COSTO'] !== null ? (float)$r['COSTO'] : 0,
            'fecha'         => $r['FECHA_RECEPCION'],
            'estado'        => $r['ESTADO'],
            'correo'        => $r['correo']
        ];
    }

    echo json_encode(['success' => true, 'repairs' => $repairs]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error DB: ' . $e->getMessage()]);
}
?>
