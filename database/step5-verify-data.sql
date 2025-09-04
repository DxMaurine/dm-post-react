-- Step 5: Verify setup
SELECT 'Setup completed. Test serial numbers:' as message;
SELECT serial_number, status, max_installations FROM serial_numbers;