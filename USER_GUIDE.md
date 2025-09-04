# 📚 USER GUIDE DM POS
## Sistem Point of Sale Terpadu

---

### 📋 **DAFTAR ISI**

1. [Pendahuluan](#pendahuluan)
2. [Instalasi & Setup](#instalasi--setup)
3. [Login & Autentikasi](#login--autentikasi)
4. [Point of Sale (POS)](#point-of-sale-pos)
5. [Manajemen Inventory](#manajemen-inventory)
6. [Manajemen Customer](#manajemen-customer)
7. [Sistem Pelaporan](#sistem-pelaporan)
8. [User Management](#user-management)
9. [Pengaturan Sistem](#pengaturan-sistem)
10. [Troubleshooting](#troubleshooting)

---

## 🏪 **PENDAHULUAN**

DM POS adalah sistem Point of Sale (Kasir) terpadu yang dirancang khusus untuk bisnis retail modern. Aplikasi ini menyediakan solusi lengkap untuk:

- ✅ **Transaksi Penjualan** - Proses kasir yang cepat dan efisien
- ✅ **Manajemen Stok** - Kontrol inventory real-time
- ✅ **Database Pelanggan** - Kelola data customer dan loyalty
- ✅ **Laporan Bisnis** - Analytics penjualan dan profit
- ✅ **Multi User** - Role-based access control
- ✅ **Integrasi Hardware** - Printer, barcode scanner, customer display

### **Keunggulan DM POS:**
- 🚀 **Modern & Responsive** - Interface yang intuitif
- 🔒 **Keamanan Tinggi** - Authentication & role management
- 📊 **Real-time Analytics** - Laporan bisnis mendalam
- 🖨️ **Hardware Integration** - Support printer thermal & barcode
- 💾 **Offline Ready** - Bekerja tanpa koneksi internet

---

## 🛠️ **INSTALASI & SETUP**

### **Persyaratan Sistem:**
- Windows 7/8/10/11 (64-bit)
- RAM minimal 4GB (8GB recommended)
- Storage kosong 2GB
- Resolusi layar minimal 1024x768

### **Langkah Instalasi:**

#### **1. Download & Install**
1. Download file installer `DM-POS-Setup.exe`
2. Jalankan installer sebagai Administrator
3. Ikuti wizard instalasi
4. Tunggu proses instalasi selesai
5. Aplikasi akan otomatis membuat shortcut di Desktop

#### **2. First Run Setup**
1. Jalankan aplikasi DM POS
2. Sistem akan melakukan initial setup otomatis
3. Database akan dibuat secara otomatis
4. Tunggu hingga splash screen selesai

#### **3. Admin Account Setup**
- **Username Default:** `admin`
- **Password Default:** `admin123`
- ⚠️ **PENTING:** Segera ganti password default setelah login pertama

---

## 🔐 **LOGIN & AUTENTIKASI**

### **Halaman Login**

DM POS menggunakan sistem autentikasi berbasis role dengan 3 level akses:

#### **1. Admin**
- Akses penuh ke semua fitur
- Dapat membuat user baru
- Kelola pengaturan sistem
- Akses ke semua laporan

#### **2. Manager**
- Akses ke fitur manajemen
- Laporan penjualan & inventory
- Tidak bisa kelola user
- Pengaturan terbatas

#### **3. Kasir**
- Fokus ke transaksi POS
- Input customer baru
- Lihat stok produk
- Akses terbatas

### **Cara Login:**

1. **Buka aplikasi DM POS**
2. **Masukkan Username & Password**
3. **Klik tombol "Login"**
4. **Sistem akan redirect sesuai role:**
   - Admin/Manager → Dashboard
   - Kasir → Langsung ke POS

### **Fitur Khusus Login:**

#### **🔐 Admin Validation untuk Registrasi**
- Hanya admin yang bisa membuat user baru
- Klik "Daftar di sini" → Muncul popup validasi admin
- Input kredensial admin → Jika valid, bisa buat user baru
- Sistem menggunakan SweetAlert2 untuk notifikasi yang menarik

#### **🌙 Dark Mode Support**
- Toggle dark/light mode di pojok kanan atas
- Preference tersimpan otomatis
- Semua komponen responsif terhadap tema

---

## 🛒 **POINT OF SALE (POS)**

Fitur utama untuk proses transaksi penjualan. Interface dirancang untuk kecepatan dan kemudahan kasir.

### **Layout POS:**

#### **1. 🔍 Product Search (Kiri Atas)**
- Search by nama produk
- Search by barcode
- Filter by kategori
- Quick product selection

#### **2. 🛍️ Shopping Cart (Kanan)**
- Daftar item yang dibeli
- Quantity adjustment
- Remove item
- Apply discount
- Customer selection

#### **3. 📱 Customer Display (Kiri Bawah)**
- Running text promosi
- Video promosi
- Info store

#### **4. ⌨️ Shortcut Panel (Kanan Bawah)**
- Hotkey functions
- Quick payments
- Hold/Resume transaction

### **Workflow Transaksi:**

#### **Step 1: Scan/Input Produk**
1. Scan barcode ATAU ketik nama produk
2. Produk otomatis masuk ke cart
3. Adjust quantity jika perlu
4. Ulangi untuk produk berikutnya

#### **Step 2: Pilih Customer (Opsional)**
1. Klik "Pilih Customer"
2. Search existing customer ATAU
3. Klik "Add Customer" untuk customer baru
4. Input data: Nama, No HP, Email (opsional)

#### **Step 3: Apply Discount (Opsional)**
1. Klik ikon discount di cart
2. Pilih jenis discount: Percentage (%) / Fixed Amount (Rp) / Per Item
3. Input nilai discount

#### **Step 4: Payment Process**
1. Klik "BAYAR" (tombol hijau besar)
2. Pilih metode pembayaran: Cash / Debit Card / Credit Card / E-Wallet (QRIS)
3. Input jumlah bayar
4. Sistem hitung kembalian otomatis

#### **Step 5: Print Receipt**
1. Setelah payment sukses
2. Pilih printer yang tersedia
3. Klik "Print Receipt"
4. Struk otomatis terprint
5. Transaction complete!

### **Fitur Advanced POS:**

#### **🔒 Hold Transaction**
- Simpan transaksi sementara
- Resume kapan saja
- Multiple held transactions

#### **🔄 Return/Exchange**
- Process return produk
- Exchange dengan produk lain
- Refund handling

#### **📊 Real-time Stock**
- Stok update otomatis
- Low stock warning
- Out of stock prevention

#### **🎯 Quick Products**
- Produk favorit/best seller
- One-click add to cart
- Customizable layout

---

## 📦 **MANAJEMEN INVENTORY**

Kelola seluruh inventory toko Anda dengan mudah dan efisien.

### **1. 📋 Data Barang/Produk**

#### **Add New Product:**
```
Form Input Produk:
├── Basic Info: Nama Produk, Barcode/SKU, Kategori, Brand
├── Pricing: Harga Beli, Harga Jual, Profit Margin, Discount
├── Inventory: Stok Awal, Minimum Stock, Unit, Lokasi Rak
└── Additional: Deskripsi, Foto Produk, Expired Date, Status
```

#### **Product Management:**
- List semua produk dengan filter
- Quick edit dari list view
- Bulk update untuk multiple items
- Product categories management
- Import/Export data produk

### **2. 📥 Penerimaan Barang**

#### **Workflow Penerimaan:**
1. **Create Purchase Order (PO)** - Select Supplier, Add Products & Quantity, Set Expected Delivery Date
2. **Receive Goods** - Scan PO, Verify Items, Input Actual Quantity, Note Discrepancies
3. **Generate Receipt** - Print Goods Receipt, Update Purchase Records, Archive Documents

### **3. 📊 Stock Opname**

#### **Physical Count Process:**
1. **Create Stock Opname Session** - Select Count Date, Choose Products, Assign Staff
2. **Physical Counting** - Print Count Sheets, Count Physical Stock, Input Actual Count
3. **Adjustment Process** - Review Variances, Approve Adjustments, Update System Stock

#### **Stock Opname Types:**
- **Full Count** - Seluruh inventory
- **Cycle Count** - Per kategori/lokasi
- **Spot Check** - Random sampling
- **Scheduled Count** - Otomatis berkala

### **4. 📈 Kartu Stok**

#### **Stock Card Features:**
- Real-time stock movement
- In/Out transaction history
- Stock balance tracking
- Movement by date range
- Export to Excel/PDF

#### **Stock Movement Types:**
Sales, Purchase, Adjustment, Transfer, Return, Damaged

---

## 👥 **MANAJEMEN CUSTOMER**

Kelola database customer untuk meningkatkan loyalty dan sales.

### **1. 📇 Database Customer**

#### **Customer Information:**
```
Data Customer:
├── Personal Info: Nama, No Telepon, Email, Tanggal Lahir, Jenis Kelamin
├── Address: Alamat Lengkap, Kota, Provinsi, Kode Pos
├── Business Info: Nama Perusahaan, NPWP, Alamat Perusahaan
└── Preferences: Payment Method, Communication, Notes, Tags
```

#### **Customer Management:**
- Add/Edit customer details
- Merge duplicate customers
- Import from Excel/CSV
- Export customer data
- Customer status management

### **2. 🎯 Loyalty Points System**

#### **Points Management:**
```
Loyalty Features:
├── Earn Points: Purchase-based, Bonus campaigns, Special events
├── Redeem Points: Discount vouchers, Free products, Cash equivalent
└── Track History: Points earned, Redemption history, Expiry tracking
```

### **3. 📱 Customer Display Integration**

#### **Display Features:**
- Welcome message dengan nama customer
- Points balance display
- Special offers untuk customer
- Birthday greetings
- Targeted promotions

---

## 📊 **SISTEM PELAPORAN**

Laporan bisnis komprehensif untuk decision making yang lebih baik.

### **1. 💰 Laporan Laba Rugi**

#### **Profit & Loss Components:**
```
├── Revenue: Gross Sales, Discounts, Returns, Net Sales
├── COGS: Opening Stock, Purchases, Direct Costs, Closing Stock
├── Operating Expenses: Salaries, Rent, Marketing, Other Expenses
└── Net Profit: Net Sales - COGS - OpEx
```

### **2. 🏆 Laporan Produk Terlaris**

#### **Best Selling Analysis:**
- Quantity Sold & Revenue Generated
- Profit Contribution & Stock Turnover
- Top 10/20/50 Products
- Category & Brand Performance
- Seasonal Trends Analysis

### **3. 👨‍💼 Laporan Performa Kasir**

#### **Cashier Performance Metrics:**
```
├── Daily Performance: Transactions, Items Sold, Revenue, Average Transaction
├── Accuracy Metrics: Void Transactions, Returns, Discounts, Payment Errors
└── Customer Service: Transaction Speed, Satisfaction, Upselling Success
```

### **4. 📈 Rekapitulasi Penjualan**

#### **Sales Summary Features:**
- Hourly/Daily/Weekly/Monthly analysis
- Payment method breakdown
- Category & brand comparison
- Seasonal & promotion analysis

---

## 🔧 **USER MANAGEMENT**

Kelola user dan hak akses sistem dengan role-based security.

### **1. 👤 CRUD Operations User**

#### **Add New User:**
```
User Registration Form:
├── Basic Info: Full Name, Username, Email, Phone, Employee ID
├── Access Control: User Role, Department, Branch Access, Status
├── Security: Password, Confirm Password, Force Change, Expiry Date
└── Permissions: Module Access, Feature Permissions, Report Access
```

### **2. 🔐 Role-Based Access Control (RBAC)**

#### **Permission Matrix:**
```
ADMIN: Full access - User Management, System Settings, All Business Functions
MANAGER: Business Operations, Reporting & Analytics, Limited Admin Functions
KASIR: POS Operations, Limited Inventory, Customer Service, Basic Reports
```

### **3. 🔒 Authentication Integration**

#### **Security Features:**
- Secure password hashing
- Session management
- Auto-logout on inactivity
- Failed login attempt tracking
- Admin validation for user creation

---

## ⚙️ **PENGATURAN SISTEM**

Konfigurasi aplikasi sesuai kebutuhan bisnis Anda.

### **1. 🖨️ Printer Settings**
- Receipt Printer Configuration
- Paper Settings (58mm/80mm)
- Receipt Format & Templates
- Auto Print Options

### **2. 📱 Barcode Settings**
- Barcode Type Selection (EAN-13, Code 128, QR Code)
- Generation Rules & Print Settings
- Scanner Configuration

### **3. 🏪 General Settings**
- Store Information & Business Details
- Operational Settings & Preferences
- Currency & Tax Configuration

### **4. 💳 Payment Settings**
- Cash Handling Configuration
- Card Payment Integration
- Digital Payment Setup (QRIS, E-wallet)

### **5. ☁️ Cloud Settings**
- Data Sync Configuration
- Backup Settings & Schedule
- Multi-store Integration

### **6. 🎯 Promotion Settings**
- Discount Types & Rules
- Campaign Management
- Seasonal Promotions

---

## 🚨 **TROUBLESHOOTING**

### **1. Masalah Umum & Solusi**

#### **Aplikasi Tidak Bisa Dibuka:**
1. Close existing processes → Run as Administrator
2. Check system requirements
3. Reinstall application if needed

#### **Database Connection Error:**
1. Check database service status
2. Verify connection string
3. Restore from backup if needed

#### **Printer Tidak Berfungsi:**
1. Check hardware connection
2. Update/reinstall drivers
3. Verify application settings

### **2. Performance Issues**
- Close unnecessary programs
- Database maintenance (compact, reindex)
- Clear application cache

### **3. Login Issues**
- Password recovery process
- Account status verification
- System restart if needed

### **4. Tips & Best Practices**
- **Daily:** Backup data, update stock, monitor performance
- **Weekly:** Clean logs, update prices, review accounts
- **Monthly:** Full backup, updates, hardware maintenance

---

## 📞 **KONTAK SUPPORT**

**Technical Support:**
- 📧 Email: support@dmpos.com
- 📱 WhatsApp: +62-xxx-xxxx-xxxx
- ⏰ Jam Operasional: Senin-Jumat 08:00-17:00 WIB

**Training & Implementation:**
- 📧 Email: training@dmpos.com
- 🎓 Online Training Available
- 🏪 On-site Implementation

---

## 📄 **APPENDIX**

### **Keyboard Shortcuts:**
```
POS Operations: F1-Help, F2-Add Product, F3-Customer Search, F4-Payment
Navigation: Ctrl+1-Dashboard, Ctrl+2-POS, Ctrl+3-Inventory, etc.
```

### **System Requirements:**
```
Minimum: Windows 7 64-bit, 4GB RAM, 2GB Storage
Recommended: Windows 10/11, 8GB RAM, SSD for better performance
```

---

**© 2024 DM POS - Sistem Point of Sale Terpadu**  
*User Guide Version 1.0*