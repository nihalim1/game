<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

// รับข้อมูล JSON จาก request
$data = json_decode(file_get_contents('php://input'), true);

// ตรวจสอบข้อมูลที่จำเป็น
$required_fields = ['student_id', 'first_name', 'last_name', 'email', 'password', 'classroom', 'age'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode([
            'success' => false,
            'message' => 'กรุณากรอกข้อมูลให้ครบถ้วน'
        ]);
        exit;
    }
}

try {
    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    $stmt = $pdo->prepare("SELECT id FROM students WHERE email = ? OR student_id = ?");
    $stmt->execute([$data['email'], $data['student_id']]);
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'อีเมลหรือรหัสนักเรียนนี้มีอยู่ในระบบแล้ว'
        ]);
        exit;
    }

    // เข้ารหัสรหัสผ่าน
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

    // เพิ่มข้อมูลนักเรียนใหม่
    $stmt = $pdo->prepare("
        INSERT INTO students (student_id, first_name, last_name, email, password, classroom, age)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $data['student_id'],
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $hashed_password,
        $data['classroom'],
        $data['age']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'ลงทะเบียนสำเร็จ'
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการลงทะเบียน'
    ]);
}
?>  