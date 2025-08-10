-- Pharmalens MySQL Schema

-- User table (role: 'user' or 'admin')
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scan history table
CREATE TABLE scan_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    drug_name VARCHAR(100) NOT NULL,
    benefit TEXT,
    image_path VARCHAR(255),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert single admin (ubah password_hash sesuai hasil hash password admin)
INSERT INTO users (username, password_hash, role) VALUES ('admin', '$2b$12$EV/YXjsySnRIcan7E96Gbu.3proKt2RFuAP5YOvisKSWm1DONAPWS', 'admin');
