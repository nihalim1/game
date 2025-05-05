<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
include_once 'config/database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

try {
    // Begin transaction
    $conn->beginTransaction();

    // Prepare update statement
    $stmt = $conn->prepare("UPDATE game_settings SET 
        category = :category,
        game_order = :game_order,
        enabled = :enabled
        WHERE game_key = :game_key");

    // Process each game setting
    foreach ($data as $gameKey => $settings) {
        $stmt->bindParam(':game_key', $gameKey);
        $stmt->bindParam(':category', $settings->category);
        $stmt->bindParam(':game_order', $settings->order);
        $stmt->bindParam(':enabled', $settings->enabled, PDO::PARAM_BOOL);
        
        if (!$stmt->execute()) {
            throw new Exception("Error updating game settings for $gameKey");
        }
    }

    // Commit transaction
    $conn->commit();

    // Send success response
    http_response_code(200);
    echo json_encode(array(
        "status" => "success",
        "message" => "Game settings updated successfully"
    ));

} catch (Exception $e) {
    // Rollback transaction on error
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    // Send error response
    http_response_code(500);
    echo json_encode(array(
        "status" => "error",
        "message" => "Error updating game settings: " . $e->getMessage()
    ));
}

// Close connection
$conn = null;
?> 