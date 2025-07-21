<?php
require_once '../includes/cors.php';
require_once '../includes/config.php';
require_once '../models/Cart.php';
require_once '../sessions/session.php';

header('Content-Type: application/json');

$pdo = null;
if (isset($_SESSION['user'])) {
    $pdo = getPDOConnection();
}

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    switch ($method) {
        case 'GET':
            if ($pdo) {
                $resp = getCartFromDB($pdo, $_SESSION['user']['id']);
            } else {
                $resp = getSessionCart();
            }
            echo json_encode($resp);
            break;

        case 'POST':
            if ($pdo) {
                $resp = addOrUpdateItemDB($pdo, $_SESSION['user']['id'], $input);
            } else {
                $resp = addOrUpdateSession($input);
            }
            echo json_encode($resp);
            break;

        case 'PUT':
            parse_str($_SERVER['QUERY_STRING'] ?? '', $q);
            $lineId = $q['line_id'] ?? null;
            $qty    = (int)($input['qty'] ?? 0);
            if (!$lineId) {
                http_response_code(400);
                echo json_encode(['error' => 'line_id required']);
                exit;
            }
            if ($pdo) {
                $resp = setLineQuantityDB($pdo, $_SESSION['user']['id'], (int)$lineId, $qty);
            } else {
                $resp = setLineQuantitySession($lineId, $qty);
            }
            echo json_encode($resp);
            break;

        case 'DELETE':
            parse_str($_SERVER['QUERY_STRING'] ?? '', $q);
            $lineId = $q['line_id'] ?? null;
            if (!$lineId) {
                http_response_code(400);
                echo json_encode(['error' => 'line_id required']);
                exit;
            }
            if ($pdo) {
                $resp = setLineQuantityDB($pdo, $_SESSION['user']['id'], (int)$lineId, 0);
            } else {
                $resp = setLineQuantitySession($lineId, 0);
            }
            echo json_encode($resp);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 