-- Step 1: Create serial_numbers table
CREATE TABLE IF NOT EXISTS serial_numbers (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    max_installations INTEGER DEFAULT 3,
    current_installations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    license_type VARCHAR(20) DEFAULT 'standard'
);