<?php
/**
 * ای‌پی‌آی کامل PHP برای سامانه مدیریت و رهگیری ساخت گاوصندوق
 * API Endpoints: Auth, Customers, Projects, Stages (Local Storage), Messages
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST;

switch ($action) {
    // ۱. ورود به سیستم (ادمین یا مشتری)
    case 'login':
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'نام کاربری و رمز عبور الزامی است.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // بررسی ادمین
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = ? AND password = ?");
        $stmt->execute([$username, $password]);
        $admin = $stmt->fetch();
        if ($admin) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'role' => 'admin',
                    'id' => (string)$admin['id'],
                    'username' => $admin['username'],
                    'name' => $admin['name']
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // بررسی مشتری
        $stmt = $pdo->prepare("SELECT * FROM customers WHERE LOWER(username) = LOWER(?) AND password = ?");
        $stmt->execute([$username, $password]);
        $customer = $stmt->fetch();
        if ($customer) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'role' => 'customer',
                    'id' => (string)$customer['id'],
                    'username' => $customer['username'],
                    'name' => $customer['name']
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        http_response_code(401);
        echo json_encode(['error' => 'نام کاربری یا کلمه عبور نادرست است.'], JSON_UNESCAPED_UNICODE);
        break;

    // ۲. تغییر مشخصات و رمز عبور ادمین
    case 'change_admin':
        $currentPass = trim($input['currentPassword'] ?? '');
        $newUsername = trim($input['newUsername'] ?? '');
        $newPassword = trim($input['newPassword'] ?? '');

        $stmt = $pdo->prepare("SELECT * FROM admins WHERE password = ? LIMIT 1");
        $stmt->execute([$currentPass]);
        $admin = $stmt->fetch();

        if (!$admin) {
            http_response_code(400);
            echo json_encode(['error' => 'رمز عبور فعلی ادمین اشتباه است.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE admins SET username = ?, password = ? WHERE id = ?");
        $stmt->execute([$newUsername, $newPassword, $admin['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'نام کاربری و رمز عبور ادمین با موفقیت تغییر یافت.'
        ], JSON_UNESCAPED_UNICODE);
        break;

    // ۳. لیست و افزودن مشتریان (با تولید رمز خودکار سال شمسی + نام کاربری)
    case 'customers':
        if ($method === 'GET') {
            $stmt = $pdo->query("
                SELECT c.*, COUNT(p.id) as projectsCount 
                FROM customers c 
                LEFT JOIN projects p ON p.customer_id = c.id 
                GROUP BY c.id 
                ORDER BY c.id DESC
            ");
            echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
        } elseif ($method === 'POST') {
            $name = trim($input['name'] ?? '');
            $username = strtolower(trim($input['username'] ?? ''));
            $phone = trim($input['phone'] ?? '');
            $address = trim($input['address'] ?? '');
            $notes = trim($input['notes'] ?? '');
            $customPassword = trim($input['customPassword'] ?? '');

            if (empty($name) || empty($username) || empty($phone)) {
                http_response_code(400);
                echo json_encode(['error' => 'نام، نام کاربری و تلفن الزامی هستند.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // رمز بر اساس سال شمسی + نام کاربری مشتری (مانند 1405username)
            $password = !empty($customPassword) ? $customPassword : ('1405' . $username);

            $stmt = $pdo->prepare("INSERT INTO customers (name, username, password, phone, address, notes) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $username, $password, $phone, $address, $notes]);

            echo json_encode([
                'success' => true,
                'message' => 'مشتری جدید با موفقیت ثبت شد.',
                'customer' => [
                    'id' => (string)$pdo->lastInsertId(),
                    'name' => $name,
                    'username' => $username,
                    'password' => $password,
                    'phone' => $phone
                ]
            ], JSON_UNESCAPED_UNICODE);
        }
        break;

    // ۴. لیست و تعریف پروژه‌های ساخت گاوصندوق
    case 'projects':
        if ($method === 'GET') {
            $customerId = $_GET['customerId'] ?? null;
            $sql = "
                SELECT p.*, c.name as customerName, c.phone as customerPhone,
                       (SELECT COUNT(*) FROM stages s WHERE s.project_id = p.id) as stagesCount,
                       (SELECT COUNT(*) FROM stages s WHERE s.project_id = p.id AND s.completed = 1) as completedStagesCount,
                       (SELECT COUNT(*) FROM messages m WHERE m.project_id = p.id) as messagesCount
                FROM projects p 
                JOIN customers c ON p.customer_id = c.id
            ";
            $params = [];
            if ($customerId) {
                $sql .= " WHERE p.customer_id = ?";
                $params[] = $customerId;
            }
            $sql .= " ORDER BY p.id DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
        } elseif ($method === 'POST') {
            $customerId = $input['customerId'] ?? 0;
            $title = trim($input['title'] ?? '');
            $safeType = trim($input['safeType'] ?? 'سفارشی ضد سرقت');
            $dimensions = trim($input['dimensions'] ?? 'استاندارد');
            $weight = trim($input['weight'] ?? 'نامشخص');
            $lockType = trim($input['lockType'] ?? 'مکانیکی و دیجیتال');
            $startDate = trim($input['startDate'] ?? '۱۴۰۵/۰۱/۰۱');
            $estimatedDelivery = trim($input['estimatedDelivery'] ?? '۱۴۰۵/۰۲/۰۱');
            $notes = trim($input['notes'] ?? '');

            $stmt = $pdo->prepare("
                INSERT INTO projects (customer_id, title, safe_type, dimensions, weight, lock_type, start_date, estimated_delivery, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$customerId, $title, $safeType, $dimensions, $weight, $lockType, $startDate, $estimatedDelivery, $notes]);

            echo json_encode([
                'success' => true,
                'message' => 'پروژه ساخت گاوصندوق ایجاد شد.',
                'projectId' => (string)$pdo->lastInsertId()
            ], JSON_UNESCAPED_UNICODE);
        }
        break;

    // ۵. آپلود مرحله با عکس در استوریج هارد لینوکس (بدون هزینه کلود)
    case 'add_stage':
        $projectId = $_POST['projectId'] ?? 0;
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $date = trim($_POST['date'] ?? date('Y-m-d'));
        $completed = (isset($_POST['completed']) && ($_POST['completed'] == '1' || $_POST['completed'] === 'true')) ? 1 : 0;

        if (empty($title)) {
            http_response_code(400);
            echo json_encode(['error' => 'عنوان مرحله الزامی است.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $imageUrl = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $validExts = ['jpg', 'jpeg', 'png', 'webp'];
            if (!in_array($ext, $validExts)) {
                http_response_code(400);
                echo json_encode(['error' => 'فرمت تصویر معتبر نیست.'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $filename = 'safe_stage_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
            $destPath = UPLOADS_DIR . $filename;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
                $imageUrl = 'uploads/' . $filename;
            }
        }

        if (empty($imageUrl)) {
            $imageUrl = $_POST['imageUrl'] ?? 'uploads/default_safe.jpg';
        }

        $stmt = $pdo->prepare("
            INSERT INTO stages (project_id, title, description, image_url, completed, stage_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$projectId, $title, $description, $imageUrl, $completed, $date]);

        echo json_encode([
            'success' => true,
            'message' => 'مرحله ساخت با موفقیت در استوریج لینوکس ذخیره شد.',
            'stageId' => (string)$pdo->lastInsertId(),
            'imageUrl' => $imageUrl
        ], JSON_UNESCAPED_UNICODE);
        break;

    // ۶. ارسال و دریافت پیام‌های پروژه
    case 'messages':
        if ($method === 'GET') {
            $projectId = $_GET['projectId'] ?? 0;
            $stmt = $pdo->prepare("SELECT * FROM messages WHERE project_id = ? ORDER BY id ASC");
            $stmt->execute([$projectId]);
            echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
        } elseif ($method === 'POST') {
            $projectId = $input['projectId'] ?? 0;
            $sender = $input['sender'] ?? 'customer';
            $senderName = $input['senderName'] ?? '';
            $content = trim($input['content'] ?? '');
            $replyToId = $input['replyToId'] ?? null;

            if (empty($content)) {
                http_response_code(400);
                echo json_encode(['error' => 'متن پیام الزامی است.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO messages (project_id, sender, sender_name, content, reply_to_id) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$projectId, $sender, $senderName, $content, $replyToId]);

            echo json_encode([
                'success' => true,
                'message' => 'پیام با موفقیت ثبت شد.',
                'messageId' => (string)$pdo->lastInsertId()
            ], JSON_UNESCAPED_UNICODE);
        }
        break;

    default:
        echo json_encode([
            'status' => 'online',
            'system' => 'سامانه مدیریت و رهگیری ساخت گاوصندوق (بک‌اند PHP و MySQL)',
            'time' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        break;
}
