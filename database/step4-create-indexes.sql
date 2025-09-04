-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_serial_numbers_sn ON serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_activations_sn ON activations(serial_number);
CREATE INDEX IF NOT EXISTS idx_activations_hardware ON activations(hardware_id);