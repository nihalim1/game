<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->student_id) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->classroom) &&
    !empty($data->age)
) {
    $student_id = $data->student_id;
    $first_name = $data->first_name;
    $last_name = $data->last_name;
    $email = $data->email;
    $password = password_hash($data->password, PASSWORD_DEFAULT); // Hash password
    $classroom = $data->classroom;
    $age = $data->age;
    
    $sql = "INSERT INTO students (student_id, first_name, last_name, email, password, classroom, age) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssssi", $student_id, $first_name, $last_name, $email, $password, $classroom, $age);
    
    if($stmt->execute()) {
        echo json_encode(array("message" => "Student created successfully."));
    } else {
        echo json_encode(array("message" => "Unable to create student."));
    }
    
    $stmt->close();
} else {
    echo json_encode(array("message" => "Missing required fields."));
}

$conn->close();
?> 