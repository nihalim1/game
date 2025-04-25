<?php
// กำหนดการแสดงข้อผิดพลาดเพื่อการแก้ไขปัญหา
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// กำหนดค่า CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// จัดการกับ OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ตรวจสอบ method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// รับข้อมูล JSON
$json = file_get_contents('php://input');

// ตรวจสอบว่ามีข้อมูล JSON หรือไม่
if (empty($json)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ไม่พบข้อมูล JSON'
    ]);
    exit();
}

// แปลง JSON เป็น array
$data = json_decode($json, true);

// ตรวจสอบการแปลง JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ข้อมูล JSON ไม่ถูกต้อง: ' . json_last_error_msg()
    ]);
    exit();
}

// ตรวจสอบข้อมูลที่จำเป็น
if (!isset($data['name']) || !isset($data['lname']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'กรุณากรอกข้อมูลให้ครบถ้วน'
    ]);
    exit();
}

// ตรวจสอบความยาวของข้อมูล
$name = trim($data['name']);
$lname = trim($data['lname']);
$email = trim($data['email']);
$password = $data['password'];

// ตรวจสอบความยาวของชื่อและนามสกุล
if (strlen($name) < 2 || strlen($lname) < 2) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'ชื่อและนามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร'
    ]);
    exit();
}

// ตรวจสอบรูปแบบอีเมล
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'รูปแบบอีเมลไม่ถูกต้อง'
    ]);
    exit();
}

// ตรวจสอบความยาวของรหัสผ่าน
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'
    ]);
    exit();
}

// เชื่อมต่อฐานข้อมูล
try {
    $host = 'localhost';
    $dbname = '6560704011';
    $username = '6560704011';
    $password = '6560704011';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $conn = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล: ' . $e->getMessage()
    ]);
    exit();
}

try {
    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    $checkEmail = $conn->prepare("SELECT id FROM teachers WHERE email = ?");
    $checkEmail->execute([$email]);
    
    if ($checkEmail->rowCount() > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'อีเมลนี้ถูกใช้งานแล้ว'
        ]);
        exit();
    }

    // Hash รหัสผ่าน
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // ตรวจสอบว่าตาราง teachers มีอยู่หรือไม่
    $checkTable = $conn->query("SHOW TABLES LIKE 'teachers'");
    
    if ($checkTable->rowCount() === 0) {
        // สร้างตารางหากยังไม่มี
        $createTable = "CREATE TABLE teachers (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            lname VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $conn->exec($createTable);
    }

    // เพิ่มข้อมูลครูใหม่
    $stmt = $conn->prepare("INSERT INTO teachers (name, lname, email, password, created_at) VALUES (?, ?, ?, ?, NOW())");
    $result = $stmt->execute([$name, $lname, $email, $hashedPassword]);
    
    if (!$result) {
        throw new PDOException("การบันทึกข้อมูลล้มเหลว");
    }

    echo json_encode([
        'success' => true,
        'message' => 'ลงทะเบียนสำเร็จ'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการลงทะเบียน: ' . $e->getMessage()
    ]);
    // บันทึก error ลงไฟล์ log
    error_log('Database error: ' . $e->getMessage());
}
?> 