<?php
// Database connection details
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'funtec_ghofran'); // <-- نام کاربری دیتابیس خود را اینجا قرار دهید
define('DB_PASSWORD', 'Mmvv@4095056');   // <-- رمز عبور دیتابیس خود را اینجا قرار دهید
define('DB_NAME', 'funtec_funtec_db');     // <-- نام دیتابیس خود را اینجا قرار دهید

// Optional: Set timezone if needed
// date_default_timezone_set('Asia/Tehran');

// Set headers for CORS
header("Access-Control-Allow-Origin: *"); // Allowed for any origin, good for development
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Function to establish database connection
function connectDatabase() {
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Check connection
    if ($conn->connect_error) {
        // Log the error for debugging, but don't expose sensitive info to client
        error_log("Connection failed: " . $conn->connect_error);
        http_response_code(500); // Internal Server Error
        echo json_encode(["message" => "Database connection failed."]);
        exit();
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Function to close database connection
function closeDatabase($conn) {
    if ($conn) {
        $conn->close();
    }
}
?>