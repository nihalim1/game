<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

// รับข้อมูล JSON จาก request
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'กรุณากรอกอีเมลและรหัสผ่าน'
    ]);
    exit;
}

try {
    // ค้นหานักเรียนจากอีเมล
    $stmt = $pdo->prepare("SELECT * FROM students WHERE email = ?");
    $stmt->execute([$data['email']]);
    $student = $stmt->fetch();

    if ($student && password_verify($data['password'], $student['password'])) {
        // ลบรหัสผ่านออกก่อนส่งข้อมูลกลับ
        unset($student['password']);
        
        echo json_encode([
            'success' => true,
            'message' => 'เข้าสู่ระบบสำเร็จ',
            'data' => $student
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        ]);
    }
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    ]);
}
?> 