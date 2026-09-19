<?php
/**
 * تنظیمات اتصال به دیتابیس MySQL و پوشه استوریج لینوکس
 * Safe Box Tracking - Database & Local Storage Configuration
 */

// اطلاعات دیتابیس MySQL هاست
define('DB_HOST', 'localhost');
define('DB_NAME', 'safebox_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// مسیر ذخیره‌سازی عکس‌های مراحل گاوصندوق روی هارد دیسک سرور لینوکس
// بدون نیاز به خرید فضای ابری S3 یا فضای خارجی
define('UPLOADS_DIR', __DIR__ . '/uploads/');

// بررسی و ایجاد پوشه استوریج در صورت عدم وجود
if (!file_exists(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]
    );
} catch (PDOException $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'error' => 'خطا در اتصال به پایگاه داده MySQL: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
