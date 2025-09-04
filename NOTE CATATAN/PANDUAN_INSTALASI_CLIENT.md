# DM POS React - Panduan Instalasi Client

## 📋 PERSYARATAN SISTEM

### Minimum System Requirements:
- **OS**: Windows 7/8/10/11 (64-bit)
- **RAM**: 4GB (Recommended: 8GB)
- **Storage**: 2GB free space
- **MySQL**: Version 5.7+ atau 8.0+ (WAJIB)

### Software Prerequisites:
1. **MySQL Server** (Community Edition)
2. **MySQL Workbench** (Optional, untuk management)

---

## 🚀 LANGKAH INSTALASI

### STEP 1: Install MySQL Server
1. Download MySQL Community Server dari: https://dev.mysql.com/downloads/mysql/
2. Jalankan installer MySQL
3. Pilih "Server only" atau "Developer Default"
4. Set konfigurasi:
   - **Port**: `3306` (default)
   - **Authentication**: Use Strong Password Encryption
   - **Root Password**: `1234` (atau sesuai kebutuhan)

### STEP 2: Setup Database
1. Buka MySQL Command Line Client atau MySQL Workbench
2. Login dengan user `root` dan password yang dibuat
3. Jalankan perintah:
   ```sql
   CREATE DATABASE pos_db;
   SHOW DATABASES;
   ```
4. Pastikan database `pos_db` muncul dalam daftar

### STEP 3: Install Aplikasi DM POS
1. Jalankan file: **`DM POS React Setup 1.4.7.exe`**
2. Ikuti wizard instalasi:
   - Pilih lokasi instalasi (default: `C:\Program Files\DM POS React\`)
   - Centang "Create desktop shortcut"
   - Klik "Install"
3. Tunggu proses instalasi selesai
4. Klik "Finish"

### STEP 4: Konfigurasi Database (Jika Perlu)
Jika menggunakan password MySQL selain `1234`:
1. Buka aplikasi DM POS React
2. Login sebagai admin (username: admin, password: admin)
3. Masuk ke menu **Pengaturan** → **Database**
4. Update konfigurasi:
   - **Host**: `localhost`
   - **Port**: `3306`
   - **Username**: `root`
   - **Password**: [password MySQL Anda]
   - **Database**: `pos_db`
5. Klik "Test Connection" → "Save Settings"
6. Restart aplikasi

---

## 🔧 KONFIGURASI DEFAULT

### Database Connection:
```
Host: localhost
Port: 3306
Username: root
Password: 1234
Database: pos_db
```

### Default Login:
```
Username: admin
Password: admin
Role: Administrator
```

---

## ⚠️ TROUBLESHOOTING

### Problem: Aplikasi tidak bisa connect ke database
**Solusi:**
1. Pastikan MySQL service berjalan:
   - Buka "Services" (Windows + R → services.msc)
   - Cari "MySQL80" atau "MySQL"
   - Pastikan status "Running"
2. Cek firewall/antivirus tidak memblokir port 3306
3. Test koneksi dari Command Line:
   ```cmd
   mysql -u root -p -h localhost -P 3306
   ```

### Problem: Database `pos_db` tidak ditemukan
**Solusi:**
1. Buka MySQL dan jalankan:
   ```sql
   CREATE DATABASE pos_db;
   USE pos_db;
   ```

### Problem: Access denied for user 'root'
**Solusi:**
1. Reset password MySQL atau
2. Update konfigurasi database di aplikasi

### Problem: Aplikasi tidak bisa start
**Solusi:**
1. Restart aplikasi sebagai Administrator
2. Cek Windows Event Viewer untuk error details
3. Reinstall aplikasi jika perlu

---

## 📞 SUPPORT & KONTAK

Jika mengalami kendala instalasi atau penggunaan:
- **Developer**: Pak Picca
- **Version**: 1.4.7
- **Build Date**: Agustus 2025

---

## 📝 CHANGELOG

### Version 1.4.7 (Latest)
- ✅ Backend terintegrasi (tidak perlu manual service)
- ✅ Error handling untuk token authentication
- ✅ Optimasi build process
- ✅ Code signing untuk keamanan
- ✅ NSIS installer profesional

---

## 🛡️ SECURITY NOTES

1. **Password Default**: Ganti password default setelah instalasi pertama
2. **Database Security**: Set password MySQL yang kuat
3. **Firewall**: Pastikan hanya port yang diperlukan terbuka
4. **Backup**: Lakukan backup database secara berkala

---

## 📄 LICENSE & COPYRIGHT

© 2025 DM POS React
Developed by Pak Picca
All rights reserved.