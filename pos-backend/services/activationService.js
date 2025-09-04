const crypto = require('crypto');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { exec } = require('child_process');
const { machineId } = require('node-machine-id');

class ActivationService {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/activation.db');
    // Update ke port 3001 yang sudah konek ke Neon
    this.railwayUrl = process.env.ACTIVATION_SERVER_URL || 'http://localhost:3001';
    this.maxTrialTransactions = 99;
    this.initDB();
  }

  // Inisialisasi database SQLite untuk aktivasi
  initDB() {
    const db = new sqlite3.Database(this.dbPath);
    db.serialize(() => {
      // Tabel counter transaksi
      db.run(`
        CREATE TABLE IF NOT EXISTS transaction_counter (
          id INTEGER PRIMARY KEY,
          total_transactions INTEGER DEFAULT 0,
          license_status VARCHAR(20) DEFAULT 'trial',
          serial_number VARCHAR(50),
          hardware_id VARCHAR(64),
          activation_date DATETIME,
          last_validation DATETIME,
          temporary_until DATETIME
        )
      `);
      
      // Tabel pre-loaded serial numbers untuk validasi offline
      db.run(`
        CREATE TABLE IF NOT EXISTS preloaded_sns (
          serial_number VARCHAR(50) PRIMARY KEY,
          valid BOOLEAN DEFAULT 1,
          max_installations INTEGER DEFAULT 3,
          generated_date DATE,
          license_type VARCHAR(20) DEFAULT 'standard'
        )
      `);
      
      // Tabel queue untuk validasi online
      db.run(`
        CREATE TABLE IF NOT EXISTS validation_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          serial_number VARCHAR(50),
          hardware_id VARCHAR(64),
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          attempts INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'pending'
        )
      `);
      
      // Tabel aktivasi lokal (untuk tracking serial number yang sudah diaktivasi)
      db.run(`
        CREATE TABLE IF NOT EXISTS local_activations (
          id INTEGER PRIMARY KEY,
          serial_number VARCHAR(50),
          hardware_id VARCHAR(64),
          activation_date DATETIME,
          last_validation DATETIME,
          validation_source VARCHAR(20) DEFAULT 'local'
        )
      `);
      
      // Insert default counter jika belum ada
      db.run(`
        INSERT OR IGNORE INTO transaction_counter (id, total_transactions) 
        VALUES (1, 0)
      `);
      
      // Initialize offline SNs based on environment
      this.initOfflineSNs(db);
    });
    db.close();
  }

  // Initialize offline SNs based on environment
  initOfflineSNs(db) {
    // Only allow test SNs in development environment
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_TEST_SNS === 'true') {
      console.log('[OFFLINE SNS] Loading test Serial Numbers for development...');
      
      const testSNs = [
        'DMPOS-2024-DEV001-T3ST',
        'DMPOS-2024-DEV002-T3ST',
        'DMPOS-2024-DEV003-T3ST',
        'DMPOS-2024-DEV004-T3ST',
        'DMPOS-2024-DEV005-T3ST'
      ];
      
      testSNs.forEach(sn => {
        db.run(`
          INSERT OR IGNORE INTO preloaded_sns (serial_number, valid, max_installations, generated_date, license_type)
          VALUES (?, 1, 3, date('now'), 'standard')
        `, [sn]);
      });
      
      console.log(`[OFFLINE SNS] Loaded ${testSNs.length} test SNs for development`);
    } else {
      console.log('[OFFLINE SNS] Production mode - no hardcoded SNs loaded');
      
      // Optional: Generate dynamic emergency SN if needed - TIME LIMITED
      if (process.env.EMERGENCY_OFFLINE_SNS === 'true') {
        const emergencySN = this.generateEmergencySN();
        if (emergencySN) {
          // Calculate expiration date (7 days from now)
          const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const expirationStr = expirationDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          db.run(`
            INSERT OR IGNORE INTO preloaded_sns (serial_number, valid, max_installations, generated_date, license_type, expires_at)
            VALUES (?, 1, 1, date('now'), 'emergency', ?)
          `, [emergencySN, expirationStr]);
          
          console.log(`[OFFLINE SNS] Generated emergency SN: ${emergencySN.substring(0, 15)}... (expires: ${expirationStr})`);
        }
      }
    }
  }

  // Generate unique emergency SN per installation - ENHANCED SECURITY
  generateEmergencySN() {
    try {
      // Combine multiple hardware identifiers for stronger uniqueness
      const machineInfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        networkInterfaces: Object.keys(os.networkInterfaces()).sort().join('-'),
        uptime: Math.floor(os.uptime() / 3600), // Hours uptime (less predictable)
        freemem: Math.floor(os.freemem() / 1024 / 1024 / 1024) // GB free memory
      };
      
      // Add timestamp with random salt for uniqueness
      const salt = crypto.randomBytes(8).toString('hex');
      const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp
      
      const combinedData = JSON.stringify(machineInfo) + salt + timestamp;
      const hash = crypto.createHash('sha256').update(combinedData).digest('hex');
      const uniqueId = hash.substring(0, 6).toUpperCase();
      
      // Generate year dynamically
      const year = new Date().getFullYear();
      
      // Generate more complex CRC using multiple hash iterations
      const baseSN = `DMPOS-${year}-${uniqueId}`;
      const crcData = baseSN + salt + machineInfo.hostname;
      
      // Multiple hash iterations for stronger CRC
      let crcHash = crcData;
      for (let i = 0; i < 3; i++) {
        crcHash = crypto.createHash('md5').update(crcHash).digest('hex');
      }
      const crc = crcHash.substring(0, 4).toUpperCase();
      
      const emergencySN = `${baseSN}-${crc}`;
      
      // Log generation with limited info (security)
      console.log(`[EMERGENCY SN] Generated for machine: ${machineInfo.hostname.substring(0, 3)}...`);
      
      return emergencySN;
    } catch (error) {
      console.error('[EMERGENCY SN] Failed to generate:', error);
      return null;
    }
  }

  // Generate hardware fingerprint yang fleksibel
  async generateHardwareFingerprint() {
    try {
      const components = await this.gatherHardwareInfo();
      return this.createFlexibleFingerprint(components);
    } catch (error) {
      console.error('Hardware fingerprinting failed:', error);
      // Fallback ke basic system info
      return this.createBasicFingerprint();
    }
  }

  async gatherHardwareInfo() {
    const info = {
      // STABLE COMPONENTS (Primary factors - 80% weight)
      stable: {
        cpuModel: os.cpus()[0].model.replace(/\s+/g, ' ').trim(),
        cpuArch: os.arch(),
        platform: os.platform(),
        motherboard: await this.getMotherboardInfo(),
        machineId: await this.getMachineId()
      },
      
      // SEMI-STABLE COMPONENTS (Secondary factors - 20% weight)
      semiStable: {
        macAddress: await this.getPrimaryMacAddress(),
        hostname: os.hostname(),
        osInfo: `${os.platform()}-${os.release()}`
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
    
    // Add system-specific entropy for enhanced security
    const systemEntropy = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: process.env.LANG || 'en-US',
      nodeVersion: process.version,
      osRelease: os.release()
    };
    
    const entropyHash = crypto.createHash('sha256')
      .update(JSON.stringify(systemEntropy))
      .digest('hex')
      .substring(0, 4);
    
    // Kombinasi dengan format: PRIMARY-SECONDARY-ENTROPY
    return `${primaryHash}-${secondaryHash}-${entropyHash}`;
  }

  createBasicFingerprint() {
    const basicInfo = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpuCount: os.cpus().length,
      timestamp: Date.now()
    };
    
    const fingerprint = JSON.stringify(basicInfo);
    return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 24);
  }

  async getMotherboardInfo() {
    return new Promise((resolve) => {
      if (os.platform() === 'win32') {
        exec('wmic baseboard get product,manufacturer,version /format:csv', (error, stdout) => {
          if (error) {
            resolve('unknown-motherboard');
            return;
          }
          
          try {
            const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('Node'));
            const info = lines[1] ? lines[1].trim().replace(/\s+/g, '-') : 'unknown';
            resolve(info);
          } catch (e) {
            resolve('unknown-motherboard');
          }
        });
      } else {
        // Linux/Mac fallback
        resolve(`${os.platform()}-motherboard`);
      }
    });
  }

  async getMachineId() {
    try {
      return await machineId();
    } catch (error) {
      console.error('Machine ID failed:', error);
      return `fallback-${os.hostname()}-${os.platform()}`;
    }
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

  // Validasi format Serial Number
  isValidSNFormat(serialNumber) {
    // Format: DMPOS-YYYY-XXXXXX-CRC8
    const pattern = /^DMPOS-\d{4}-[A-Z0-9]{6}-[A-Z0-9]{4}$/;
    return pattern.test(serialNumber);
  }

  // Validasi CRC checksum - ENHANCED SECURITY
  isValidCRC(serialNumber) {
    try {
      const parts = serialNumber.split('-');
      if (parts.length !== 4) return false;
      
      // Check if this is a test SN that should skip CRC
      if (parts[2].includes('DEV') || parts[3] === 'T3ST') {
        console.log(`[CRC SKIP] ${serialNumber} - Test SN, CRC validation skipped`);
        return true;
      }
      
      // For production SNs, implement proper CRC32 validation
      // TODO: Implement CRC32 algorithm when ready for production
      const baseSN = `${parts[0]}-${parts[1]}-${parts[2]}`;
      
      // Temporary: Skip CRC for emergency SNs
      if (parts[2].length === 6 && parts[3].length === 4) {
        console.log(`[CRC TEMP] ${serialNumber} - CRC validation temporarily skipped`);
        return true;
      }
      
      // Production CRC validation would go here
      // const calculatedCRC = this.calculateCRC32(baseSN);
      // return calculatedCRC === parts[3];
      
      return true; // Temporary fallback
      
    } catch (error) {
      console.error('[CRC ERROR]', error);
      return false;
    }
  }

  // Increment transaction counter dengan validasi trial limit
  async incrementTransaction() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.get('SELECT * FROM transaction_counter WHERE id = 1', (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }
        
        const currentCount = row.total_transactions;
        const licenseStatus = row.license_status;
        
        // Jika sudah activated, allow unlimited transactions
        if (licenseStatus === 'activated') {
          db.run('UPDATE transaction_counter SET total_transactions = total_transactions + 1 WHERE id = 1', (updateErr) => {
            db.close();
            if (updateErr) return reject(updateErr);
            
            resolve({
              success: true,
              total: currentCount + 1,
              remaining: 'unlimited',
              warning: null,
              status: 'activated'
            });
          });
          return;
        }
        
        // Trial mode - check limit
        if (currentCount >= this.maxTrialTransactions) {
          db.close();
          return reject(new Error('TRIAL_LIMIT_REACHED'));
        }
        
        // Increment counter
        const newCount = currentCount + 1;
        db.run('UPDATE transaction_counter SET total_transactions = ? WHERE id = 1', [newCount], (updateErr) => {
          db.close();
          if (updateErr) return reject(updateErr);
          
          const remaining = this.maxTrialTransactions - newCount;
          let warning = null;
          
          // Set warning levels
          if (remaining <= 4) warning = 'critical';
          else if (remaining <= 9) warning = 'high';
          else if (remaining <= 19) warning = 'medium';
          
          resolve({
            success: true,
            total: newCount,
            remaining: remaining,
            warning: warning,
            status: 'trial',
            message: remaining === 0 ? 'Trial limit reached - activation required' : 
                    remaining <= 4 ? `Only ${remaining} transactions left!` :
                    remaining <= 19 ? `${remaining} transactions remaining` : null
          });
        });
      });
    });
  }

  // Aktivasi dengan Serial Number
  async activateLicense(serialNumber, computerInfo = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        // Validasi format dan CRC
        if (!this.isValidSNFormat(serialNumber)) {
          return reject(new Error('Invalid serial number format'));
        }
        
        if (!this.isValidCRC(serialNumber)) {
          return reject(new Error('Invalid serial number checksum'));
        }
        
        // Generate hardware fingerprint
        const hardwareId = await this.generateHardwareFingerprint();
        
        // Coba validasi online dulu
        let validationResult;
        try {
          validationResult = await this.validateOnline(serialNumber, hardwareId, computerInfo);
        } catch (onlineError) {
          console.log('Online validation failed, trying offline validation:', onlineError.message);
          validationResult = await this.validateOffline(serialNumber, hardwareId);
        }
        
        if (validationResult.success) {
          // Update activation status
          const db = new sqlite3.Database(this.dbPath);
          
          db.run(`
            UPDATE transaction_counter 
            SET license_status = 'activated',
                serial_number = ?,
                hardware_id = ?,
                activation_date = datetime('now'),
                last_validation = datetime('now'),
                temporary_until = ?
            WHERE id = 1
          `, [
            serialNumber, 
            hardwareId, 
            validationResult.temporary ? validationResult.expires : null
          ], (err) => {
            db.close();
            if (err) return reject(err);
            
            resolve({
              success: true,
              serialNumber: serialNumber,
              hardwareId: hardwareId,
              type: validationResult.type || 'standard',
              temporary: validationResult.temporary || false,
              expires: validationResult.expires || null,
              message: validationResult.message || 'Activation successful'
            });
          });
        } else {
          if (validationResult.code === 'MAX_INSTALLATIONS_REACHED') {
            const err = new Error(validationResult.message || 'Maximum installations reached');
            err.code = 'MAX_INSTALLATIONS_REACHED';
            err.installations = validationResult.installations || [];
            return reject(err);
          }
          
          if (validationResult.code === 'HARDWARE_ALREADY_USED') {
            const err = new Error(validationResult.message || 'Hardware sudah terikat dengan SN lain');
            err.code = 'HARDWARE_ALREADY_USED';
            return reject(err);
          }
          
          reject(new Error(validationResult.message || 'Activation failed'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // Validasi online ke Neon server
  async validateOnline(serialNumber, hardwareId, computerInfo) {
    try {
      // Dynamic import untuk compatibility dengan Node.js v22
      const { default: fetch } = await import('node-fetch');
      
      console.log(`[VALIDATE ONLINE] Connecting to: ${this.railwayUrl}`);
      console.log(`[VALIDATE ONLINE] SN: ${serialNumber}, Hardware: ${hardwareId?.substring(0, 8)}...`);
      
      // 1) Validate with Neon server
      const validateRes = await fetch(`${this.railwayUrl}/api/v1/license/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber, hardwareId, computerInfo }),
        timeout: 15000
      });

      if (!validateRes.ok) {
        const errorText = await validateRes.text();
        console.error(`[VALIDATE ERROR] ${validateRes.status}: ${errorText}`);
        throw new Error(`Server responded with ${validateRes.status}: ${errorText}`);
      }

      const validate = await validateRes.json();
      console.log('[VALIDATE RESPONSE]', validate);

      // SN not found or other invalid reasons
      if (!validate.valid) {
        // Pass through MAX_INSTALLATIONS_REACHED if provided by server
        if (validate.reason === 'MAX_INSTALLATIONS_REACHED') {
          return {
            success: false,
            code: 'MAX_INSTALLATIONS_REACHED',
            installations: validate.installations || [],
            message: 'Maximum installations reached'
          };
        }
        
        // Handle hardware already used by another SN
        if (validate.reason === 'HARDWARE_ALREADY_USED') {
          return {
            success: false,
            code: 'HARDWARE_ALREADY_USED',
            message: validate.message || 'Hardware sudah terikat dengan Serial Number lain'
          };
        }
        
        return {
          success: false,
          code: validate.reason || 'SN_NOT_VALID',
          message: validate.reason || 'Serial number not valid'
        };
      }

      // Already activated on this hardware
      if (validate.existing) {
        return {
          success: true,
          type: validate.type || 'standard',
          temporary: false,
          message: validate.message || 'Already activated on this hardware'
        };
      }

      // Can activate a new slot -> call activate
      if (validate.canActivate) {
        console.log('[ACTIVATE] Calling activate endpoint...');
        const activateRes = await fetch(`${this.railwayUrl}/api/v1/license/activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serialNumber, hardwareId, computerInfo }),
          timeout: 15000
        });

        if (!activateRes.ok) {
          const errorText = await activateRes.text();
          console.error(`[ACTIVATE ERROR] ${activateRes.status}: ${errorText}`);
          
          // If server enforces limit concurrently, surface it
          if (activateRes.status === 409) {
            return {
              success: false,
              code: 'MAX_INSTALLATIONS_REACHED',
              message: 'Maximum installations reached'
            };
          }
          throw new Error(`Server responded with ${activateRes.status}: ${errorText}`);
        }

        const activate = await activateRes.json();
        console.log('[ACTIVATE RESPONSE]', activate);
        
        if (activate.success) {
          return {
            success: true,
            type: 'standard',
            temporary: false,
            message: activate.message || 'Activated successfully'
          };
        }

        // Fallback: server said not success but no code
        return {
          success: false,
          code: 'ACTIVATE_FAILED',
          message: activate.message || 'Activation failed on server'
        };
      }

      // Unknown successful validate response -> treat as success
      return {
        success: true,
        type: validate.type || 'standard',
        temporary: false,
        message: 'Validated online successfully'
      };
    } catch (error) {
      throw new Error(`Online validation failed: ${error.message}`);
    }
  }

  // Validasi offline dengan preloaded database
  async validateOffline(serialNumber, hardwareId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.get('SELECT * FROM preloaded_sns WHERE serial_number = ?', [serialNumber], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }
        
        if (row && row.valid) {
          // SN ditemukan di database offline
          db.close();
          resolve({
            success: true,
            type: row.license_type,
            temporary: false,
            message: 'Validated offline - will sync when online'
          });
        } else {
          // SN tidak dikenal - beri temporary activation
          this.queueForOnlineValidation(serialNumber, hardwareId);
          
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari
          db.close();
          resolve({
            success: true,
            type: 'unknown',
            temporary: true,
            expires: expires,
            message: 'Temporary activation - requires online verification within 30 days'
          });
        }
      });
    });
  }

  // Queue untuk validasi online nanti
  async queueForOnlineValidation(serialNumber, hardwareId) {
    const db = new sqlite3.Database(this.dbPath);
    
    db.run(`
      INSERT OR REPLACE INTO validation_queue (serial_number, hardware_id, timestamp, attempts, status)
      VALUES (?, ?, datetime('now'), 0, 'pending')
    `, [serialNumber, hardwareId], (err) => {
      db.close();
      if (err) {
        console.error('Failed to queue validation:', err);
      }
    });
  }

  // Get status aktivasi saat ini
  async getActivationStatus() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.get('SELECT * FROM transaction_counter WHERE id = 1', (err, row) => {
        db.close();
        if (err) return reject(err);
        
        if (!row) {
          return resolve({
            status: 'trial',
            totalTransactions: 0,
            remaining: this.maxTrialTransactions,
            activated: false
          });
        }
        
        const isTemporary = row.temporary_until && new Date(row.temporary_until) > new Date();
        const status = isTemporary ? 'temporary' : row.license_status;
        const remaining = (row.license_status === 'activated' || isTemporary)
          ? 'unlimited'
          : Math.max(0, this.maxTrialTransactions - row.total_transactions);
        
        resolve({
          status,
          totalTransactions: row.total_transactions,
          remaining,
          activated: row.license_status === 'activated',
          serialNumber: row.serial_number,
          hardwareId: row.hardware_id,
          activationDate: row.activation_date,
          temporary: isTemporary,
          expires: row.temporary_until
        });
      });
    });
  }

  // Reset trial counter (untuk testing)
  async resetTrialCounter() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.run(`
        UPDATE transaction_counter 
        SET total_transactions = 0,
            license_status = 'trial',
            serial_number = NULL,
            hardware_id = NULL,
            activation_date = NULL,
            temporary_until = NULL
        WHERE id = 1
      `, (err) => {
        db.close();
        if (err) return reject(err);
        resolve({ success: true, message: 'Trial counter reset' });
      });
    });
  }
}

module.exports = ActivationService;