# DM POS React - Desain Sistem Aktivasi

## 1. Gambaran Umum

### Tujuan Sistem
Sistem Aktivasi mengamankan aplikasi DM POS React melalui mekanisme lisensi hybrid yang menggabungkan trial berbasis transaksi dengan validasi Serial Number (SN). Sistem ini dirancang untuk memaksimalkan user experience sambil mencegah penggunaan ilegal dan mengoptimalkan revenue model.

### Model Bisnis Hybrid
- **Trial Berbasis Transaksi**: Aplikasi dapat digunakan untuk maksimal 99 transaksi tanpa aktivasi
- **Aktivasi Seamless**: Notifikasi aktivasi muncul di halaman POS Cashier, bukan dashboard
- **Offline-First Design**: Sistem dapat beroperasi tanpa koneksi server Railway
- **Multi-Computer Licensing**: Fleksibilitas 1 SN untuk 1 komputer atau unlimited komputer

### Komponen Utama
- **Transaction Counter**: Penghitung transaksi untuk trial period
- **POS Integration**: Notifikasi aktivasi terintegrasi di halaman kasir
- **Offline Fallback**: Validasi lokal saat server tidak tersedia
- **Flexible Licensing**: Support multiple licensing models
- **Grace Period Management**: Sistem toleransi untuk kontinuitas bisnis

## 2. Teknologi & Dependensi

### Dependensi Frontend
```json
{
  "crypto-js": "^4.1.1",
  "node-machine-id": "^1.1.12",
  "electron-machine-id": "^1.0.9",
  "axios": "^1.6.0"
}
```

### Dependensi Backend (pos-backend)
```json
{
  "crypto": "built-in",
  "os": "built-in", 
  "child_process": "built-in",
  "node-machine-id": "^1.1.12"
}
```

### Stack Server Railway
- **Platform**: Node.js Express API
- **Database**: PostgreSQL untuk penyimpanan SN
- **Autentikasi**: Token JWT untuk keamanan API
- **Environment**: Hosting cloud Railway

## 3. Arsitektur

### Model Trial Berbasis Transaksi

```mermaid
flowchart TD
    A[Install Aplikasi] --> B[Trial Mode: 99 Transaksi]
    B --> C{Transaksi ke-X}
    C -->|X < 80| D[Normal Operation]
    C -->|X = 80| E[Notif: 19 transaksi tersisa]
    C -->|X = 90| F[Notif: 9 transaksi tersisa]
    C -->|X = 95| G[Notif: 4 transaksi tersisa]
    C -->|X = 99| H[Notif: Aktivasi WAJIB]
    
    H --> I[Input SN di POS Cashier]
    I --> J{SN Valid?}
    J -->|Ya| K[Unlimited Transactions]
    J -->|Tidak| L[Tetap di Trial Limit]
    
    style H fill:#ff6b6b
    style K fill:#51cf66
    style L fill:#ffd43b
end
```

### Offline-First Architecture

```mermaid
graph TB
    subgraph "Aplikasi Lokal (Offline-First)"
        A[Transaction Counter] --> B[Local License Storage]
        A --> C[POS Cashier Interface]
        B --> D[Activation Status Manager]
        
        E[SN Input Dialog] --> F[Local SN Validation]
        F --> G[License Activation]
        
        H[Background Sync Service] --> I[Queue Pending Validations]
    end
    
    subgraph "Server Railway (Optional)"
        J[SN Database] --> K[Validation API]
        K --> L[Analytics & Reporting]
    end
    
    subgraph "Fallback Mechanism"
        M[Network Check]
        N[Local Validation]
        O[Grace Period]
    end
    
    H -.->|When Online| J
    F -.->|Fallback| N
    
    style A fill:#e8f5e8
    style J fill:#fff3e0
    style M fill:#ffeb3b
```

### Grace Period: Temporary Activation (Bukan Perpanjangan)

**Klarifikasi Grace Period:**
Grace period 30 hari adalah untuk **temporary activation** saat server Railway down, bukan untuk perpanjangan lisensi. Ini memberikan waktu untuk:
1. Server Railway kembali online
2. Validasi SN yang belum dikenal
3. Sync data aktivasi

```mermaid
flowchart TD
    A[User Input SN Unknown] --> B[Server Railway Down?]
    B -->|Yes| C[Give 30-day Grace Period]
    B -->|No| D[Reject Unknown SN]
    
    C --> E[Temporary Activation]
    E --> F[Background: Queue for Validation]
    F --> G{Server Online?}
    G -->|Yes| H[Validate SN with Server]
    G -->|No| I[Continue Grace Period]
    
    H -->|Valid| J[Convert to Permanent]
    H -->|Invalid| K[Revoke After Grace]
    
    I --> L{30 Days Expired?}
    L -->|No| G
    L -->|Yes| M[Force Re-validation]
    
    style C fill:#2196f3
    style E fill:#ff9800
    style J fill:#4caf50
    style K fill:#f44336
```

### Installation Management Logic
```javascript
// pos-backend/services/installationManager.js
class InstallationManager {
  async activateNewInstallation(serialNumber, hardwareId, computerInfo) {
    const license = await this.getLicenseData(serialNumber);
    
    if (!license) {
      throw new Error('Serial number not found');
    }
    
    if (license.current_installations >= license.max_installations) {
      // Check for crashed/inactive installations
      const inactiveSlots = await this.findInactiveInstallations(serialNumber);
      
      if (inactiveSlots.length === 0) {
        throw new Error(`Maximum installations reached (${license.max_installations})`);
      }
      
      // Reuse inactive slot
      return await this.reuseInactiveSlot(serialNumber, hardwareId, inactiveSlots[0]);
    }
    
    // Find next available slot
    const availableSlot = await this.getNextAvailableSlot(serialNumber);
    return await this.createNewInstallation(serialNumber, hardwareId, availableSlot, computerInfo);
  }
  
  async findInactiveInstallations(serialNumber) {
    // Installations yang tidak terlihat > 30 hari dianggap crashed
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return await db.query(`
      SELECT * FROM license_installations 
      WHERE serial_number = ? 
        AND status = 'active'
        AND last_seen < ?
      ORDER BY last_seen ASC
    `, [serialNumber, thirtyDaysAgo]);
  }
  
  async handleHardwareChange(serialNumber, oldHardwareId, newHardwareId) {
    // Saat hardware berubah (format ulang, ganti komputer)
    const installation = await this.getInstallationByHardware(serialNumber, oldHardwareId);
    
    if (!installation) {
      throw new Error('Installation not found');
    }
    
    // Update hardware ID di slot yang sama
    await db.query(`
      UPDATE license_installations 
      SET hardware_id = ?, 
          installation_date = CURRENT_TIMESTAMP,
          last_seen = CURRENT_TIMESTAMP,
          deactivation_reason = 'hardware_change'
      WHERE serial_number = ? AND hardware_id = ?
    `, [newHardwareId, serialNumber, oldHardwareId]);
    
    return {
      success: true,
      message: 'Hardware change detected and updated',
      slot: installation.installation_slot
    };
  }
  
  async deactivateInstallation(serialNumber, hardwareId, reason = 'user_request') {
    await db.query(`
      UPDATE license_installations 
      SET status = 'deactivated',
          deactivation_reason = ?,
          last_seen = CURRENT_TIMESTAMP
      WHERE serial_number = ? AND hardware_id = ?
    `, [reason, serialNumber, hardwareId]);
    
    // Update counter
    await db.query(`
      UPDATE license_data 
      SET current_installations = (
        SELECT COUNT(*) FROM license_installations 
        WHERE serial_number = ? AND status = 'active'
      )
      WHERE serial_number = ?
    `, [serialNumber, serialNumber]);
  }
}
```

## 4. Model Lisensi Fleksibel

### Model Lisensi: 1 SN = 3 Instalasi
Berdasarkan feedback Pak Picca: Satu lisensi dapat diinstall hingga 3 kali untuk mengantisipasi kerusakan komputer atau format ulang.

```mermaid
graph TB
    A[1 Serial Number] --> B[Track 3 Installation Slots]
    B --> C[Slot 1: Primary Computer]
    B --> D[Slot 2: Backup/Replacement]
    B --> E[Slot 3: Emergency Install]
    
    C --> F{Computer Status}
    D --> F
    E --> F
    
    F -->|Active| G[Normal Operation]
    F -->|Crashed/Formatted| H[Deactivate Old Slot]
    H --> I[Activate New Installation]
    
    style C fill:#4caf50
    style D fill:#ff9800
    style E fill:#f44336
    style I fill:#2196f3
```

### Pre-loaded SN Database (Small Scale)
Mulai dengan database kecil untuk testing dan validasi konsep:

```javascript
// pos-backend/data/preloaded-sns.js (Start Small)
const PRELOADED_SNS = {
  // 500-1000 SN untuk testing awal
  'DMPOS-2024-000001-A7B2': {
    valid: true,
    maxInstallations: 3,
    currentInstallations: 0,
    generated: '2024-01-01',
    type: 'standard'
  },
  'DMPOS-2024-000002-C4D8': {
    valid: true,
    maxInstallations: 3,
    currentInstallations: 1,
    generated: '2024-01-01',
    type: 'standard'
  }
  // ... 500-1000 entries total untuk phase awal
};
```

### Installation Tracking Schema
```sql
CREATE TABLE license_installations (
    id INTEGER PRIMARY KEY,
    serial_number VARCHAR(50) NOT NULL,
    hardware_id VARCHAR(64) NOT NULL,
    installation_slot INTEGER NOT NULL, -- 1, 2, atau 3
    installation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, deactivated, crashed
    computer_name VARCHAR(100),
    os_info TEXT,
    deactivation_reason VARCHAR(100), -- 'user_request', 'hardware_change', 'crashed'
    UNIQUE(serial_number, installation_slot)
);

CREATE TABLE license_data (
    id INTEGER PRIMARY KEY,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    max_installations INTEGER DEFAULT 3,
    current_installations INTEGER DEFAULT 0,
    license_status VARCHAR(20) DEFAULT 'unused', -- unused, active, revoked
    first_activation DATETIME,
    last_activity DATETIME
);
```

## 4. Spesifikasi Serial Number

### Format SN Standar
Mengikuti standar sistem POS internasional, format Serial Number:

```
Format: DMPOS-YYYY-XXXXXX-CRC8
Contoh: DMPOS-2024-847392-A7F2
```

**Komponen:**
- `DMPOS`: Prefix tetap yang mengidentifikasi produk
- `YYYY`: Tahun pembuatan (4 digit)
- `XXXXXX`: Urutan alfanumerik acak (6 karakter)
- `CRC8`: Checksum CRC32 4 karakter untuk validasi

### Algoritma Pembuatan SN
```
Input: Timestamp saat ini, seed acak
Proses:
1. Ekstrak tahun dari tanggal saat ini
2. Generate 6 karakter alfanumerik acak
3. Gabungkan: "DMPOS-" + tahun + "-" + acak + "-"
4. Hitung CRC32 dari string gabungan
5. Tambahkan 4 karakter pertama dari CRC32 hex
Output: Serial Number lengkap
```

### Lapisan Validasi SN
1. **Validasi Format**: Pencocokan pola regex
2. **Verifikasi Checksum**: Validasi perhitungan CRC32  
3. **Keberadaan Database**: Cek registry SN di sisi server
4. **Validasi Status**: Status Aktif/Dicabut/Kedaluwarsa
5. **Binding Hardware**: Asosiasi sidik jari perangkat

## 5. Strategi Hardware Fingerprinting

### Masalah dengan Hardware ID Tradisional
Pak Picca benar! Komponen hardware bisa berubah:
- **SSD/HDD**: Paling sering diganti saat rusak
- **RAM**: Bisa ditambah/dikurangi
- **GPU**: Sering di-upgrade
- **Motherboard**: Jarang diganti, tapi kalau rusak total ya ganti

### Multi-Layer Hardware Fingerprinting
```mermaid
graph TB
    A[Hardware Components] --> B[Stable Components]
    A --> C[Semi-Stable Components]
    A --> D[Volatile Components]
    
    B --> E[CPU Model & Architecture]
    B --> F[Motherboard Chipset]
    B --> G[BIOS/UEFI Info]
    
    C --> H[MAC Address]
    C --> I[System UUID]
    C --> J[OS Install Date]
    
    D --> K[Disk Serial - IGNORE]
    D --> L[RAM Size - IGNORE]
    D --> M[GPU Info - IGNORE]
    
    E --> N[Primary Hash]
    F --> N
    G --> N
    H --> O[Secondary Hash]
    I --> O
    J --> O
    
    N --> P[Weighted Score System]
    O --> P
    P --> Q[Flexible Hardware ID]
    
    style B fill:#4caf50
    style C fill:#ff9800
    style D fill:#f44336
```

### Implementation Strategy
```javascript
// pos-backend/services/hardwareFingerprint.js
const os = require('os');
const { exec } = require('child_process');
const crypto = require('crypto');

class HardwareFingerprint {
  async generateFingerprint() {
    try {
      const components = await this.gatherHardwareInfo();
      return this.createFlexibleFingerprint(components);
    } catch (error) {
      console.error('Hardware fingerprinting failed:', error);
      // Fallback to basic system info
      return this.createBasicFingerprint();
    }
  }
  
  async gatherHardwareInfo() {
    const info = {
      // STABLE COMPONENTS (Primary factors)
      stable: {
        cpuModel: os.cpus()[0].model.replace(/\s+/g, ' ').trim(),
        cpuArch: os.arch(),
        platform: os.platform(),
        motherboard: await this.getMotherboardInfo(),
        biosInfo: await this.getBiosInfo()
      },
      
      // SEMI-STABLE COMPONENTS (Secondary factors)
      semiStable: {
        macAddress: await this.getPrimaryMacAddress(),
        systemUuid: await this.getSystemUuid(),
        osInstallDate: await this.getOsInstallDate(),
        hostname: os.hostname()
      },
      
      // VOLATILE COMPONENTS (Ignored for fingerprinting)
      volatile: {
        totalMemory: os.totalmem(),
        diskInfo: 'ignored', // SSD/HDD sering ganti
        gpuInfo: 'ignored'   // GPU sering upgrade
      }
    };
    
    return info;
  }
  
  createFlexibleFingerprint(components) {
    // Primary hash dari komponen stable (80% weight)
    const stableString = JSON.stringify(components.stable);
    const primaryHash = crypto.createHash('sha256')
      .update(stableString)
      .digest('hex')
      .substring(0, 16);
    
    // Secondary hash dari komponen semi-stable (20% weight)
    const semiStableString = JSON.stringify(components.semiStable);
    const secondaryHash = crypto.createHash('sha256')
      .update(semiStableString)
      .digest('hex')
      .substring(0, 8);
    
    // Kombinasi dengan format: PRIMARY-SECONDARY
    return `${primaryHash}-${secondaryHash}`;
  }
  
  async getMotherboardInfo() {
    return new Promise((resolve) => {
      if (os.platform() === 'win32') {
        exec('wmic baseboard get product,manufacturer,version', (error, stdout) => {
          if (error) {
            resolve('unknown-motherboard');
            return;
          }
          
          const lines = stdout.split('\n').filter(line => line.trim());
          const info = lines[1] ? lines[1].trim().replace(/\s+/g, '-') : 'unknown';
          resolve(info);
        });
      } else {
        // Linux/Mac fallback
        resolve(`${os.platform()}-motherboard`);
      }
    });
  }
  
  async getPrimaryMacAddress() {
    const interfaces = os.networkInterfaces();
    
    // Cari ethernet adapter dulu (lebih stable dari wifi)
    for (const [name, addrs] of Object.entries(interfaces)) {
      if (name.toLowerCase().includes('ethernet') || name.toLowerCase().includes('eth')) {
        const mac = addrs.find(addr => addr.mac && addr.mac !== '00:00:00:00:00:00');
        if (mac) return mac.mac;
      }
    }
    
    // Fallback ke interface pertama yang ada MAC
    for (const addrs of Object.values(interfaces)) {
      const mac = addrs.find(addr => addr.mac && addr.mac !== '00:00:00:00:00:00');
      if (mac) return mac.mac;
    }
    
    return 'no-mac-found';
  }
  
  // Fuzzy matching untuk validasi hardware yang berubah
  validateHardwareChange(storedFingerprint, currentFingerprint) {
    if (storedFingerprint === currentFingerprint) {
      return { match: true, confidence: 100, reason: 'exact_match' };
    }
    
    // Parse fingerprints
    const [storedPrimary, storedSecondary] = storedFingerprint.split('-');
    const [currentPrimary, currentSecondary] = currentFingerprint.split('-');
    
    // Primary hash match (stable components)
    if (storedPrimary === currentPrimary) {
      return {
        match: true,
        confidence: 85,
        reason: 'stable_components_match',
        message: 'Komponen utama sama, mungkin ada perubahan kecil (misal ganti SSD)'
      };
    }
    
    // Secondary hash match (semi-stable components)
    if (storedSecondary === currentSecondary) {
      return {
        match: false,
        confidence: 30,
        reason: 'major_hardware_change',
        message: 'Perubahan hardware signifikan, butuh re-aktivasi'
      };
    }
    
    return {
      match: false,
      confidence: 0,
      reason: 'completely_different',
      message: 'Komputer berbeda atau perubahan hardware major'
    };
  }
}
```

### Smart Hardware Validation Logic
```javascript
// pos-backend/services/installationValidator.js
class InstallationValidator {
  async validateInstallation(serialNumber, currentFingerprint) {
    const existingInstallations = await this.getInstallations(serialNumber);
    
    for (const installation of existingInstallations) {
      const validation = await this.fingerprint.validateHardwareChange(
        installation.hardware_id,
        currentFingerprint
      );
      
      if (validation.match) {
        // Update fingerprint jika ada perubahan minor
        if (validation.confidence < 100) {
          await this.updateHardwareFingerprint(
            installation.id, 
            currentFingerprint,
            validation.reason
          );
        }
        
        return {
          success: true,
          action: 'existing_installation_updated',
          slot: installation.installation_slot,
          confidence: validation.confidence,
          message: validation.message
        };
      }
    }
    
    // Tidak ada match, butuh slot baru
    return await this.createNewInstallation(serialNumber, currentFingerprint);
  }
  
  async updateHardwareFingerprint(installationId, newFingerprint, reason) {
    await db.query(`
      UPDATE license_installations 
      SET hardware_id = ?,
          last_seen = CURRENT_TIMESTAMP,
          hardware_change_reason = ?
      WHERE id = ?
    `, [newFingerprint, reason, installationId]);
    
    // Log perubahan untuk audit
    await this.logHardwareChange(installationId, newFingerprint, reason);
  }
}
```
```

## 6. Strategi Offline-First Validation

### Mengatasi Masalah Server Railway Down

```mermaid
flowchart TD
    A[User Input SN] --> B[Local SN Format Validation]
    B -->|Valid Format| C[Check CRC32 Checksum]
    C -->|Valid CRC| D{Network Available?}
    
    D -->|Yes| E[Try Railway Server]
    D -->|No| F[Local Validation Database]
    
    E -->|Success| G[Update Local Cache]
    E -->|Timeout/Error| F
    
    F --> H{SN in Local DB?}
    H -->|Yes| I[Activate Locally]
    H -->|No| J[Add to Pending Queue]
    
    G --> K[Activation Complete]
    I --> K
    J --> L[Temporary Activation - 30 days]
    L --> M[Auto-sync when online]
    
    K --> N[Reset Transaction Counter]
    L --> N
    
    style E fill:#4caf50
    style F fill:#ff9800
    style L fill:#2196f3
    style K fill:#4caf50
```

### Pre-loaded SN Database
```javascript
// pos-backend/data/preloaded-sns.js
// Database SN yang sudah di-embed ke aplikasi untuk offline validation
const PRELOADED_SNS = {
  // Format: SN -> { valid: boolean, type: string, expiry: date }
  'DMPOS-2024-S-123456-AB12': {
    valid: true,
    type: 'single',
    generated: '2024-01-01',
    expires: null // no expiry for this example
  },
  'DMPOS-2024-M-789012-CD34': {
    valid: true,
    type: 'multi',
    generated: '2024-01-01', 
    expires: null
  }
  // Ribuan SN lainnya...
};

class OfflineValidator {
  async validateSN(serialNumber) {
    // 1. Format validation
    if (!this.isValidFormat(serialNumber)) {
      return { valid: false, reason: 'Invalid format' };
    }
    
    // 2. CRC validation
    if (!this.isValidCRC(serialNumber)) {
      return { valid: false, reason: 'Invalid checksum' };
    }
    
    // 3. Check preloaded database
    const snData = PRELOADED_SNS[serialNumber];
    if (snData && snData.valid) {
      return { 
        valid: true, 
        type: snData.type,
        offline: true,
        message: 'Validated offline - will sync when online'
      };
    }
    
    // 4. Unknown SN - queue for online validation
    await this.queueForOnlineValidation(serialNumber);
    return {
      valid: true, // Give benefit of doubt
      type: 'unknown',
      temporary: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      message: 'Temporary activation - requires online verification'
    };
  }
  
  async queueForOnlineValidation(serialNumber) {
    const queue = await this.getValidationQueue();
    queue.push({
      serialNumber,
      timestamp: new Date(),
      attempts: 0
    });
    await this.saveValidationQueue(queue);
  }
}
```

### Background Sync Service
```javascript
// pos-backend/services/backgroundSync.js
class BackgroundSyncService {
  constructor() {
    this.syncInterval = 60000; // 1 menit
    this.isOnline = false;
    this.pendingValidations = [];
  }
  
  start() {
    setInterval(() => {
      this.checkConnectivity();
      if (this.isOnline) {
        this.processPendingValidations();
      }
    }, this.syncInterval);
  }
  
  async checkConnectivity() {
    try {
      const response = await fetch('https://dmpos-railway.app/health', {
        timeout: 5000
      });
      this.isOnline = response.ok;
    } catch (error) {
      this.isOnline = false;
    }
  }
  
  async processPendingValidations() {
    const queue = await this.getValidationQueue();
    
    for (const item of queue) {
      try {
        const result = await this.validateWithServer(item.serialNumber);
        
        if (!result.valid) {
          // SN tidak valid - revoke temporary activation
          await this.revokeTemporaryActivation(item.serialNumber);
        }
        
        // Remove from queue
        await this.removeFromQueue(item.serialNumber);
      } catch (error) {
        item.attempts++;
        if (item.attempts >= 10) {
          // Too many failed attempts - remove from queue
          await this.removeFromQueue(item.serialNumber);
        }
      }
    }
  }
}
```
```

## 7. Dashboard Integration (Status Only)

### Prinsip: Dashboard = Status Display Only
Sesuai dengan masukan Pak Picca, Dashboard hanya menampilkan status lisensi, bukan tempat aktivasi.

```mermaid
graph LR
    A[Dashboard Header] --> B[License Status Badge]
    B --> C[🟢 Fully Activated]
    B --> D[🟡 Trial Mode - X transactions left]
    B --> E[🔴 Activation Required]
    B --> F[🟣 Temporary License - sync pending]
    
    C --> G[Tooltip: SN ending with ****]
    D --> H[Tooltip: Activate in POS Cashier]
    E --> I[Tooltip: Go to POS to activate]
    F --> J[Tooltip: Will verify when online]
    
    style C fill:#4caf50
    style D fill:#ffd54f
    style E fill:#f44336
    style F fill:#9c27b0
```

### Status Widget Implementation
```javascript
// src/components/LicenseStatusBadge.jsx
const LicenseStatusBadge = () => {
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    fetchLicenseStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLicenseStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchLicenseStatus = async () => {
    try {
      const result = await api.get('/api/license/status');
      setStatus(result.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Status unavailable' });
    }
  };
  
  const getStatusDisplay = () => {
    if (!status) return { icon: '⏳', text: 'Loading...', color: 'gray' };
    
    switch (status.type) {
      case 'activated':
        return {
          icon: '🟢',
          text: 'Fully Activated',
          color: 'green',
          tooltip: `SN: ****${status.serialNumber?.slice(-4)}`
        };
      case 'trial':
        return {
          icon: '🟡',
          text: `Trial: ${status.remaining} left`,
          color: 'orange',
          tooltip: 'Activate in POS Cashier to unlock unlimited transactions'
        };
      case 'expired':
        return {
          icon: '🔴',
          text: 'Activation Required',
          color: 'red',
          tooltip: 'Go to POS Cashier to activate'
        };
      case 'temporary':
        return {
          icon: '🟣',
          text: 'Temporary License',
          color: 'purple',
          tooltip: 'Will verify when online'
        };
      default:
        return {
          icon: '❓',
          text: 'Unknown Status',
          color: 'gray',
          tooltip: 'Status unknown'
        };
    }
  };
  
  const statusInfo = getStatusDisplay();
  
  return (
    <Tooltip title={statusInfo.tooltip}>
      <Chip
        icon={<span>{statusInfo.icon}</span>}
        label={statusInfo.text}
        color={statusInfo.color}
        variant="filled"
        size="small"
        sx={{ cursor: 'help' }}
      />
    </Tooltip>
  );
};
```

## 8. User Interface untuk Installation Management

[Content continues with the existing UI management section...]

## 9. Step-by-Step Implementation Guide

### 🚀 Phase 1: Setup Railway Server (30 menit)

#### 1.1. Create Railway Account & Project
```bash
# 1. Buka https://railway.app
# 2. Sign up dengan GitHub
# 3. Create New Project → "Deploy from GitHub repo" atau "Empty Project"
```

#### 1.2. Setup PostgreSQL Database
```bash
# Di Railway Dashboard:
# 1. Add Service → Database → PostgreSQL
# 2. Copy DATABASE_URL yang diberikan
# Format: postgresql://username:password@host:port/database
```

#### 1.3. Create Simple Railway API
Buat folder baru `dmpos-railway-api/`:

```javascript
// package.json
{
  "name": "dmpos-activation-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "cors": "^2.8.5",
    "crypto": "^1.0.1"
  }
}
```

```javascript
// server.js - Simple Railway API
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import crypto from 'crypto';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DM POS Activation Server running' });
});

// Initialize database tables
app.post('/init-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS serial_numbers (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        max_installations INTEGER DEFAULT 3,
        current_installations INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activations (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(50) REFERENCES serial_numbers(serial_number),
        hardware_id VARCHAR(64) NOT NULL,
        installation_slot INTEGER NOT NULL,
        activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active'
      )
    `);
    
    res.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate test serial numbers
app.post('/generate-test-sns', async (req, res) => {
  try {
    const testSNs = [];
    
    for (let i = 1; i <= 10; i++) {
      const year = new Date().getFullYear();
      const random = String(i).padStart(6, '0');
      const baseString = `DMPOS-${year}-${random}-`;
      const crc = crypto.createHash('md5').update(baseString).digest('hex').substring(0, 4).toUpperCase();
      const serialNumber = `${baseString}${crc}`;
      
      await pool.query(
        'INSERT INTO serial_numbers (serial_number) VALUES ($1) ON CONFLICT DO NOTHING',
        [serialNumber]
      );
      
      testSNs.push(serialNumber);
    }
    
    res.json({ success: true, serials: testSNs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate serial number
app.post('/api/v1/license/validate', async (req, res) => {
  try {
    const { serialNumber, hardwareId } = req.body;
    
    // Check if SN exists
    const snResult = await pool.query(
      'SELECT * FROM serial_numbers WHERE serial_number = $1',
      [serialNumber]
    );
    
    if (snResult.rows.length === 0) {
      return res.json({ valid: false, reason: 'SN_NOT_FOUND' });
    }
    
    const snData = snResult.rows[0];
    
    // Check current installations
    const installsResult = await pool.query(
      'SELECT * FROM activations WHERE serial_number = $1 AND status = $2',
      [serialNumber, 'active']
    );
    
    // Check if hardware already activated
    const existingInstall = installsResult.rows.find(row => row.hardware_id === hardwareId);
    if (existingInstall) {
      return res.json({ 
        valid: true, 
        existing: true,
        slot: existingInstall.installation_slot,
        message: 'Already activated on this hardware'
      });
    }
    
    // Check if can add new installation
    if (installsResult.rows.length >= snData.max_installations) {
      return res.json({ 
        valid: false, 
        reason: 'MAX_INSTALLATIONS_REACHED',
        installations: installsResult.rows
      });
    }
    
    res.json({ 
      valid: true, 
      canActivate: true,
      remainingSlots: snData.max_installations - installsResult.rows.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activate license
app.post('/api/v1/license/activate', async (req, res) => {
  try {
    const { serialNumber, hardwareId, computerInfo } = req.body;
    
    // Get next available slot
    const slotsResult = await pool.query(
      'SELECT installation_slot FROM activations WHERE serial_number = $1 ORDER BY installation_slot',
      [serialNumber]
    );
    
    let nextSlot = 1;
    const usedSlots = slotsResult.rows.map(row => row.installation_slot);
    while (usedSlots.includes(nextSlot)) {
      nextSlot++;
    }
    
    // Insert activation
    await pool.query(
      'INSERT INTO activations (serial_number, hardware_id, installation_slot) VALUES ($1, $2, $3)',
      [serialNumber, hardwareId, nextSlot]
    );
    
    // Update counter
    await pool.query(
      'UPDATE serial_numbers SET current_installations = current_installations + 1 WHERE serial_number = $1',
      [serialNumber]
    );
    
    res.json({ 
      success: true, 
      slot: nextSlot,
      message: `Activated in slot ${nextSlot}/3`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DM POS Activation Server running on port ${PORT}`);
});
```

#### 1.4. Deploy to Railway
```bash
# Option 1: GitHub Integration
# 1. Push code ke GitHub repo
# 2. Di Railway: Deploy from GitHub → pilih repo
# 3. Add environment variable: NODE_ENV=production

# Option 2: Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

#### 1.5. Test Railway Server
```bash
# Setelah deploy, test endpoints:
curl https://your-app.railway.app/health
curl -X POST https://your-app.railway.app/init-db
curl -X POST https://your-app.railway.app/generate-test-sns
```

### ⚙️ Phase 2: Update pos-backend (1 jam)

#### 2.1. Install Dependencies
```bash
cd pos-backend
npm install sqlite3 node-fetch
```

#### 2.2. Create Activation Service
```javascript
// pos-backend/services/activationService.js
const crypto = require('crypto');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fetch = require('node-fetch'); // Add to package.json

class ActivationService {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/activation.db');
    this.railwayUrl = process.env.RAILWAY_API_URL || 'https://your-railway-app.railway.app';
    this.initDB();
  }
  
  initDB() {
    const db = new sqlite3.Database(this.dbPath);
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS transaction_counter (
          id INTEGER PRIMARY KEY,
          total_transactions INTEGER DEFAULT 0,
          license_status VARCHAR(20) DEFAULT 'trial',
          serial_number VARCHAR(50),
          hardware_id VARCHAR(64),
          activation_date DATETIME
        )
      `);
      
      db.run(`
        INSERT OR IGNORE INTO transaction_counter (id, total_transactions) 
        VALUES (1, 0)
      `);
    });
    db.close();
  }
  
  async generateHardwareID() {
    try {
      const components = {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus()[0].model.replace(/\s+/g, ' ').trim(),
        hostname: os.hostname(),
        totalMemory: Math.floor(os.totalmem() / (1024 * 1024 * 1024)) // GB
      };
      
      const fingerprint = JSON.stringify(components);
      const hash = crypto.createHash('sha256').update(fingerprint).digest('hex');
      return hash.substring(0, 24); // 24-character hardware ID
    } catch (error) {
      console.error('Hardware ID generation failed:', error);
      return 'fallback-' + Math.random().toString(36).substring(2, 18);
    }
  }
  
  // [Rest of ActivationService implementation...]
}

module.exports = ActivationService;
```

#### 2.3. Add API Routes to pos-backend
```javascript
// pos-backend/index.js atau service.js - tambahkan routes
const ActivationService = require('./services/activationService');
const activationService = new ActivationService();

// Transaction counter increment
app.post('/api/transaction/increment-counter', async (req, res) => {
  try {
    const result = await activationService.incrementTransaction();
    res.json(result);
  } catch (error) {
    if (error.message === 'TRIAL_LIMIT_REACHED') {
      res.status(403).json({ error: 'TRIAL_LIMIT_REACHED', message: 'Aktivasi diperlukan' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// [Other activation routes...]
```

### 🎨 Phase 3: Update React Frontend (45 menit)

#### 3.1. Create Activation Components
```bash
mkdir src/components/activation
```

```javascript
// src/components/activation/ActivationDialog.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, AlertTitle, Typography,
  CircularProgress, Box, Paper
} from '@mui/material';
import { api } from '../../api';

const ActivationDialog = ({ open, onClose, required, counterData, onActivated }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  
  const handleActivation = async () => {
    try {
      setActivating(true);
      setError('');
      
      // Validate and activate
      const result = await api.post('/api/activation/activate', {
        serialNumber: serialNumber.toUpperCase()
      });
      
      if (result.data.success) {
        alert('🎉 Aktivasi berhasil! Aplikasi sekarang unlimited.');
        onActivated && onActivated();
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Aktivasi gagal. Coba lagi.');
    } finally {
      setActivating(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={!required ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <span>🔐</span>
          <Typography variant="h6">
            {required ? 'Aktivasi Diperlukan' : 'Aktivasi Lisensi'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {counterData && (
          <Alert severity={counterData.warning || 'info'} sx={{ mb: 2 }}>
            <AlertTitle>Status Transaksi</AlertTitle>
            {counterData.remaining === 'unlimited' 
              ? 'Transaksi unlimited - Sudah teraktivasi'
              : `${counterData.remaining} transaksi tersisa dari 99 trial`
            }
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          fullWidth
          label="Serial Number"
          placeholder="DMPOS-2024-XXXXXX-XXXX"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
          margin="normal"
          helperText="Format: DMPOS-YYYY-XXXXXX-CRC (1 lisensi = 3 instalasi)"
          error={!!error}
        />
        
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
          <Typography variant="subtitle2" gutterBottom>
            ℹ️ Informasi Lisensi
          </Typography>
          <Typography variant="body2">
            • Satu Serial Number dapat diinstall di <strong>3 komputer berbeda</strong><br/>
            • Cocok untuk backup saat komputer rusak atau format ulang<br/>
            • Aktivasi akan menggunakan slot instalasi yang tersedia
          </Typography>
        </Paper>
      </DialogContent>
      
      <DialogActions>
        {!required && (
          <Button onClick={onClose} disabled={activating}>
            Batal
          </Button>
        )}
        <Button 
          onClick={handleActivation} 
          variant="contained"
          disabled={!serialNumber || activating}
          startIcon={activating ? <CircularProgress size={20} /> : <span>🚀</span>}
        >
          {activating ? 'Mengaktivasi...' : 'Aktivasi Sekarang'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivationDialog;
```

#### 3.2. Update POSPage dengan Activation
```javascript
// src/pages/POSPage.jsx - tambahkan integration
import ActivationDialog from '../components/activation/ActivationDialog';

// Add state management for activation
const [showActivationModal, setShowActivationModal] = useState(false);
const [activationRequired, setActivationRequired] = useState(false);
const [transactionCounter, setTransactionCounter] = useState(null);

// Update transaction handling
const handleAddTransaction = async (transactionData) => {
  try {
    // Increment counter before transaction
    const counterResult = await api.post('/api/transaction/increment-counter');
    setTransactionCounter(counterResult.data);
    
    if (counterResult.data.warning) {
      // Show warning notification
      setSnackbar({
        open: true,
        message: `⚠️ ${counterResult.data.remaining} transaksi tersisa! Aktivasi segera.`,
        severity: 'warning',
        action: (
          <Button color="inherit" onClick={() => setShowActivationModal(true)}>
            AKTIVASI
          </Button>
        )
      });
    }
    
    // Continue with normal transaction
    const result = await transactionAPI.create(transactionData);
    return result;
  } catch (error) {
    if (error.response?.data?.error === 'TRIAL_LIMIT_REACHED') {
      setActivationRequired(true);
      setShowActivationModal(true);
      throw new Error('Aktivasi diperlukan untuk melanjutkan transaksi');
    }
    throw error;
  }
};

// Add to JSX return:
<ActivationDialog 
  open={showActivationModal}
  onClose={() => !activationRequired && setShowActivationModal(false)}
  required={activationRequired}
  counterData={transactionCounter}
  onActivated={() => {
    setActivationRequired(false);
    setShowActivationModal(false);
    // Refresh status
    setTransactionCounter({ remaining: 'unlimited', warning: null });
  }}
/>
```

### ✅ Phase 4: Testing (15 menit)

#### 4.1. Test Railway Server
```bash
# Test health
curl https://your-app.railway.app/health

# Initialize DB
curl -X POST https://your-app.railway.app/init-db

# Generate test SNs
curl -X POST https://your-app.railway.app/generate-test-sns
# Copy salah satu SN untuk testing
```

#### 4.2. Test Local Application
```bash
# Start development
cd dm-pos-react
npm run dev

# Test sequence:
# 1. Buka POS page
# 2. Buat transaksi sampai counter mendekati 99
# 3. Lihat warning notifications
# 4. Saat counter = 99, dialog aktivasi akan muncul
# 5. Input test SN dari Railway
# 6. Verify unlimited transactions
```

### 🎯 Quick Start Commands:

```bash
# 1. Setup Railway (di browser)
# Buka railway.app → Sign up → Create project → Add PostgreSQL

# 2. Deploy Railway API
git clone <railway-api-repo>
cd dmpos-railway-api
npm install
# Deploy via Railway dashboard

# 3. Update pos-backend
cd pos-backend
npm install sqlite3 node-fetch
# Copy activationService.js code above
# Update routes in index.js/service.js

# 4. Update React frontend
cd src/components
mkdir activation
# Copy ActivationDialog.jsx code above
# Update POSPage.jsx

# 5. Test!
npm run dev
```

Pak Picca tinggal ikuti step-by-step ini, Railway setup-nya gampang banget! 30 menit pertama Railway sudah jalan, 1 jam kemudian backend update, 45 menit frontend, dan 15 menit testing. Total 2.5 jam sudah jadi sistem aktivasi lengkap! 🚀
        };
      case 'trial':
        return {
          icon: '🟡',
          text: `Trial: ${status.remaining} left`,
          color: 'orange',
          tooltip: 'Activate in POS Cashier to unlock unlimited transactions'
        };
      case 'expired':
        return {
          icon: '🔴',
          text: 'Activation Required',
          color: 'red',
          tooltip: 'Go to POS Cashier to activate'
        };
      case 'temporary':
        return {
          icon: '🟣',
          text: 'Temporary License',
          color: 'purple',
          tooltip: 'Will verify when online'
        };
      default:
        return {
          icon: '❓',
          text: 'Unknown Status',
          color: 'gray',
          tooltip: 'Status unknown'
        };
    }
  };
  
  const statusInfo = getStatusDisplay();
  
  return (
    <Tooltip title={statusInfo.tooltip}>
      <Chip
        icon={<span>{statusInfo.icon}</span>}
        label={statusInfo.text}
        color={statusInfo.color}
        variant="filled"
        size="small"
        sx={{ cursor: 'help' }}
      />
    </Tooltip>
  );
};
```

## 8. User Interface untuk Installation Management

### Activation Dialog dengan Installation Info
```javascript
// src/components/activation/ActivationDialog.jsx
const ActivationDialog = ({ open, onClose, required, counterData }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [installationInfo, setInstallationInfo] = useState(null);
  const [activating, setActivating] = useState(false);
  
  const handleActivation = async () => {
    try {
      setActivating(true);
      const result = await api.post('/api/activation/activate', {
        serialNumber: serialNumber.toUpperCase(),
        computerInfo: {
          name: navigator.platform,
          os: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
      
      if (result.data.success) {
        setSnackbar({
          open: true,
          message: `Aktivasi berhasil! Slot ${result.data.slot}/3 terpakai.`,
          severity: 'success'
        });
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.code === 'MAX_INSTALLATIONS_REACHED') {
        setInstallationInfo(error.response.data.installations);
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Aktivasi gagal',
          severity: 'error'
        });
      }
    } finally {
      setActivating(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={!required ? onClose : undefined} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon>🔐</Icon>
          <Typography variant="h6">
            {required ? 'Aktivasi Diperlukan' : 'Aktivasi Lisensi'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Transaction Counter Info */}
        {counterData && (
          <Alert severity={counterData.warning || 'info'} sx={{ mb: 2 }}>
            <AlertTitle>Status Transaksi</AlertTitle>
            {counterData.remaining === 'unlimited' 
              ? 'Transaksi unlimited - Sudah teraktivasi'
              : `${counterData.remaining} transaksi tersisa dari 99 trial`
            }
          </Alert>
        )}
        
        {/* Serial Number Input */}
        <TextField
          fullWidth
          label="Serial Number"
          placeholder="DMPOS-2024-XXXXXX-XXXX"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
          margin="normal"
          helperText="Format: DMPOS-YYYY-XXXXXX-CRC (1 lisensi = 3 instalasi)"
        />
        
        {/* Installation Limit Info */}
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
          <Typography variant="subtitle2" gutterBottom>
            ℹ️ Informasi Lisensi
          </Typography>
          <Typography variant="body2">
            • Satu Serial Number dapat diinstall di <strong>3 komputer berbeda</strong><br/>
            • Cocok untuk backup saat komputer rusak atau format ulang<br/>
            • Aktivasi akan menggunakan slot instalasi yang tersedia
          </Typography>
        </Paper>
        
        {/* Installation Slots Display */}
        {installationInfo && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'warning.light' }}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              ⚠️ Maksimum Instalasi Tercapai (3/3)
            </Typography>
            <Typography variant="body2" gutterBottom>
              Serial Number ini sudah digunakan di 3 komputer:
            </Typography>
            <List dense>
              {installationInfo.map((install, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Chip 
                      label={`Slot ${install.slot}`} 
                      size="small" 
                      color={install.status === 'active' ? 'success' : 'default'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={install.computer_name || 'Unknown Computer'}
                    secondary={`Last seen: ${new Date(install.last_seen).toLocaleDateString()}`}
                  />
                  {install.status === 'inactive' && (
                    <ListItemSecondaryAction>
                      <Chip label="Inactive" size="small" color="warning" />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hubungi support untuk transfer lisensi atau non-aktifkan instalasi lama.
            </Typography>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions>
        {!required && (
          <Button onClick={onClose} disabled={activating}>
            Batal
          </Button>
        )}
        <Button 
          onClick={handleActivation} 
          variant="contained"
          disabled={!serialNumber || activating}
          startIcon={activating ? <CircularProgress size={20} /> : <Icon>🚀</Icon>}
        >
          {activating ? 'Mengaktivasi...' : 'Aktivasi Sekarang'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## 9. Penanganan Error & Mekanisme Fallback

### Masalah Konektivitas Jaringan
```mermaid
graph TD
    A[Permintaan Validasi] --> B{Jaringan Tersedia?}
    B -->|Ya| C[Kirim ke Server Railway]
    B -->|Tidak| D[Cek Cache Lokal]
    C --> E{Respon Server?}
    E -->|Berhasil| F[Update Cache Lokal]
    E -->|Timeout/Error| D
    D --> G{Cache Valid?}
    G -->|Ya| H[Izinkan Akses Terbatas]
    G -->|Tidak| I[Tampilkan Dialog Mode Offline]
    F --> J[Berikan Akses Penuh]
    H --> K[Sinkronisasi Saat Online]
    
    style J fill:#4caf50
    style H fill:#ff9800
    style I fill:#f44336
```

### Strategi Fallback
1. **Mode Offline**: Fungsionalitas terbatas selama 7 hari tanpa validasi server
2. **Periode Grace**: Periode grace 3 hari untuk perpanjangan lisensi
3. **Akses Darurat**: Override admin untuk operasi bisnis kritis
4. **Validasi Lokal**: Validasi CRC dan format saat server tidak dapat dijangkau

### Jenis Error & Pesan Pengguna
```javascript
const ActivationErrors = {
  INVALID_FORMAT: {
    code: 'E001',
    message: 'Format Serial Number tidak valid. Harap periksa dan coba lagi.',
    action: 'retry'
  },
  SN_NOT_FOUND: {
    code: 'E002', 
    message: 'Serial Number tidak ditemukan dalam database.',
    action: 'contact_support'
  },
  HARDWARE_MISMATCH: {
    code: 'E003',
    message: 'Hardware ID tidak cocok. Aplikasi sudah diaktivasi di perangkat lain.',
    action: 'transfer_license'
  },
  EXPIRED_LICENSE: {
    code: 'E004',
    message: 'Lisensi telah berakhir. Silakan perbarui lisensi Anda.',
    action: 'renew_license'
  },
  NETWORK_ERROR: {
    code: 'E005',
    message: 'Tidak dapat terhubung ke server aktivasi. Coba lagi nanti.',
    action: 'retry_later'
  }
};
```

## 10. Pertimbangan Keamanan

### Perlindungan Data
- **Enkripsi Data Lisensi**: Enkripsi AES-256 untuk penyimpanan lisensi lokal
- **Obfuskasi Hardware ID**: Hashing SHA-256 dari sidik jari hardware
- **Komunikasi Aman**: TLS 1.3 untuk semua komunikasi server
- **Anti-Tampering**: Code signing dan verifikasi integritas

### Pencegahan Serangan
```mermaid
graph LR
    A[Vektor Serangan] --> B[Manipulasi Jam Sistem]
    A --> C[Tampering File Lisensi]
    A --> D[Spoofing Hardware ID]
    A --> E[Replay Attacks]
    
    B --> F[Validasi Waktu Server]
    C --> G[Tanda Tangan Digital]
    D --> H[Multiple Hardware Sources]
    E --> I[Nonce + Timestamps]
    
    style F fill:#4caf50
    style G fill:#4caf50  
    style H fill:#4caf50
    style I fill:#4caf50
```

### Langkah-langkah Keamanan Implementasi
1. **Obfuskasi Kode**: Obfuskasi logika aktivasi kritis
2. **Certificate Pinning**: Validasi sertifikat server Railway
3. **Proteksi Sandbox**: Best practices keamanan Electron
4. **Audit Logging**: Logging lengkap percobaan aktivasi

## 11. Desain User Interface

### Layout Dialog Aktivasi
```mermaid
graph TB
    A[Modal Dialog - Aktivasi Diperlukan] --> B[Header: Logo Produk + Judul]
    B --> C[Tampilan Hardware ID - Read Only]
    C --> D[Field Input Serial Number]
    D --> E[Indikator Progress Validasi]
    E --> F[Baris Tombol Aksi]
    F --> G[Tombol Aktivasi]
    F --> H[Tombol Batal]
    F --> I[Link Bantuan/Support]
    
    style A fill:#f5f5f5
    style G fill:#2196f3
    style H fill:#757575
    style I fill:#ff9800
```

### Titik Integrasi Status Lisensi
1. **Header Dashboard**: Badge status lisensi yang selalu terlihat
2. **Halaman Settings**: Panel informasi lisensi detail
3. **Dialog About**: Detail lisensi dan aktivasi
4. **Layar Startup**: Progress aktivasi saat app launch

### Alur Pengalaman Pengguna
```mermaid
journey
    title Perjalanan Aktivasi Pengguna
    section Peluncuran Pertama
      Buka Aplikasi: 3: Pengguna
      Lihat Dialog Aktivasi: 2: Pengguna
      Lihat Hardware ID: 4: Pengguna
      Masukkan Serial Number: 3: Pengguna
      Klik Aktivasi: 5: Pengguna
      
    section Proses Validasi  
      Tampilkan Progress: 4: Sistem
      Validasi dengan Server: 3: Sistem
      Simpan Lisensi: 5: Sistem
      Tampilkan Sukses: 5: Pengguna
      
    section Penggunaan Normal
      Luncurkan Aplikasi: 5: Pengguna
      Auto-validasi: 5: Sistem
      Gunakan Aplikasi: 5: Pengguna
```

## 12. Strategi Testing

### Cakupan Unit Testing
```
src/tests/activation/
├── serialNumber.test.js      # Format dan validasi SN
├── hardwareId.test.js        # Hardware fingerprinting
├── licenseValidation.test.js # Logika validasi lokal
├── apiCommunication.test.js  # Komunikasi server Railway
└── encryptionUtils.test.js   # Fungsi enkripsi/dekripsi
```

### Integration Testing
1. **Alur Aktivasi End-to-End**: Journey aktivasi pengguna lengkap
2. **Komunikasi Server**: Testing integrasi API Railway
3. **Mode Offline**: Skenario kegagalan jaringan
4. **Perubahan Hardware**: Testing migrasi perangkat

### Security Testing
- **Penetration Testing**: Percobaan bypass lisensi
- **Validasi Enkripsi**: Verifikasi perlindungan data
- **Anti-Tampering**: Deteksi modifikasi kode
- **Performance Testing**: Kecepatan dan keandalan aktivasi

## 13. Deployment & Distribusi

### Deployment Server Railway
```yaml
# railway.toml
[build]
  builder = "NIXPACKS"
  
[deploy]
  numReplicas = 2
  restartPolicyType = "ON_FAILURE"
  
[env]
  NODE_ENV = "production"
  DATABASE_URL = "${{ PostgreSQL.DATABASE_URL }}"
  JWT_SECRET = "${{ secrets.JWT_SECRET }}"
  API_KEY = "${{ secrets.API_KEY }}"
```

### Update Aplikasi Klien
- **Integrasi Auto-update**: Electron auto-updater dengan validasi lisensi
- **Kompatibilitas Versi**: Sistem aktivasi backward compatible
- **Script Migrasi**: Migrasi data lisensi untuk update

### Konfigurasi Environment
```javascript
// pos-backend/.env tambahan
ACTIVATION_SERVER_URL=https://dmpos-activation.railway.app
ACTIVATION_API_KEY=your_api_key_here
CLIENT_ID=dmpos_client_v1
HARDWARE_ID_SALT=your_salt_here
LICENSE_ENCRYPTION_KEY=your_encryption_key_here
```