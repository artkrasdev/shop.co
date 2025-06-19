<?php
require_once '../includes/cors.php';
require_once '../includes/config.php';
require_once '../models/User.php';
require_once '../sessions/session.php';

$pdo = getPDOConnection();

$input = json_decode(file_get_contents("php://input"), true);

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$name = trim($input['name'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

if (getUserByEmail($pdo, $email)) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Email is already registered']);
    exit;
}

if (createUser($pdo, $email, $password, $name)) {
    echo json_encode(['success' => true, 'message' => 'Registration successful']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error during registration']);
}
