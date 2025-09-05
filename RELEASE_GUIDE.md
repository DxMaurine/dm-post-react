# 🚀 DM POS Release Guide

## Proses Release ke GitHub

### 1️⃣ Persiapan
```bash
# Pastikan di branch main dan up-to-date
git checkout main
git pull origin main
```

### 2️⃣ Update Versi
```bash
# Cara 1: Gunakan npm version (recommended)
npm version 1.5.20   # Contoh untuk versi 1.5.20

# Cara 2: Edit package.json manual
# Ubah "version": "1.5.20" di package.json
```

### 3️⃣ Commit Perubahan
```bash
# Jika menggunakan npm version, commit sudah otomatis
# Jika manual, gunakan:
git add .
git commit -m "feat: update to version 1.5.20"
```

### 4️⃣ Buat Tag
```bash
# Jika menggunakan npm version, tag sudah otomatis
# Jika manual, gunakan:
git tag -a v1.5.20 -m "Release version 1.5.20"
```

### 5️⃣ Push ke GitHub
```bash
# Push commit dan tag
git push origin main
git push origin v1.5.20
```

## 🔄 Proses GitHub Actions

1. Setelah push tag, GitHub Actions akan otomatis:
   - Build aplikasi
   - Generate installer
   - Buat GitHub release
   - Upload assets

2. Cek status di:
   - GitHub > Repository > Actions tab
   - GitHub > Repository > Releases

## ⚠️ Troubleshooting

Jika build gagal:
```bash
# Cek log di GitHub Actions
# Jika perlu reset:
git tag -d v1.5.20           # Hapus tag lokal
git push origin :v1.5.20     # Hapus tag remote
# Ulangi proses dari step 2
```

## 📝 Konvensi Versioning

- Format: `MAJOR.MINOR.PATCH`
  - MAJOR: Perubahan breaking changes
  - MINOR: Fitur baru (backwards-compatible)
  - PATCH: Bug fixes

## 🔍 Quick Commands

```bash
# Cek versi saat ini
npm version

# Lihat semua tags
git tag -l

# Cek remote
git remote -v
```

## 🎯 Tips
- Selalu test di local sebelum release
- Pastikan semua perubahan sudah di-commit
- Gunakan prefix 'v' untuk tags (v1.5.20)
- Tunggu GitHub Actions selesai sebelum testing
- Simpan file ini untuk referensi cepat

## 📱 Link Penting
- GitHub Actions: https://github.com/DxMaurine/dm-post-react/actions
- Releases: https://github.com/DxMaurine/dm-post-react/releases
