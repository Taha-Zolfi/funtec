<?php
require_once 'config.php'; // Include the config file

$conn = connectDatabase();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stats = [
        'total_products' => 0,
        'featured_products' => 0,
        'total_news' => 0,
        // If you want to add reviews/ratings stats back, you'll need to enable these lines
        // 'total_reviews' => 0,
        // 'average_rating' => 0
    ];

    // Total Products
    $sql_total_products = "SELECT COUNT(*) FROM products";
    $stmt = $conn->prepare($sql_total_products);
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(["message" => "Prepare failed for total_products: " . $conn->error]);
        closeDatabase($conn);
        exit();
    }
    $stmt->execute();
    $stmt->bind_result($total_products);
    $stmt->fetch();
    $stats['total_products'] = $total_products;
    $stmt->close();

    // Featured Products
    $sql_featured_products = "SELECT COUNT(*) FROM products WHERE is_featured = 1";
    $stmt = $conn->prepare($sql_featured_products);
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(["message" => "Prepare failed for featured_products: " . $conn->error]);
        closeDatabase($conn);
        exit();
    }
    $stmt->execute();
    $stmt->bind_result($featured_products);
    $stmt->fetch();
    $stats['featured_products'] = $featured_products;
    $stmt->close();

    // Total News
    $sql_total_news = "SELECT COUNT(*) FROM news";
    $stmt = $conn->prepare($sql_total_news);
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(["message" => "Prepare failed for total_news: " . $conn->error]);
        closeDatabase($conn);
        exit();
    }
    $stmt->execute();
    $stmt->bind_result($total_news);
    $stmt->fetch();
    $stats['total_news'] = $total_news;
    $stmt->close();

    // Removed Total Reviews and Average Rating as per previous discussion
    // If you add them back to your frontend, uncomment the relevant parts here.

    echo json_encode($stats);

} else {
    http_response_code(405);
    echo json_encode(["message" => "Invalid request method."]);
}

closeDatabase($conn);
?>