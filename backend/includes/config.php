<?php

define('DB_HOST', 'localhost');
define('DB_PORT', '8888');
define('DB_NAME', 'shop.co');
define('DB_USER', 'root');
define('DB_PASS', 'root'); 

function getPDOConnection() {
    try {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME;
        $options = [
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}

?>