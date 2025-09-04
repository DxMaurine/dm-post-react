/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  AlertTitle,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  IconButton,
  Divider,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Security as SecurityIcon,
  Computer as ComputerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const ActivationDialog = ({ 
  open, 
  onClose, 
  required = false, 
  counterData = null, 
  onActivated = null 
}) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [installationInfo, setInstallationInfo] = useState(null);
  const [hardwareId, setHardwareId] = useState('');

  // Reset state saat dialog dibuka
  useEffect(() => {
    if (open) {
      setSerialNumber('');
      setError('');
      setSuccess('');
      setInstallationInfo(null);
      fetchHardwareId();
    }
  }, [open]);

  const fetchHardwareId = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/activation/hardware-id');
      const data = await response.json();
      setHardwareId(data.hardwareId || 'Unknown');
    } catch (error) {
      setHardwareId('Unable to generate');
    }
  };

  // Format helper (digunakan saat blur)
  const formatSerialNumber = (raw) => {
    const s = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!s) return '';
    const parts = [];
    parts.push(s.slice(0, 5));
    if (s.length > 5) parts.push(s.slice(5, 9));
    if (s.length > 9) parts.push(s.slice(9, 15));
    if (s.length > 15) parts.push(s.slice(15, 19));
    return parts.filter(Boolean).join('-');
  };

  const handleSerialNumberChange = (e) => {
    // Jangan paksa prefix atau dash saat user mengetik agar mudah menghapus
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setSerialNumber(value);
    if (error) setError('');
  };

  const handleClearSerial = () => {
    setSerialNumber('');
    setError('');
    setSuccess('');
  };

  const validateSerialNumber = (sn) => {
    const pattern = /^DMPOS-\d{4}-[A-Z0-9]{6}-[A-Z0-9]{4}$/;
    return pattern.test(sn);
  };

  const handleActivation = async () => {
    try {
      setActivating(true);
      setError('');
      setSuccess('');
      setInstallationInfo(null);
      
      // Validasi format dulu
      if (!validateSerialNumber(serialNumber)) {
        setError('Format Serial Number tidak valid. Pastikan formatnya: DMPOS-YYYY-XXXXXX-XXXX');
        return;
      }
      
      // Kirim request aktivasi
      const response = await fetch('http://localhost:5000/api/activation/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serialNumber: serialNumber,
          computerInfo: {
            name: navigator.platform,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            hostname: window.location.hostname
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message);
        
        // Notify parent component
        if (onActivated) {
          onActivated({
            serialNumber: result.data.serialNumber,
            type: result.data.type,
            temporary: result.data.temporary
          });
        }
        
        // Auto close after 3 seconds
        setTimeout(() => {
          onClose && onClose();
        }, 3000);
        
      } else {
        // Handle error cases
        if (result.error === 'MAX_INSTALLATIONS_REACHED') {
          setInstallationInfo(result.installations || []);
          setError('Maksimum instalasi tercapai (3/3). Lihat detail di bawah.');
        } else {
          setError(result.message || 'Aktivasi gagal. Silakan coba lagi.');
        }
      }
    } catch (error) {
      setError('Gagal terhubung ke server aktivasi. Periksa koneksi internet Anda.');
    } finally {
      setActivating(false);
    }
  };

  const getTrialWarningLevel = () => {
    if (!counterData || counterData.remaining === 'unlimited') return null;
    
    const remaining = counterData.remaining;
    if (remaining <= 4) return 'error';
    if (remaining <= 9) return 'warning';
    if (remaining <= 19) return 'info';
    return 'success';
  };

  const getTrialMessage = () => {
    if (!counterData) return null;
    
    if (counterData.remaining === 'unlimited') {
      return 'Transaksi unlimited - Sudah teraktivasi';
    }
    
    const remaining = counterData.remaining;
    if (remaining === 0) {
      return 'Batas trial tercapai! Aktivasi wajib untuk melanjutkan transaksi.';
    }
    
    return `${remaining} transaksi tersisa dari 99 trial. ${
      remaining <= 4 ? 'Aktivasi segera diperlukan!' :
      remaining <= 19 ? 'Pertimbangkan untuk aktivasi sekarang.' :
      'Anda masih dapat mencoba fitur-fitur aplikasi.'
    }`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={!required ? onClose : undefined} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          minHeight: '500px',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-default)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-default)',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border-default)',
        py: 2
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <SecurityIcon sx={{ color: 'var(--primary-color)' }} fontSize="large" />
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--text-default)' }}>
              {required ? '🔒 Aktivasi Diperlukan' : '🚀 Aktivasi Lisensi DM POS'}
            </Typography>
          </Box>
          {!required && (
            <IconButton 
              onClick={onClose} 
              size="small"
              sx={{ 
                color: 'var(--text-muted)',
                '&:hover': { 
                  backgroundColor: 'var(--primary-color)', 
                  color: 'white' 
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Transaction Counter Status */}
        {counterData && (
          <Alert 
            severity={getTrialWarningLevel()} 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              backgroundColor: 'var(--card-bg-dark)',
              color: 'var(--text-default)',
              '& .MuiAlert-icon': {
                color: 'var(--primary-color)'
              }
            }}
            icon={counterData.remaining === 'unlimited' ? <CheckCircleIcon /> : <WarningIcon />}
          >
            <AlertTitle sx={{ color: 'var(--text-default)' }}>Status Transaksi</AlertTitle>
            {getTrialMessage()}
            {counterData.remaining !== 'unlimited' && counterData.remaining < 20 && (
              <Box mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={(counterData.remaining / 99) * 100}
                  color={counterData.remaining <= 4 ? 'error' : 'warning'}
                  sx={{ 
                    borderRadius: '4px',
                    height: '6px',
                    backgroundColor: 'var(--border-default)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: '4px'
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'var(--text-muted)' }}>
                  Progress: {99 - counterData.remaining}/99 transaksi terpakai
                </Typography>
              </Box>
            )}
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ 
            mb: 2, 
            borderRadius: '8px',
            backgroundColor: 'rgba(46, 125, 50, 0.15)',
            color: 'var(--text-default)'
          }}>
            <AlertTitle sx={{ color: 'var(--text-default)' }}>✅ Aktivasi Berhasil!</AlertTitle>
            {success}
            <Typography variant="body2" sx={{ mt: 1, color: 'var(--text-muted)' }}>
              Dialog akan tertutup otomatis dalam beberapa detik...
            </Typography>
          </Alert>
        )}
        
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ 
            mb: 2, 
            borderRadius: '8px',
            backgroundColor: 'rgba(211, 47, 47, 0.15)',
            color: 'var(--text-default)'
          }}>
            <AlertTitle sx={{ color: 'var(--text-default)' }}>❌ Aktivasi Gagal</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Hardware Information */}
        <Paper sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: '8px',
          backgroundColor: 'var(--card-bg-dark)', 
          border: '1px solid var(--border-default)',
          boxShadow: 'none'
        }}>
          <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1} sx={{ color: 'var(--text-default)' }}>
            <ComputerIcon fontSize="small" sx={{ color: 'var(--primary-color)' }} />
            Informasi Komputer
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-default)' }}>Hardware ID:</strong> {hardwareId}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-default)' }}>Platform:</strong> {navigator.platform}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)', mt: 1, display: 'block' }}>
            ID ini digunakan untuk mengikat lisensi ke komputer Anda
          </Typography>
        </Paper>
        
        {/* Serial Number Input */}
        <TextField
          fullWidth
          label="Serial Number Lisensi"
          placeholder="DMPOS-2024-XXXXXX-XXXX"
          value={serialNumber}
          onChange={handleSerialNumberChange}
          onBlur={() => setSerialNumber(prev => formatSerialNumber(prev))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !activating && validateSerialNumber(serialNumber)) {
              handleActivation();
            }
            if (e.key === 'Escape' && !required && !activating) {
              onClose && onClose();
            }
          }}
          margin="normal"
          helperText="Format: DMPOS-YYYY-XXXXXX-CRC (auto-format saat blur)"
          error={!!error && !success}
          disabled={activating || !!success}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              color: 'var(--text-default)',
              backgroundColor: 'var(--card-bg-dark)',
              '& fieldset': {
                borderColor: 'var(--border-default)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--primary-color)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--primary-color)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'var(--text-muted)',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: 'var(--primary-color)',
            },
          }}
          FormHelperTextProps={{ sx: { color: 'var(--text-muted)' } }}
          InputProps={{
            style: {
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              letterSpacing: '1px',
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  aria-label="clear serial" 
                  onClick={handleClearSerial} 
                  disabled={activating || !!success} 
                  size="small"
                  sx={{ 
                    color: 'var(--text-muted)',
                    '&:hover': { 
                      backgroundColor: 'var(--primary-color)', 
                      color: 'white' 
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        {/* Installation Info (jika ada error max installations) */}
        {installationInfo && installationInfo.length > 0 && (
          <Paper sx={{ 
            p: 2, 
            mt: 2, 
            borderRadius: '8px',
            backgroundColor: 'var(--card-bg-dark)', 
            border: '1px solid var(--border-default)',
            boxShadow: 'none'
          }}>
            <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1} sx={{ color: '#ff6b6b' }}>
              <WarningIcon fontSize="small" />
              ⚠️ Maksimum Instalasi Tercapai (3/3)
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ color: 'var(--text-default)' }}>
              Serial Number ini sudah digunakan di 3 komputer maksimal:
            </Typography>
            <List dense>
              {installationInfo.map((install, index) => (
                <ListItem key={index} sx={{ 
                  borderBottom: '1px solid var(--border-default)',
                  '&:last-child': { borderBottom: 'none' }
                }}>
                  <ListItemIcon>
                    <Chip 
                      label={`Slot ${install.slot}`} 
                      size="small" 
                      color={install.status === 'active' ? 'success' : 'default'}
                      sx={{ 
                        borderRadius: '6px',
                        fontWeight: 'bold'
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={<span style={{ color: 'var(--text-default)' }}>{install.computer_name || 'Unknown Computer'}</span>}
                    secondary={<span style={{ color: 'var(--text-muted)' }}>{`Last seen: ${new Date(install.last_seen).toLocaleDateString('id-ID')}`}</span>}
                  />
                  {install.status === 'inactive' && (
                    <ListItemSecondaryAction>
                      <Chip 
                        label="Inactive" 
                        size="small" 
                        color="warning" 
                        sx={{ borderRadius: '6px' }}
                      />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
            <Typography variant="body2" sx={{ mt: 1, color: 'var(--text-muted)' }}>
              💡 Hubungi support untuk transfer lisensi atau non-aktifkan instalasi lama yang tidak digunakan.
            </Typography>
          </Paper>
        )}
        
        {/* Licensing Information */}
        <Paper sx={{ 
          p: 2, 
          mt: 2, 
          borderRadius: '8px',
          backgroundColor: 'var(--card-bg-dark)', 
          border: '1px solid var(--border-default)',
          boxShadow: 'none'
        }}>
          <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1} sx={{ color: 'var(--text-default)' }}>
            <InfoIcon fontSize="small" sx={{ color: 'var(--primary-color)' }} />
            Informasi Lisensi
          </Typography>
          <Typography variant="body2" component="div" sx={{ color: 'var(--text-default)' }}>
            • Satu Serial Number dapat diinstall di <strong>3 komputer berbeda</strong><br/>
            • Cocok untuk backup saat komputer rusak atau format ulang<br/>
            • Aktivasi akan menggunakan slot instalasi yang tersedia<br/>
            • Setelah aktivasi, Anda mendapat transaksi <strong>unlimited</strong>
          </Typography>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-default)'
      }}>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Box>
            {!required && !success && (
              <Button 
                onClick={onClose} 
                disabled={activating}
                color="inherit"
                sx={{ 
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  '&:hover': {
                    backgroundColor: 'var(--primary-color)',
                    color: 'white'
                  }
                }}
              >
                Nanti Saja
              </Button>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Hardware ID">
              <IconButton 
                onClick={fetchHardwareId} 
                disabled={activating}
                size="small"
                sx={{ 
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  '&:hover': {
                    backgroundColor: 'var(--primary-color)',
                    color: 'white'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button 
              onClick={handleActivation} 
              variant="contained"
              disabled={!serialNumber || activating || !!success || !validateSerialNumber(serialNumber)}
              startIcon={activating ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
              size="large"
              sx={{ 
                borderRadius: '8px',
                fontWeight: 'bold',
                backgroundColor: 'var(--primary-color)',
                '&:hover': {
                  backgroundColor: 'var(--primary-color-hover)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                },
                '&.Mui-disabled': {
                  backgroundColor: 'var(--border-default)',
                  color: 'var(--text-muted)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {activating ? 'Mengaktivasi...' : success ? 'Teraktivasi ✓' : 'Aktivasi Sekarang'}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ActivationDialog;