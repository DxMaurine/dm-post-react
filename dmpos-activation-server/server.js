// DM POS Activation Server - Neon Edition
// Deploy ke Vercel/Netlify atau jalankan lokal

import express from 'express';
import { neon } from '@neondatabase/serverless';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// Neon database connection dengan serverless
const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_PEwAjc0vm1od@ep-tiny-night-a1axn9lu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DM POS Activation Server (Neon) running' });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      timestamp: result[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// List test serial numbers
app.get('/api/test-serials', async (req, res) => {
  try {
    const result = await sql`SELECT serial_number, status, max_installations FROM serial_numbers ORDER BY created_at`;
    res.json({ 
      success: true, 
      serials: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Validate serial number dan hardware
app.post('/api/v1/license/validate', async (req, res) => {
  try {
    const { serialNumber, hardwareId } = req.body;
    
    console.log(`[VALIDATE] SN: ${serialNumber}, Hardware: ${hardwareId?.substring(0, 8)}...`);
    
    // Check if SN exists
    const snResult = await sql`
      SELECT * FROM serial_numbers WHERE serial_number = ${serialNumber}
    `;
    
    if (snResult.length === 0) {
      return res.json({ valid: false, reason: 'SN_NOT_FOUND' });
    }
    
    const snData = snResult[0];
    
    // Check current installations for this SN
    const installsResult = await sql`
      SELECT * FROM activations 
      WHERE serial_number = ${serialNumber} AND status = 'active'
    `;
    
    // Check if hardware already activated with this SN
    const existingInstall = installsResult.find(row => row.hardware_id === hardwareId);
    if (existingInstall) {
      // Update last_seen
      await sql`
        UPDATE activations 
        SET last_seen = CURRENT_TIMESTAMP 
        WHERE id = ${existingInstall.id}
      `;
      
      return res.json({ 
        valid: true, 
        existing: true,
        slot: existingInstall.installation_slot,
        message: 'Already activated on this hardware'
      });
    }
    
    // Check if this hardware is already used by ANY other SN
    const crossSnCheck = await sql`
      SELECT a.*, s.serial_number 
      FROM activations a
      JOIN serial_numbers s ON a.serial_number = s.serial_number
      WHERE a.hardware_id = ${hardwareId} 
      AND a.serial_number != ${serialNumber}
      AND a.status = 'active'
    `;
    
    if (crossSnCheck.length > 0) {
      const conflictSn = crossSnCheck[0].serial_number;
      return res.json({ 
        valid: false, 
        reason: 'HARDWARE_ALREADY_USED',
        message: `Hardware sudah terikat dengan SN lain: ${conflictSn.substring(0, 10)}...`,
        conflictSerialNumber: conflictSn
      });
    }
    
    // Check if can add new installation
    if (installsResult.length >= snData.max_installations) {
      return res.json({ 
        valid: false, 
        reason: 'MAX_INSTALLATIONS_REACHED',
        installations: installsResult.map(row => ({
          slot: row.installation_slot,
          computer_name: row.computer_name,
          last_seen: row.last_seen,
          status: row.status
        }))
      });
    }
    
    res.json({ 
      valid: true, 
      canActivate: true,
      remainingSlots: snData.max_installations - installsResult.length
    });
  } catch (error) {
    console.error('[VALIDATE ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// Activate license
app.post('/api/v1/license/activate', async (req, res) => {
  try {
    const { serialNumber, hardwareId, computerInfo } = req.body;
    
    console.log(`[ACTIVATE] SN: ${serialNumber}, Hardware: ${hardwareId?.substring(0, 8)}...`);
    
    // Get next available slot
    const slotsResult = await sql`
      SELECT installation_slot FROM activations 
      WHERE serial_number = ${serialNumber} 
      ORDER BY installation_slot
    `;
    
    let nextSlot = 1;
    const usedSlots = slotsResult.map(row => row.installation_slot);
    while (usedSlots.includes(nextSlot)) {
      nextSlot++;
    }
    
    // Insert activation
    await sql`
      INSERT INTO activations 
      (serial_number, hardware_id, installation_slot, computer_name, os_info) 
      VALUES (${serialNumber}, ${hardwareId}, ${nextSlot}, 
              ${computerInfo?.name || 'Unknown Computer'}, 
              ${computerInfo?.userAgent || 'Unknown OS'})
    `;
    
    // Update counter
    await sql`
      UPDATE serial_numbers 
      SET current_installations = current_installations + 1 
      WHERE serial_number = ${serialNumber}
    `;
    
    console.log(`[ACTIVATE SUCCESS] Slot ${nextSlot} activated`);
    
    res.json({ 
      success: true, 
      slot: nextSlot,
      message: `Aktivasi berhasil di slot ${nextSlot}/3`
    });
  } catch (error) {
    console.error('[ACTIVATE ERROR]', error);
    res.status(500).json({ error: error.message });
  }
});

// Status endpoint untuk debugging
app.get('/api/status/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    const snResult = await sql`
      SELECT * FROM serial_numbers WHERE serial_number = ${serialNumber}
    `;
    
    if (snResult.length === 0) {
      return res.status(404).json({ error: 'Serial number not found' });
    }
    
    const installsResult = await sql`
      SELECT * FROM activations 
      WHERE serial_number = ${serialNumber} 
      ORDER BY installation_slot
    `;
    
    res.json({
      serialNumber: snResult[0],
      installations: installsResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DM POS Activation Server running on port ${PORT}`);
  console.log(`📊 Database: Neon PostgreSQL`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;