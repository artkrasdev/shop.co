<?php
require_once '../includes/cors.php';
require_once '../sessions/session.php';

header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    echo json_encode([
        'loggedIn' => true,
        'user' => $_SESSION['user']
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'loggedIn' => false,
        'message' => 'Not authenticated'
    ]);
}
