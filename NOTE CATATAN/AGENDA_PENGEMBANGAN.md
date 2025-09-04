# Agenda Pengembangan Aplikasi DM POS

Berikut adalah daftar fitur potensial untuk pengembangan aplikasi selanjutnya, diurutkan berdasarkan prioritas untuk implementasi di lapangan.

### 1. Manajemen Stok (Inventory Management) - Prioritas Tertinggi
Modul paling krusial untuk melacak jumlah stok barang secara akurat.

- **[ ] Penerimaan Barang (Goods Receipt):** Menu untuk mencatat barang masuk dari supplier untuk menambah stok.
- **[ ] Stok Opname:** Fitur untuk penyesuaian (sinkronisasi) jumlah stok fisik dengan data di sistem.
- **[ ] Kartu Stok (Stock Card):** Laporan riwayat pergerakan untuk setiap item barang (masuk, keluar, disesuaikan).
- **[ ] Peringatan Stok Minimum:** Notifikasi otomatis jika stok barang mencapai batas minimum.

### 2. Manajemen Pengguna & Hak Akses (User & Role Management)
Penting untuk keamanan dan pembagian tugas.

- **[ ] Daftar Pengguna:** CRUD (Create, Read, Update, Delete) untuk akun pengguna.
- **[ ] Tingkatan Akses (Roles):** Membuat peran (e.g., Kasir, Admin, Owner) dengan hak akses yang berbeda-beda.

### 3. Laporan & Analisis Lanjutan
Memberikan wawasan bisnis yang lebih dalam kepada pemilik.

- **[ ] Laporan Laba-Rugi:** Laporan keuntungan bersih dari penjualan (memerlukan data Harga Pokok Penjualan/HPP).
- **[ ] Laporan Produk Terlaris:** Mengidentifikasi produk paling populer.
- **[ ] Laporan per Kasir:** Melacak performa penjualan setiap kasir.
- **[ ] Analisis Jam Sibuk:** Grafik penjualan per jam/hari.

### 4. Fitur Transaksi Tambahan
Meningkatkan fleksibilitas saat melayani pelanggan.

- **[ ] Tahan Transaksi (Hold/Park Transaction):** Menyimpan sesi transaksi untuk dilanjutkan nanti.
- **[ ] Retur Penjualan (Sales Return):** Mengelola pengembalian barang dari pelanggan.
- **[ ] Manajemen Diskon & Promo:** Fitur untuk membuat program diskon atau promosi.

### 5. Manajemen Pelanggan (CRM)
Membangun loyalitas pelanggan.

- **[ ] Database Pelanggan:** Menyimpan data dan riwayat transaksi pelanggan.
- **[ ] Sistem Poin/Loyalti:** Program reward untuk pelanggan setia.
