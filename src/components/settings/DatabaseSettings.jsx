// src/components/settings/DatabaseSettings.jsx
import { useState, useEffect } from 'react';
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { Wifi, WifiOff, Save, Database, Server } from 'lucide-react';

// Helper function to get API base URL
const getApiUrl = () => {
  // Check if running in Electron environment
  if (window.electron || window.location.protocol === 'file:' || window.location.hostname === '') {
    return 'http://localhost:5000';
  }
  // For web development environment
  return window.location.origin.replace(':5173', ':5000');
};

const DatabaseSettings = () => {
  const [formState, setFormState] = useState({
    dbType: 'mysql',
    dbHost: '',
    dbPort: 3306,
    dbUsername: '',
    dbPassword: '',
    dbName: '',
  });
  const [feedback, setFeedback] = useState({ message: '', type: 'info' });
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDbInfo, setCurrentDbInfo] = useState({ name: '...', host: '...' });
  const [connectionStatus, setConnectionStatus] = useState(() => {
    // Cek localStorage untuk status koneksi terakhir
    const savedStatus = localStorage.getItem('db_connection_status');
    return savedStatus || 'unknown';
  }); // 'unknown', 'connected', 'disconnected'

  // Helper function untuk update connection status dengan persistence
  const updateConnectionStatus = (status) => {
    setConnectionStatus(status);
    localStorage.setItem('db_connection_status', status);
  };

  useEffect(() => {
    const fetchDbSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiUrl()}/api/database/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal memuat pengaturan dari server.');
        
        const data = await response.json();
        setFormState(prevState => ({
          ...prevState,
          ...data,
          dbPassword: '', // Jangan isi password
        }));
        setCurrentDbInfo({ name: data.dbName, host: data.dbHost });
        
        // Hanya set status sebagai unknown, tidak test koneksi otomatis
        // karena password tidak tersimpan di frontend untuk keamanan
        updateConnectionStatus('unknown');
      } catch (error) {
        setFeedback({ message: `Error: ${error.message}`, type: 'error' });
        updateConnectionStatus('disconnected');
      }
    };
    fetchDbSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleTestConnection = async () => {
    // Validasi form sebelum test koneksi
    if (!formState.dbHost || !formState.dbUsername || !formState.dbName) {
      setFeedback({ message: 'Harap lengkapi Host, Username, dan Nama Database', type: 'error' });
      return;
    }
    
    if (!formState.dbPassword) {
      setFeedback({ message: 'Password diperlukan untuk test koneksi', type: 'error' });
      return;
    }

    setIsTesting(true);
    setFeedback({ message: 'Menghubungkan ke database...', type: 'info' });
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/database/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          dbHost: formState.dbHost,
          dbPort: formState.dbPort,
          dbUsername: formState.dbUsername,
          dbPassword: formState.dbPassword,
          dbName: formState.dbName,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || `Server error: ${response.status}`);
      
      setFeedback({ message: 'Database berhasil terhubung!', type: 'success' });
      updateConnectionStatus('connected');
    } catch (error) {
      setFeedback({ message: `Koneksi Gagal: ${error.message}`, type: 'error' });
      updateConnectionStatus('disconnected');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setFeedback({ message: 'Menyimpan konfigurasi...', type: 'info' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/api/database/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          dbHost: formState.dbHost,
          dbPort: formState.dbPort,
          dbUsername: formState.dbUsername,
          dbPassword: formState.dbPassword,
          dbName: formState.dbName,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Gagal menyimpan');
      
      setFeedback({ message: 'Konfigurasi berhasil disimpan! Restart aplikasi agar perubahan diterapkan.', type: 'success' });
      setCurrentDbInfo({ name: formState.dbName, host: formState.dbHost });
      
      // Set status berdasarkan apakah test koneksi pernah berhasil
      // Jika sebelumnya connected, asumsikan masih connected dengan config baru
      if (connectionStatus === 'connected') {
        updateConnectionStatus('connected');
      } else {
        updateConnectionStatus('unknown'); // Perlu test manual untuk memastikan
      }
      
      // Reset password field setelah save untuk security
      setFormState(prev => ({ ...prev, dbPassword: '' }));
    } catch (error) {
      setFeedback({ message: `Gagal Menyimpan: ${error.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isSaving || isTesting;

  const commonTextFieldStyles = {
    '& .MuiInputBase-root': {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-default)',
      borderRadius: '8px',
    },
    '& .MuiInputLabel-root': {
      color: 'var(--text-muted)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--border-default)',
      borderRadius: '8px',
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--primary-color)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--primary-color-hover)',
    },
  };

  const statusColors = {
    connected: '#4caf50',
    disconnected: '#f44336',
    unknown: '#ff9800'
  };

  const statusLabels = {
    connected: 'Online',
    disconnected: 'Offline',
    unknown: 'Unknown'
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Card untuk informasi database aktif */}
      <Card variant="outlined" sx={{
        backgroundColor: 'var(--card-bg-dark, #f8f9fa)',
        color: 'var(--text-default, #6F2DA8)',
        borderColor: 'var(--border-default)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <CardHeader
          title="Database Aktif"
          avatar={<Database size={24} />}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: statusColors[connectionStatus],
                  boxShadow: `0 0 8px ${statusColors[connectionStatus]}`
                }}
              />
              <Typography variant="body2" sx={{ 
                color: statusColors[connectionStatus],
                fontWeight: 'medium'
              }}>
                {statusLabels[connectionStatus]}
              </Typography>
            </Box>
          }
          sx={{ 
            color: 'var(--text-default)',
            borderBottom: '1px solid var(--border-default)',
            py: 2
          }}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Server size={16} />
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Host:
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {currentDbInfo.host}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Database size={16} />
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Nama Database:
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {currentDbInfo.name}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Card untuk pengaturan database */}
      <Card variant="outlined" sx={{
        backgroundColor: 'var(--card-bg-dark, #fff)',
        color: 'var(--text-default, #000)',
        borderColor: 'var(--border-default)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <CardHeader
          title="Pengaturan Database MySQL"
          sx={{ 
            color: 'var(--text-default)',
            borderBottom: '1px solid var(--border-default)',
            py: 2
          }}
        />
        <CardContent>
          <Box noValidate autoComplete="off">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  label="Host" 
                  name="dbHost" 
                  value={formState.dbHost} 
                  onChange={handleChange} 
                  disabled={isLoading} 
                  fullWidth 
                  sx={commonTextFieldStyles} 
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  label="Port" 
                  name="dbPort" 
                  type="number" 
                  value={formState.dbPort} 
                  onChange={handleChange} 
                  disabled={isLoading} 
                  fullWidth 
                  sx={commonTextFieldStyles} 
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  label="Nama Database" 
                  name="dbName" 
                  value={formState.dbName} 
                  onChange={handleChange} 
                  disabled={isLoading} 
                  fullWidth 
                  sx={commonTextFieldStyles} 
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  label="Username" 
                  name="dbUsername" 
                  value={formState.dbUsername} 
                  onChange={handleChange} 
                  disabled={isLoading} 
                  fullWidth 
                  sx={commonTextFieldStyles} 
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  label="Password" 
                  name="dbPassword" 
                  type="password" 
                  value={formState.dbPassword} 
                  onChange={handleChange} 
                  placeholder="Kosongkan jika tidak ada perubahan" 
                  disabled={isLoading} 
                  fullWidth 
                  sx={commonTextFieldStyles} 
                />
              </Grid>
            </Grid>
            
            {feedback.message && (
              <Alert 
                severity={feedback.type} 
                sx={{ 
                  mt: 2, 
                  backgroundColor: feedback.type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 
                                  feedback.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'var(--bg-secondary)',
                  color: 'var(--text-default)',
                  border: feedback.type === 'error' ? '1px solid rgba(244, 67, 54, 0.3)' : 
                          feedback.type === 'success' ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid var(--border-default)',
                  borderRadius: '8px'
                }}
              >
                {feedback.message}
              </Alert>
            )}
          </Box>
        </CardContent>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: '1px solid var(--border-default)' }}>
          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={isLoading}
            startIcon={isTesting ? <CircularProgress size={20} color="inherit" /> : 
                      connectionStatus === 'connected' ? <Wifi /> : <WifiOff />}
            sx={{
              color: connectionStatus === 'connected' ? '#4caf50' : 
                    connectionStatus === 'disconnected' ? '#f44336' : 'var(--primary-color)',
              borderColor: connectionStatus === 'connected' ? '#4caf50' : 
                          connectionStatus === 'disconnected' ? '#f44336' : 'var(--primary-color)',
              '&:hover': {
                borderColor: connectionStatus === 'connected' ? '#388e3c' : 
                            connectionStatus === 'disconnected' ? '#d32f2f' : 'var(--primary-color-hover)',
                backgroundColor: connectionStatus === 'connected' ? 'rgba(76, 175, 80, 0.04)' : 
                                connectionStatus === 'disconnected' ? 'rgba(244, 67, 54, 0.04)' : 'var(--primary-color-hover)',
                color: connectionStatus === 'connected' ? '#388e3c' : 
                      connectionStatus === 'disconnected' ? '#d32f2f' : 'var(--bg-default)'
              }
            }}
          >
            Test Koneksi
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            disabled={isLoading}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            sx={{
              backgroundColor: 'var(--primary-color)',
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                backgroundColor: 'var(--primary-color-hover)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            Simpan Perubahan
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default DatabaseSettings;