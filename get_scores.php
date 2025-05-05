<?php
// --- CORS & Content-Type ---
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
if ($origin === 'http://localhost:3000' || $origin === 'https://mgt2.pnu.ac.th') {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header('Content-Type: application/json');

// --- Preflight OPTIONS ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Database Connection ---
$host = 'localhost';
$user = '6560704011';
$pass = '6560704011';
$dbname = '6560704011';
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// --- Get student_id from GET or POST ---
$student_id = '';
if (isset($_GET['student_id'])) {
    $student_id = trim($_GET['student_id']);
} elseif (isset($_POST['student_id'])) {
    $student_id = trim($_POST['student_id']);
}
if ($student_id === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing student_id']);
    exit();
}

// --- Query scores ---
try {
    $stmt = $pdo->prepare("SELECT id, student_id, game_type, score, stars, created_at FROM game_scores WHERE student_id = ? ORDER BY created_at DESC, id DESC");
    $stmt->execute([$student_id]);
    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $scores]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?> 