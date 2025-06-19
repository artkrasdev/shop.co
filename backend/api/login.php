<?php
require_once '../includes/cors.php';
require_once '../includes/config.php';
require_once '../models/User.php';  
require_once '../sessions/session.php';

$pdo = getPDOConnection();

$input = json_decode(file_get_contents("php://input"), true);

$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

$user = getUserByEmail($pdo, $email);

if ($user && password_verify($password, $user['password'])) {
    
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name']
    ];

    echo json_encode(['success' => true, 'message' => 'Login successful']);
} else {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}
