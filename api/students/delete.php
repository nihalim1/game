<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    $id = $data->id;
    
    $sql = "DELETE FROM students WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if($stmt->execute()) {
        echo json_encode(array("message" => "Student deleted successfully."));
    } else {
        echo json_encode(array("message" => "Unable to delete student."));
    }
    
    $stmt->close();
} else {
    echo json_encode(array("message" => "Missing ID parameter."));
}

$conn->close();
?> 