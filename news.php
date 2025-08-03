<?php
require_once 'config.php'; // Include the config file

$conn = connectDatabase();

$method = $_SERVER['REQUEST_METHOD'];

// Parse URL for ID (e.g., /api/news.php?id=123)
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

switch ($method) {
    case 'GET':
        if ($id) {
            // Read single news item
            $sql = "SELECT id, title, excerpt, content, description, author, category, image, is_featured, views, created_at, updated_at
                    FROM news WHERE id = ?";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                http_response_code(500);
                echo json_encode(["message" => "Prepare failed: " . $conn->error]);
                closeDatabase($conn);
                exit();
            }
            $stmt->bind_param("i", $id);
            $stmt->execute();
            
            $stmt->bind_result(
                $id_res, $title_res, $excerpt_res, $content_res, $description_res, $author_res, $category_res, 
                $image_res, $is_featured_res, $views_res, $created_at_res, $updated_at_res
            );

            $news_item = null;
            if ($stmt->fetch()) {
                $news_item = [
                    'id' => $id_res,
                    'title' => $title_res,
                    'excerpt' => $excerpt_res, // Added excerpt
                    'content' => $content_res,
                    'description' => $description_res, // Added description
                    'author' => $author_res,
                    'category' => $category_res,
                    'image' => $image_res,
                    'is_featured' => (bool)$is_featured_res,
                    'views' => $views_res,
                    'created_at' => $created_at_res,
                    'updated_at' => $updated_at_res
                ];
            }
            $stmt->close();

            if ($news_item) {
                echo json_encode($news_item);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "News item not found."]);
            }
        } else {
            // Read all news items
            $sql = "SELECT id, title, excerpt, content, description, author, category, image, is_featured, views, created_at, updated_at FROM news";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                http_response_code(500);
                echo json_encode(["message" => "Prepare failed: " . $conn->error]);
                closeDatabase($conn);
                exit();
            }
            $stmt->execute();
            
            $stmt->bind_result(
                $id_res, $title_res, $excerpt_res, $content_res, $description_res, $author_res, $category_res, 
                $image_res, $is_featured_res, $views_res, $created_at_res, $updated_at_res
            );

            $news_items = [];
            while ($stmt->fetch()) {
                $news_items[] = [
                    'id' => $id_res,
                    'title' => $title_res,
                    'excerpt' => $excerpt_res, // Added excerpt
                    'content' => $content_res,
                    'description' => $description_res, // Added description
                    'author' => $author_res,
                    'category' => $category_res,
                    'image' => $image_res,
                    'is_featured' => (bool)$is_featured_res,
                    'views' => $views_res,
                    'created_at' => $created_at_res,
                    'updated_at' => $updated_at_res
                ];
            }
            $stmt->close();
            echo json_encode($news_items);
        }
        break;

    case 'POST':
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data === null) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid JSON provided."]);
            closeDatabase($conn);
            exit();
        }

        $title = $data['title'] ?? null;
        $excerpt = $data['excerpt'] ?? null; // Added excerpt
        $content = $data['content'] ?? null;
        $description = $data['description'] ?? null; // Added description
        $author = $data['author'] ?? null;
        $category = $data['category'] ?? null;
        $image = $data['image'] ?? null;
        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        $views = isset($data['views']) ? (int)$data['views'] : 0;

        if ($method === 'POST') {
            if (!$title || !$content) {
                http_response_code(400);
                echo json_encode(["message" => "Title and content are required."]);
                closeDatabase($conn);
                exit();
            }

            $sql = "INSERT INTO news (title, excerpt, content, description, author, category, image, is_featured, views, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                http_response_code(500);
                echo json_encode(["message" => "Prepare failed: " . $conn->error]);
                closeDatabase($conn);
                exit();
            }
            $stmt->bind_param("ssssssssi", $title, $excerpt, $content, $description, $author, $category, $image, $is_featured, $views);

        } elseif ($method === 'PUT') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(["message" => "News ID is required for update."]);
                closeDatabase($conn);
                exit();
            }

            $sql = "UPDATE news SET title = ?, excerpt = ?, content = ?, description = ?, author = ?, category = ?, image = ?, is_featured = ?, views = ?, updated_at = NOW()
                    WHERE id = ?";
            $stmt = $conn->prepare($sql);
            if ($stmt === false) {
                http_response_code(500);
                echo json_encode(["message" => "Prepare failed: " . $conn->error]);
                closeDatabase($conn);
                exit();
            }
            $stmt->bind_param("ssssssssii", $title, $excerpt, $content, $description, $author, $category, $image, $is_featured, $views, $id);
        }

        if ($stmt->execute()) {
            if ($method === 'POST') {
                echo json_encode(["message" => "News item created successfully.", "id" => $conn->insert_id]);
            } else {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(["message" => "News item updated successfully."]);
                } else {
                    http_response_code(404);
                    echo json_encode(["message" => "News item not found or no changes made."]);
                }
            }
        } else {
            http_response_code(500);
            echo json_encode(["message" => $method === 'POST' ? "News item creation failed: " . $stmt->error : "News item update failed: " . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "News ID is required for delete."]);
            closeDatabase($conn);
            exit();
        }

        $sql = "DELETE FROM news WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            http_response_code(500);
            echo json_encode(["message" => "Prepare failed: " . $conn->error]);
            closeDatabase($conn);
            exit();
        }
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["message" => "News item deleted successfully."]);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "News item not found."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["message" => "News item deletion failed: " . $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed."]);
        break;
}

closeDatabase($conn);
?>