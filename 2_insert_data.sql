-- ============================================
-- AQUARUSE LAUNDRY MANAGEMENT SYSTEM
-- DATA INSERTION SCRIPT
-- ============================================
-- Purpose: Inserts initial data into tables
-- Run this AFTER 1_setup_database.sql
-- ============================================

USE aquaruse;

-- ============================================
-- INSERT: supplies
-- Initialize supplies with some starting quantity
-- ============================================
INSERT INTO supplies (name, quantity, unit, low_stock_threshold) VALUES
('detergent', 25, 'bottles', 5),
('softener', 20, 'bottles', 3),
('bleach', 15, 'bottles', 2),
('fragrance', 18, 'bottles', 5),
('stain_remover', 12, 'bottles', 3),
('steam_water', 25, 'liters', 5),
('garment_bag', 100, 'pcs', 20)
ON DUPLICATE KEY UPDATE 
    quantity = VALUES(quantity),
    unit = VALUES(unit),
    low_stock_threshold = VALUES(low_stock_threshold);

-- ============================================
-- INSERT: staff
-- Add demo staff members
-- ============================================
INSERT INTO staff (name, email, phone, password) VALUES
('John Staff', 'staff@aquaruse', '+1234567890', 'staff123')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    phone = VALUES(phone),
    password = VALUES(password);

-- ============================================
-- INSERT: accounts
-- Add admin account
-- ============================================
INSERT INTO accounts (account_name, email, password) VALUES
('Admin User', 'admin@aquaruse', 'admin123')
ON DUPLICATE KEY UPDATE 
    account_name = VALUES(account_name),
    password = VALUES(password);

-- ============================================
-- INSERT: Sample Orders
-- ============================================
INSERT INTO orders (order_id, name, DATE, service_type, kg, total_amount, amount_paid, balance, status, number) VALUES
('00001', 'John Doe', CURDATE(), 'Dry Cleaning', 5.0, 250.00, 250.00, 0.00, 'completed', '09123456789'),
('00002', 'Jane Smith', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Wash and Fold', 3.0, 150.00, 100.00, 50.00, 'ongoing', '09187654321'),
('00003', 'Bob Wilson', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Regular Laundry', 2.0, 120.00, 0.00, 120.00, 'pending', '09156789012'),
('00004', 'Maria Garcia', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Iron and Press', 1.5, 90.00, 90.00, 0.00, 'completed', '09198765432'),
('00005', 'John Doe', DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Wash and Fold', 4.0, 200.00, 150.00, 50.00, 'ongoing', '09123456789')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    DATE = VALUES(DATE),
    service_type = VALUES(service_type),
    kg = VALUES(kg),
    total_amount = VALUES(total_amount),
    amount_paid = VALUES(amount_paid),
    balance = VALUES(balance),
    status = VALUES(status),
    number = VALUES(number);

-- ============================================
-- INSERT: Customers (from orders)
-- Customers are automatically created from order names and numbers
-- ============================================
INSERT INTO customers (name, phone_numbers, is_returning) VALUES
('John Doe', '09123456789', 1),
('Jane Smith', '09187654321', 0),
('Bob Wilson', '09156789012', 0),
('Maria Garcia', '09198765432', 0)
ON DUPLICATE KEY UPDATE 
    is_returning = VALUES(is_returning);

-- ============================================
-- DATA INSERTION COMPLETE
-- ============================================
-- You can verify the data in phpMyAdmin by browsing each table
