<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method Not Allowed"
    ]);
    exit();
}

try {
    // Include database connection
    require_once __DIR__ . '/config/database.php';
    
    $stmt = $conn->prepare("SELECT game_key, category, game_order, enabled FROM game_settings");
    $stmt->execute();
    
    $settings = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['game_key']] = [
            'category' => $row['category'],
            'order' => (int)$row['game_order'],
            'enabled' => (bool)$row['enabled']
        ];
    }
    
    echo json_encode([
        "status" => "success",
        "data" => $settings
    ]);
} catch (Exception $e) {
    error_log("Error in get_game_settings.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Internal server error"
    ]);
} finally {
    if (isset($conn)) {
        $conn = null;
    }
}
?> 