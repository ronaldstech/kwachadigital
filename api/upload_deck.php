<?php
// Remove trailing slash from origin
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Configure upload directory
$uploadDir = __DIR__ . '/uploads/'; 
$baseUrl = 'https://unimarket-mw.com/kwachadigital/api/uploads/';

// Create uploads folder if it doesn't exist
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['file']['tmp_name'];
        $fileName = $_FILES['file']['name'];
        $fileType = $_FILES['file']['type'];

        // Allowed types: PDF and PPTX
        $allowedTypes = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        // Some systems might use different mimes for PPTX, so we also check extension
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExts = ['pdf', 'pptx'];

        if (!in_array($fileType, $allowedTypes) && !in_array($fileExt, $allowedExts)) {
            echo json_encode(['error' => 'Invalid file type. Only PDF and PPTX allowed.']);
            exit;
        }

        $newFileName = uniqid('deck_', true) . '.' . $fileExt;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $destPath)) {
            $fileUrl = $baseUrl . $newFileName;
            echo json_encode(['url' => $fileUrl]);
        } else {
            echo json_encode(['error' => 'Failed to move uploaded file.']);
        }
    } else {
        $errorMsg = isset($_FILES['file']) ? 'Upload error code: ' . $_FILES['file']['error'] : 'No file uploaded.';
        echo json_encode(['error' => $errorMsg]);
    }
} else {
    echo json_encode(['error' => 'Invalid request method.']);
}
?>
