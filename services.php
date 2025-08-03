<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

$conn = connectDatabase();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$action = isset($_GET['action']) ? $_GET['action'] : '';

function sendError($conn, $statusCode, $message) {
    http_response_code($statusCode);
    echo json_encode(["message" => $message, "error" => $conn->error]);
    closeDatabase($conn);
    exit();
}

switch ($method) {
    case 'GET':
        if ($id) {
            $sql = "SELECT * FROM services WHERE id = ?";
            $stmt = $conn->prepare($sql);
            if (!$stmt) sendError($conn, 500, "Prepare failed");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $service = $result->fetch_assoc();
            $stmt->close();

            if ($service) {
                $service['is_featured'] = (bool)$service['is_featured'];
                $service['features'] = !empty($service['features']) ? explode(',', $service['features']) : [];
                $service['benefits'] = !empty($service['benefits']) ? explode(',', $service['benefits']) : [];
                $service['images'] = !empty($service['images']) ? explode(',', $service['images']) : [];
                $service['reviews'] = !empty($service['reviews']) ? json_decode($service['reviews'], true) : [];
                echo json_encode($service);
            } else {
                sendError($conn, 404, "Service not found.");
            }
        } else {
            $sql = "SELECT * FROM services ORDER BY created_at DESC";
            $result = $conn->query($sql);
            if (!$result) sendError($conn, 500, "Query failed");
            
            $services = [];
            while ($row = $result->fetch_assoc()) {
                $row['is_featured'] = (bool)$row['is_featured'];
                $row['features'] = !empty($row['features']) ? explode(',', $row['features']) : [];
                $row['benefits'] = !empty($row['benefits']) ? explode(',', $row['benefits']) : [];
                $row['images'] = !empty($row['images']) ? explode(',', $row['images']) : [];
                $row['reviews'] = !empty($row['reviews']) ? json_decode($row['reviews'], true) : [];
                $services[] = $row;
            }
            echo json_encode($services);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) sendError($conn, 400, "Invalid JSON provided.");

        $title = $data['title'] ?? null;
        if (!$title) sendError($conn, 400, "Title is required.");
        
        $description = $data['description'] ?? '';
        $category = $data['category'] ?? 'other';
        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        $price = $data['price'] ?? null;
        $features = is_array($data['features']) ? implode(',', $data['features']) : ($data['features'] ?? '');
        $benefits = is_array($data['benefits']) ? implode(',', $data['benefits']) : ($data['benefits'] ?? '');
        $images = is_array($data['images']) ? implode(',', $data['images']) : ($data['images'] ?? '');
        $reviews = is_array($data['reviews']) ? json_encode($data['reviews']) : '[]';

        $sql = "INSERT INTO services (title, description, category, is_featured, price, features, benefits, images, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) sendError($conn, 500, "Prepare failed");
        $stmt->bind_param("sssisssss", $title, $description, $category, $is_featured, $price, $features, $benefits, $images, $reviews);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Service created successfully.", "id" => $conn->insert_id]);
        } else {
            sendError($conn, 500, "Service creation failed: " . $stmt->error);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!$id) sendError($conn, 400, "Service ID is required for update.");
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) sendError($conn, 400, "Invalid JSON provided.");

        $title = $data['title'] ?? null;
        if (!$title) sendError($conn, 400, "Title is required.");

        $description = $data['description'] ?? '';
        $category = $data['category'] ?? 'other';
        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        $price = $data['price'] ?? null;
        $features = is_array($data['features']) ? implode(',', $data['features']) : ($data['features'] ?? '');
        $benefits = is_array($data['benefits']) ? implode(',', $data['benefits']) : ($data['benefits'] ?? '');
        $images = is_array($data['images']) ? implode(',', $data['images']) : ($data['images'] ?? '');
        $reviews = is_array($data['reviews']) ? json_encode($data['reviews']) : '[]';

        $sql = "UPDATE services SET title=?, description=?, category=?, is_featured=?, price=?, features=?, benefits=?, images=?, reviews=?, updated_at=NOW() WHERE id=?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) sendError($conn, 500, "Prepare failed");
        $stmt->bind_param("sssisssssi", $title, $description, $category, $is_featured, $price, $features, $benefits, $images, $reviews, $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["message" => "Service updated successfully."]);
            } else {
                sendError($conn, 404, "Service not found or no changes made.");
            }
        } else {
            sendError($conn, 500, "Service update failed: " . $stmt->error);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!$id) sendError($conn, 400, "Service ID is required for delete.");
        
        $sql = "DELETE FROM services WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) sendError($conn, 500, "Prepare failed");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["message" => "Service deleted successfully."]);
            } else {
                sendError($conn, 404, "Service not found.");
            }
        } else {
            sendError($conn, 500, "Service deletion failed: " . $stmt->error);
        }
        $stmt->close();
        break;

    default:
        sendError($conn, 405, "Method not allowed.");
        break;
}

closeDatabase($conn);
?>