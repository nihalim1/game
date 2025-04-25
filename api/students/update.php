<?php
require_once '../config.php';

$data = json_decode(file_get_contents("php://input"));

if(
    !empty($data->id) &&
    !empty($data->student_id) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email) &&
    !empty($data->classroom) &&
    !empty($data->age)
) {
    $id = $data->id;
    $student_id = $data->student_id;
    $first_name = $data->first_name;
    $last_name = $data->last_name;
    $email = $data->email;
    $classroom = $data->classroom;
    $age = $data->age;
    
    // Optional password update
    if(!empty($data->password)) {
        $password = password_hash($data->password, PASSWORD_DEFAULT);
        $sql = "UPDATE students SET student_id=?, first_name=?, last_name=?, email=?, password=?, classroom=?, age=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssssis", $student_id, $first_name, $last_name, $email, $password, $classroom, $age, $id);
    } else {
        $sql = "UPDATE students SET student_id=?, first_name=?, last_name=?, email=?, classroom=?, age=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssis", $student_id, $first_name, $last_name, $email, $classroom, $age, $id);
    }
    
    if($stmt->execute()) {
        echo json_encode(array("message" => "Student updated successfully."));
    } else {
        echo json_encode(array("message" => "Unable to update student."));
    }
    
    $stmt->close();
} else {
    echo json_encode(array("message" => "Missing required fields."));
}

$conn->close();
?> 