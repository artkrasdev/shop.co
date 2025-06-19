<?php
require_once '../includes/cors.php';
require_once '../sessions/session.php';

session_destroy();

header('Location: /');
exit;
?>