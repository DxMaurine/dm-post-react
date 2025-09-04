-- DM POS Activation System - Neon Database Setup
-- Jalankan script ini di Neon SQL Console

-- 1. Tabel untuk data serial numbers
CREATE TABLE IF NOT EXISTS serial_numbers (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    max_installations INTEGER DEFAULT 3,
    current_installations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    license_type VARCHAR(20) DEFAULT 'standard'
);

-- 2. Tabel untuk tracking aktivasi/instalasi
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

-- 3. Insert test serial numbers (5 buah untuk testing)
INSERT INTO serial_numbers (serial_number, max_installations, license_type) VALUES
('DMPOS-2024-000001-4005', 3, 'standard'),
('DMPOS-2024-000002-53D4', 3, 'standard'),
('DMPOS-2024-000003-E2C3', 3, 'standard'),
('DMPOS-2024-000004-FDD2', 3, 'standard'),
('DMPOS-2024-000005-F5C1', 3, 'standard')
ON CONFLICT (serial_number) DO NOTHING;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_serial_numbers_sn ON serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_activations_sn ON activations(serial_number);
CREATE INDEX IF NOT EXISTS idx_activations_hardware ON activations(hardware_id);

-- 5. Verify data
SELECT 'Setup completed. Test serial numbers:' as message;
SELECT serial_number, status, max_installations FROM serial_numbers;