import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { userAPI } from '../api'; // Pastikan path sesuai struktur project
import { getCurrentUser } from '../utils'; // Import fungsi untuk mendapatkan user saat ini
import React from 'react';

const ManajemenPengguna = () => {
  const { setSnackbar } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    role: 'kasir' 
  });

  // Mendapatkan data user yang sedang login
  const currentLoggedUser = getCurrentUser();
  const isAdmin = currentLoggedUser?.role === 'admin';

  // Token sudah tidak perlu diambil manual

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (user = null) => {
    // Validasi: hanya admin yang boleh menambah pengguna baru
    if (!user && !isAdmin) {
      setSnackbar({ 
        open: true, 
        message: 'Hanya admin yang dapat menambahkan pengguna baru!', 
        severity: 'error' 
      });
      return;
    }
    
    setCurrentUser(user);
    setFormData(user ? { 
      username: user.username, 
      role: user.role, 
      password: '' 
    } : { 
      username: '', 
      password: '', 
      role: 'kasir' 
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        await userAPI.update(currentUser.id, { 
          username: formData.username, 
          role: formData.role 
        });
        setSnackbar({ 
          open: true, 
          message: 'Pengguna berhasil diperbarui!', 
          severity: 'success' 
        });
      } else {
        await userAPI.create(formData);
        setSnackbar({ 
          open: true, 
          message: 'Pengguna berhasil dibuat!', 
          severity: 'success' 
        });
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (userId) => {
    // Validasi: hanya admin yang boleh menghapus pengguna
    if (!isAdmin) {
      setSnackbar({ 
        open: true, 
        message: 'Hanya admin yang dapat menghapus pengguna!', 
        severity: 'error' 
      });
      return;
    }
    
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await userAPI.delete(userId);
        setSnackbar({ 
          open: true, 
          message: 'Pengguna berhasil dihapus!', 
          severity: 'success' 
        });
        fetchUsers();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: 'error' 
        });
      }
    }
  };


  // Fungsi untuk mendapatkan warna berdasarkan role
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300';
      case 'manager':
        return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300';
      case 'kasir':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-6">
      <div className="w-full max-w-6xl bg-white dark:bg-[var(--bg-default)] rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)]">Manajemen Pengguna</h2>
            <p className="text-gray-500 dark:text-[var(--text-muted)]">Kelola data pengguna sistem</p>
            {/* Tampilkan status akses untuk user */}
            <div className="mt-2">
              {isAdmin ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Akses Admin - Dapat mengelola pengguna
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Akses Terbatas - Hanya dapat melihat data
                </span>
              )}
            </div>
          </div>
        {/* Tampilkan tombol hanya jika user adalah admin */}
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Pengguna
          </button>
        )}
      </div>

      {/* Tabel Pengguna */}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 dark:border-[var(--border-default)] bg-white dark:bg-[var(--bg-secondary)]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--border-default)]">
          <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-xl">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal Dibuat</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tr-xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[var(--bg-secondary)] divide-y divide-gray-200 dark:divide-[var(--border-default)]">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white dark:bg-[var(--bg-secondary)]'   : 'bg-gray-50 dark:bg-[var(--bg-default)]'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-default)]">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap ">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[var(--text-muted)]">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleOpenModal(user)} 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="text-red-600 dark:text-red-400 hover:text-red-900 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                        title="Hapus"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Ubah Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[var(--bg-default)] rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-[var(--text-default)]">{currentUser ? 'Ubah Pengguna' : 'Tambah Pengguna Baru'}</h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-400 dark:text-gray-300 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]" 
                  required 
                />
              </div>
              {!currentUser && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]" 
                    required 
                  />
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-default)] mb-1">Role</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 dark:border-[var(--border-default)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)]"
                >
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-4 py-2 border border-gray-300 dark:border-[var(--border-default)] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium bg-white dark:bg-[var(--bg-secondary)]"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] rounded-lg text-white font-medium shadow-md transition-all duration-200"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ManajemenPengguna;