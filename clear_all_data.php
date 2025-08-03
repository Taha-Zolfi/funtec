<?php
require_once 'config.php'; // Include the config file

// Ensure this script can only be accessed via POST to prevent accidental data deletion
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["message" => "Method not allowed. Use POST request."]);
    exit();
}

// Get a database connection
$conn = connectDatabase();

try {
    // Disable foreign key checks to allow clearing tables with dependencies
    $conn->query("SET FOREIGN_KEY_CHECKS = 0");

    // Clear products table
    $conn->query("TRUNCATE TABLE products");
    
    // Clear news table
    $conn->query("TRUNCATE TABLE news");

    // Add other tables if needed, e.g., reviews
    // $conn->query("TRUNCATE TABLE reviews");

    // Re-enable foreign key checks
    $conn->query("SET FOREIGN_KEY_CHECKS = 1");

    http_response_code(200);
    echo json_encode(["message" => "All data cleared successfully (products and news)."]);

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "Failed to clear data: " . $e->getMessage()]);
} finally {
    closeDatabase($conn);
}
?>