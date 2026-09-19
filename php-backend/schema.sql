-- ====================================================
-- اسکریپت دیتابیس MySQL برای سامانه مدیریت و رهگیری ساخت گاوصندوق
-- Database Schema for Safe Box Manufacturing Tracking System
-- ====================================================

CREATE DATABASE IF NOT EXISTS `safebox_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `safebox_db`;

-- جدول مدیر سیستم
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) DEFAULT 'مدیریت کارخانه گاوصندوق',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- افزودن ادمین اولیه پیش‌فرض: admin / admin
INSERT INTO `admins` (`username`, `password`, `name`) 
VALUES ('admin', 'admin', 'مدیریت کارخانه گاوصندوق')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- جدول مشتریان
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `address` TEXT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول پروژه‌های ساخت گاوصندوق
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `safe_type` VARCHAR(100) DEFAULT 'سفارشی ضد سرقت',
  `dimensions` VARCHAR(100) DEFAULT 'استاندارد',
  `weight` VARCHAR(100) DEFAULT 'نامشخص',
  `lock_type` VARCHAR(150) DEFAULT 'مکانیکی و دیجیتال',
  `status` ENUM('in_progress', 'completed', 'on_hold') DEFAULT 'in_progress',
  `start_date` VARCHAR(50) NULL,
  `estimated_delivery` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_projects_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مراحل پروژه همراه با عکس‌های ذخیره شده در هارد لینوکس
CREATE TABLE IF NOT EXISTS `stages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `completed` TINYINT(1) DEFAULT 0,
  `stage_date` VARCHAR(50) NULL,
  `stage_order` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_stages_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول پیام‌های گفت‌وگو بین مشتری و مدیر روی هر پروژه
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `sender` ENUM('customer', 'admin') NOT NULL,
  `sender_name` VARCHAR(100) NOT NULL,
  `content` TEXT NOT NULL,
  `reply_to_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_read` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_messages_project` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
