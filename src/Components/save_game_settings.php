<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data");
    }

    if (!is_array($data)) {
        throw new Exception("Data must be an array");
    }

    $conn->beginTransaction();
    $stmt = $conn->prepare("UPDATE game_settings SET 
        category = :category,
        game_order = :game_order,
        enabled = :enabled
        WHERE game_key = :game_key");

    foreach ($data as $gameKey => $settings) {
        if (!isset($settings['category'], $settings['order'], $settings['enabled'])) {
            throw new Exception("Invalid settings format for game: $gameKey");
        }

        $stmt->bindParam(':game_key', $gameKey);
        $stmt->bindParam(':category', $settings['category']);
        $stmt->bindParam(':game_order', intval($settings['order']), PDO::PARAM_INT);
        $stmt->bindParam(':enabled', $settings['enabled'] ? 1 : 0, PDO::PARAM_BOOL);
        $stmt->execute();
    }

    $conn->commit();
    echo json_encode([
        "status" => "success",
        "message" => "Game settings updated successfully"
    ]);
} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log("Error in save_game_settings.php: " . $e->getMessage());
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