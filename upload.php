<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Specify the directory where uploaded files will be stored.
// This path is relative to the current script's location.
$upload_directory = __DIR__ . '/../uploads/';

// Specify the base URL path to access the files from the web
// This assumes 'uploads' is a sibling of the 'api' directory and directly accessible.
$uploads_base_url = '/uploads/';

// Function to send a consistent JSON error response
function sendError($statusCode, $message) {
    http_response_code($statusCode);
    echo json_encode(["message" => $message]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];

        // Basic validation
        if ($file['error'] !== UPLOAD_ERR_OK) {
            sendError(500, "File upload error: " . $file['error']);
        }
        
        // Ensure the upload directory exists
        if (!is_dir($upload_directory)) {
            if (!mkdir($upload_directory, 0755, true)) {
                sendError(500, "Failed to create upload directory.");
            }
        }

        // Generate a unique file name to prevent overwrites and security issues
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $unique_filename = uniqid('upload_', true) . '.' . $file_extension;
        $destination_path = $upload_directory . $unique_filename;

        // Move the uploaded file to the destination directory
        if (move_uploaded_file($file['tmp_name'], $destination_path)) {
            // Construct the URL to access the uploaded file
            $file_url = $uploads_base_url . $unique_filename;

            http_response_code(200);
            echo json_encode([
                "message" => "File uploaded successfully.",
                "filename" => $unique_filename,
                "url" => $file_url
            ]);
        } else {
            sendError(500, "Failed to move uploaded file.");
        }
    } else {
        sendError(400, "No file uploaded or file input name is not 'file'.");
    }
} else {
    sendError(405, "Method not allowed. Use POST request for uploads.");
}
?>