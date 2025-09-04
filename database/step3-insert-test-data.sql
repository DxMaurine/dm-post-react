-- Step 3: Insert test serial numbers
INSERT INTO serial_numbers (serial_number, max_installations, license_type) VALUES
('DMPOS-2024-000001-4005', 3, 'standard'),
('DMPOS-2024-000002-53D4', 3, 'standard'),
('DMPOS-2024-000003-E2C3', 3, 'standard'),
('DMPOS-2024-000004-FDD2', 3, 'standard'),
('DMPOS-2024-000005-F5C1', 3, 'standard')
ON CONFLICT (serial_number) DO NOTHING;