<?php
require_once '../config.php';

$sql = "SELECT * FROM students";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $students = array();
    while($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    echo json_encode($students);
} else {
    echo json_encode(array("message" => "No students found."));
}

$conn->close();
?> 