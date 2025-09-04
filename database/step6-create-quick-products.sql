-- step6-create-quick-products.sql

-- Tabel ini akan menyimpan produk mana yang akan ditampilkan di area "Produk Cepat" pada halaman POS.
CREATE TABLE IF NOT EXISTS quick_products (
  product_id INT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  color VARCHAR(20) DEFAULT 'default',
  PRIMARY KEY (product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Mengisi data awal berdasarkan nilai hardcoded sebelumnya agar tidak kosong.
-- ID Produk:
-- 74: Fotocopy
-- 80: Print BW
-- 88: Scan
-- 114: Press
-- 97: Laminating
-- Gunakan INSERT IGNORE untuk menghindari error jika data sudah ada atau produk tidak ditemukan.
INSERT IGNORE INTO quick_products (product_id, display_order, color) VALUES
(74, 0, 'red'),
(80, 1, 'green'),
(88, 2, 'yellow'),
(114, 3, 'red'),
(97, 4, 'green');

