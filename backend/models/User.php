<?php
include_once '../includes/config.php';

function getUserByEmail(PDO $pdo, string $email): ?array {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
}

function createUser(PDO $pdo, string $email, string $password, string $name = null): bool {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
    return $stmt->execute([$email, $hashedPassword, $name]);
}

