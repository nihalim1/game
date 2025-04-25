<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../db_connect.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกอีเมลและรหัสผ่าน']);
    exit();
}

// Prepare SQL statement to prevent SQL injection
$stmt = $conn->prepare("SELECT Use_ID, User_Name, User_LName, U_Email, U_password FROM user WHERE U_Email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง']);
    exit();
}

$user = $result->fetch_assoc();

// Verify password
if ($password === $user['U_password']) { // In production, you should use password_verify() with hashed passwords
    // Remove password from user data before sending
    unset($user['U_password']);
    
    echo json_encode([
        'success' => true,
        'message' => 'เข้าสู่ระบบสำเร็จ',
        'user' => $user
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง']);
}

$stmt->close();
$conn->close();
?> 