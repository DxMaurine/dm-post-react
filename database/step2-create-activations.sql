-- Step 2: Create activations table
CREATE TABLE IF NOT EXISTS activations (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(50) REFERENCES serial_numbers(serial_number),
    hardware_id VARCHAR(64) NOT NULL,
    installation_slot INTEGER NOT NULL,
    computer_name VARCHAR(100),
    os_info TEXT,
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    UNIQUE(serial_number, installation_slot)
);