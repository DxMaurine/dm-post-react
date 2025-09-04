/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Chip,
  Tooltip,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

const LicenseStatusBadge = ({ onActivationClick = null }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  
  useEffect(() => {
    fetchLicenseStatus();
    
    // Refresh setiap 30 detik
    const interval = setInterval(fetchLicenseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLicenseStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/activation/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({ 
        status: 'error', 
        message: 'Status tidak tersedia',
        activated: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActivationClick = () => {
    handleMenuClose();
    if (onActivationClick) {
      onActivationClick();
    }
  };

  const handleRefreshStatus = () => {
    handleMenuClose();
    setLoading(true);
    fetchLicenseStatus();
  };

  const getStatusDisplay = () => {
    if (loading) {
      return { 
        icon: <ScheduleIcon />, 
        text: 'Loading...', 
        color: 'default',
        severity: 'info',
        tooltip: 'Memuat status lisensi...'
      };
    }

    if (!status) {
      return { 
        icon: <ErrorIcon />, 
        text: 'Error', 
        color: 'error',
        severity: 'error',
        tooltip: 'Gagal memuat status lisensi'
      };
    }
    
    switch (status.status) {
      case 'activated':
        return {
          icon: <CheckCircleIcon />,
          text: 'Teraktivasi',
          color: 'success',
          severity: 'success',
          tooltip: `SN: ****${status.serialNumber?.slice(-4) || 'Unknown'} | Transaksi: Unlimited`
        };
      
      case 'trial':{
        const remaining = status.remaining;
        let trialColor = 'warning';
        let trialSeverity = 'warning';
        
        if (remaining <= 4) {
          trialColor = 'error';
          trialSeverity = 'error';
        } else if (remaining <= 19) {
          trialColor = 'warning';
          trialSeverity = 'warning';
        } else {
          trialColor = 'info';
          trialSeverity = 'info';
        }
        
        return {
          icon: <WarningIcon />,
          text: `Trial: ${remaining}`,
          color: trialColor,
          severity: trialSeverity,
          tooltip: `${remaining} transaksi tersisa dari 99 trial. Klik untuk aktivasi.`
        };
      };
      case 'temporary':
        return {
          icon: <ScheduleIcon />,
          text: 'Lisensi Sementara',
          color: 'info',
          severity: 'info',
          tooltip: 'Aktivasi sementara - akan diverifikasi saat online'
        };
      
      default:
        return {
          icon: <ErrorIcon />,
          text: 'Status Tidak Dikenal',
          color: 'default',
          severity: 'warning',
          tooltip: 'Status lisensi tidak dapat ditentukan'
        };
    }
  };
  
  const statusInfo = getStatusDisplay();
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip 
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="body2" fontWeight="bold" sx={{ color: 'var(--text-default)' }}>
              Status Lisensi DM POS
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
              {statusInfo.tooltip}
            </Typography>
            {status && status.status === 'trial' && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'var(--text-muted)' }}>
                Klik untuk aktivasi unlimited
              </Typography>
            )}
          </Box>
        }
        arrow
        componentsProps={{
          tooltip: {
            sx: {
              borderRadius: '8px',
              backgroundColor: 'var(--card-bg-dark)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }
          }
        }}
      >
        <Chip
          icon={statusInfo.icon}
          label={statusInfo.text}
          color={statusInfo.color}
          variant="filled"
          size="small"
          onClick={status?.status === 'trial' ? handleActivationClick : handleMenuClick}
          sx={{ 
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '16px',
            backgroundColor: statusInfo.color === 'default' ? 'var(--border-default)' : undefined,
            color: statusInfo.color === 'default' ? 'var(--text-default)' : undefined,
            '& .MuiChip-icon': {
              fontSize: '1rem'
            },
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease'
            }
          }}
        />
      </Tooltip>

      {/* More options menu */}
      <IconButton 
        size="small" 
        onClick={handleMenuClick}
        sx={{ 
          ml: 0.5,
          color: 'var(--text-muted)',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: 'var(--primary-color)',
            color: 'white'
          }
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            backgroundColor: 'var(--card-bg-dark)',
            color: 'var(--text-default)',
            border: '1px solid var(--border-default)',
            mt: 1,
            minWidth: '250px'
          }
        }}
      >
        <MenuItem onClick={handleRefreshStatus} sx={{ borderRadius: '4px', my: 0.5, mx: 1 }}>
          <InfoIcon fontSize="small" sx={{ mr: 1, color: 'var(--primary-color)' }} />
          <Typography variant="body2" sx={{ color: 'var(--text-default)' }}>Refresh Status</Typography>
        </MenuItem>
        
        {status?.status === 'trial' && (
          <MenuItem onClick={handleActivationClick} sx={{ borderRadius: '4px', my: 0.5, mx: 1 }}>
            <SecurityIcon fontSize="small" sx={{ mr: 1, color: 'var(--primary-color)' }} />
            <Typography variant="body2" sx={{ color: 'var(--text-default)' }}>Aktivasi Lisensi</Typography>
          </MenuItem>
        )}
        
        <Divider sx={{ borderColor: 'var(--border-default)' }} />
        
        <Box sx={{ p: 2, maxWidth: 250 }}>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-default)' }}>Status:</strong> {status?.status || 'Unknown'}<br/>
            <strong style={{ color: 'var(--text-default)' }}>Total Transaksi:</strong> {status?.status === 'activated' ? 'Unlimited' : (status?.totalTransactions || 0)}<br/>
            {status?.activationDate && (
              <>
                <strong style={{ color: 'var(--text-default)' }}>Diaktivasi:</strong> {new Date(status.activationDate).toLocaleDateString('id-ID')}<br/>
              </>
            )}
            {status?.expires && (
              <>
                <strong style={{ color: 'var(--text-default)' }}>Berakhir:</strong> {new Date(status.expires).toLocaleDateString('id-ID')}<br/>
              </>
            )}
          </Typography>
          
          {status?.status === 'trial' && status?.remaining <= 19 && (
            <Alert severity="warning" sx={{ 
              mt: 1, 
              fontSize: '0.75rem', 
              borderRadius: '6px',
              backgroundColor: 'rgba(237, 108, 2, 0.15)',
              color: 'var(--text-default)',
              '& .MuiAlert-icon': {
                color: 'var(--primary-color)'
              }
            }}>
              Aktivasi segera untuk transaksi unlimited!
            </Alert>
          )}
        </Box>
      </Menu>
    </Box>
  );
};

export default LicenseStatusBadge;