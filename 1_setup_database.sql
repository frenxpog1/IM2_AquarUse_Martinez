-- ============================================
-- AQUARUSE LAUNDRY MANAGEMENT SYSTEM
-- DATABASE SETUP SCRIPT
-- ============================================
-- Purpose: Creates database and all tables
-- Run this FIRST before inserting data
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS aquaruse;
USE aquaruse;

-- ============================================
-- TABLE: orders
-- Stores all laundry orders
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    DATE DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    kg DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    balance DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: customers
-- Stores customer information
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_numbers VARCHAR(20) NOT NULL,
    is_returning TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: supplies
-- Stores inventory supplies
-- ============================================
CREATE TABLE IF NOT EXISTS supplies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pcs',
    low_stock_threshold INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: staff
-- Stores staff member information
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: accounts
-- Stores admin and manager accounts
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: user_settings
-- Stores user preferences and settings
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    theme VARCHAR(50) DEFAULT 'default',
    notifications VARCHAR(50) DEFAULT 'all',
    auto_logout INT DEFAULT 0,
    profile_picture LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: notifications
-- Stores system notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(10) DEFAULT '🔔',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_orders_date ON orders(DATE);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_notifications_user ON notifications(user_email);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- SETUP COMPLETE
-- ============================================
SELECT 'Database setup completed successfully!' AS message;
SELECT 'Next step: Run 2_insert_data.sql to populate tables' AS next_step;
