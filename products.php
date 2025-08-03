<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

$conn = connectDatabase();

$method = $_SERVER['REQUEST_METHOD'];

// Handle OPTIONS request for CORS preflight
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
            $sql = "SELECT id, title, description, is_featured, background_video,
                             features, images, specifications, reviews,
                             created_at, updated_at
                      FROM products WHERE id = ?";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                sendError($conn, 500, "Prepare failed: " . $conn->error);
            }
            $stmt->bind_param("i", $id);
            $stmt->execute();
            
            // Replaced get_result() with bind_result() and fetch() for wider compatibility
            $stmt->bind_result(
                $col_id, $col_title, $col_description, $col_is_featured,
                $col_background_video, $col_features, $col_images,
                $col_specifications, $col_reviews, $col_created_at,
                $col_updated_at
            );
            $product = null;
            if ($stmt->fetch()) {
                $product = [
                    'id' => $col_id,
                    'title' => $col_title,
                    'description' => $col_description,
                    'is_featured' => $col_is_featured,
                    'background_video' => $col_background_video,
                    'features' => $col_features,
                    'images' => $col_images,
                    'specifications' => $col_specifications,
                    'reviews' => $col_reviews,
                    'created_at' => $col_created_at,
                    'updated_at' => $col_updated_at
                ];
            }
            $stmt->close();

            if ($product) {
                // Decode JSON strings back into arrays/objects
                $product['features'] = !empty($product['features']) ? explode(',', $product['features']) : [];
                $product['images'] = !empty($product['images']) ? explode(',', $product['images']) : [];
                $product['specifications'] = !empty($product['specifications']) ? json_decode($product['specifications'], true) : [];
                $product['reviews'] = !empty($product['reviews']) ? json_decode($product['reviews'], true) : [];

                echo json_encode($product);
            } else {
                sendError($conn, 404, "Product not found.");
            }
        } else {
            $sql = "SELECT id, title, description, is_featured, background_video,
                             features, images, specifications, reviews,
                             created_at, updated_at
                      FROM products";
            $result = $conn->query($sql);
            if ($result === false) {
                 sendError($conn, 500, "Query failed: " . $conn->error);
            }

            $products = [];
            while ($row = $result->fetch_assoc()) {
                // Decode JSON strings back into arrays/objects
                $row['features'] = !empty($row['features']) ? explode(',', $row['features']) : [];
                $row['images'] = !empty($row['images']) ? explode(',', $row['images']) : [];
                $row['specifications'] = !empty($row['specifications']) ? json_decode($row['specifications'], true) : [];
                $row['reviews'] = !empty($row['reviews']) ? json_decode($row['reviews'], true) : [];

                $products[] = $row;
            }
            echo json_encode($products);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data === null) {
            sendError($conn, 400, "Invalid JSON provided.");
        }

        $features = is_array($data['features'] ?? null) ? implode(',', $data['features']) : ($data['features'] ?? '');
        $images = is_array($data['images'] ?? null) ? implode(',', $data['images']) : ($data['images'] ?? '');
        $specifications = is_array($data['specifications'] ?? null) ? json_encode($data['specifications']) : (is_string($data['specifications'] ?? null) ? $data['specifications'] : '[]');
        $reviews = is_array($data['reviews'] ?? null) ? json_encode($data['reviews']) : '[]';

        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        $background_video = $data['background_video'] ?? null;
        $title = $data['title'] ?? null;
        $description = $data['description'] ?? null;

        if (!$title || !$description) {
            sendError($conn, 400, "Title and description are required.");
        }

        $sql = "INSERT INTO products (title, description, is_featured, background_video,
                                      features, images, specifications, reviews,
                                      created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            sendError($conn, 500, "Prepare failed: " . $conn->error);
        }
        $stmt->bind_param("ssisssss", $title, $description, $is_featured, $background_video,
                                     $features, $images, $specifications, $reviews);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Product created successfully.", "id" => $conn->insert_id]);
        } else {
            sendError($conn, 500, "Product creation failed: " . $stmt->error);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data === null) {
            sendError($conn, 400, "Invalid JSON provided.");
        }

        if ($action === 'add_review' && $id) {
            $newReview = $data['review'] ?? null;
            if (!$newReview) {
                sendError($conn, 400, "Review data is required.");
            }

            $sql_get = "SELECT reviews FROM products WHERE id = ?";
            $stmt_get = $conn->prepare($sql_get);
            if ($stmt_get === false) {
                sendError($conn, 500, "Prepare failed: " . $conn->error);
            }
            $stmt_get->bind_param("i", $id);
            $stmt_get->execute();

            // Replaced get_result() with bind_result() and fetch() for compatibility
            $stmt_get->bind_result($col_reviews);
            $row = null;
            if ($stmt_get->fetch()) {
                $row = ['reviews' => $col_reviews];
            }
            $stmt_get->close();

            if (!$row) {
                sendError($conn, 404, "Product not found.");
            }

            $reviews_array = !empty($row['reviews']) ? json_decode($row['reviews'], true) : [];
            $reviews_array[] = array_merge($newReview, ['created_at' => date('Y-m-d H:i:s')]);
            $updated_reviews_json = json_encode($reviews_array);

            $sql_update = "UPDATE products SET reviews = ?, updated_at = NOW() WHERE id = ?";
            $stmt_update = $conn->prepare($sql_update);
            if ($stmt_update === false) {
                sendError($conn, 500, "Prepare failed: " . $conn->error);
            }
            $stmt_update->bind_param("si", $updated_reviews_json, $id);

            if ($stmt_update->execute()) {
                if ($stmt_update->affected_rows > 0) {
                    echo json_encode(["message" => "Review added successfully."]);
                } else {
                    sendError($conn, 404, "Product not found or no changes made.");
                }
            } else {
                sendError($conn, 500, "Failed to add review: " . $stmt_update->error);
            }
            $stmt_update->close();

        } else {
            // Original PUT logic for updating product details
            if (!$id) {
                sendError($conn, 400, "Product ID is required for update.");
            }

            $features = is_array($data['features'] ?? null) ? implode(',', $data['features']) : ($data['features'] ?? '');
            $images = is_array($data['images'] ?? null) ? implode(',', $data['images']) : ($data['images'] ?? '');
            $specifications = is_array($data['specifications'] ?? null) ? json_encode($data['specifications']) : (is_string($data['specifications'] ?? null) ? $data['specifications'] : '[]');
            $reviews = is_array($data['reviews'] ?? null) ? json_encode($data['reviews']) : '[]';

            $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
            $background_video = $data['background_video'] ?? null;
            $title = $data['title'] ?? null;
            $description = $data['description'] ?? null;

            $sql = "UPDATE products SET title = ?, description = ?, is_featured = ?, background_video = ?,
                                       features = ?, images = ?, specifications = ?, reviews = ?,
                                       updated_at = NOW()
                      WHERE id = ?";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                sendError($conn, 500, "Prepare failed: " . $conn->error);
            }
            $stmt->bind_param("ssisssssi", $title, $description, $is_featured, $background_video,
                                         $features, $images, $specifications, $reviews, $id);
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(["message" => "Product updated successfully."]);
                } else {
                    sendError($conn, 404, "Product not found or no changes made.");
                }
            } else {
                sendError($conn, 500, "Product update failed: " . $stmt->error);
            }
            $stmt->close();
        }
        break;

    case 'DELETE':
        if (!$id) {
            sendError($conn, 400, "Product ID is required for delete.");
        }

        $sql = "DELETE FROM products WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            sendError($conn, 500, "Prepare failed: " . $conn->error);
        }
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["message" => "Product deleted successfully."]);
            } else {
                sendError($conn, 404, "Product not found.");
            }
        } else {
            sendError($conn, 500, "Product deletion failed: " . $stmt->error);
        }
        $stmt->close();
        break;

    default:
        sendError($conn, 405, "Method not allowed.");
        break;
}

closeDatabase($conn);
?>