<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($_GET['id'])) {
    $id = $_GET['id'];
    
    $sql = "SELECT * FROM students WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if($result->num_rows > 0) {
        $student = $result->fetch_assoc();
        echo json_encode($student);
    } else {
        echo json_encode(array("message" => "Student not found."));
    }
    
    $stmt->close();
} else {
    echo json_encode(array("message" => "Missing ID parameter."));
}

$conn->close();
?> 