import React, { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiGift, FiUser, FiCheckCircle, FiArrowRight, FiLoader, FiSend, FiAward } from 'react-icons/fi';
import { customerAPI, pointsAPI, rewardsAPI } from '../api';
import { useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';

const PointManagementPage = () => {
  const { setSnackbar } = useOutletContext();
  const [activeTab, setActiveTab] = useState('redeem');
  
  // State for all customers
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Redeem Tab
  const [redeemSearchTerm, setRedeemSearchTerm] = useState('');
  const [selectedRedeemCustomer, setSelectedRedeemCustomer] = useState(null);
  const [rewards, setRewards] = useState([]); // Remove dummy data
  
  const [isRedeeming, setIsRedeeming] = useState(false);

  // State for Transfer Tab
  const [transferFromSearch, setTransferFromSearch] = useState('');
  const [transferToSearch, setTransferToSearch] = useState('');
  const [selectedTransferFrom, setSelectedTransferFrom] = useState(null);
  const [selectedTransferTo, setSelectedTransferTo] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch customers and rewards in parallel
        const [customersResponse, rewardsResponse] = await Promise.all([
          customerAPI.getAll(),
          rewardsAPI.getActive(),
        ]);
        setAllCustomers(customersResponse.data);
        setRewards(rewardsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setSnackbar({ open: true, message: 'Gagal mengambil data awal (pelanggan/hadiah).', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setSnackbar]);

  const handleRedeemSearch = (e) => {
    e.preventDefault();
    if (!redeemSearchTerm) {
      setSelectedRedeemCustomer(null);
      return;
    }
    const foundCustomer = allCustomers.find(c => 
      c.name.toLowerCase().includes(redeemSearchTerm.toLowerCase())
    );
    setSelectedRedeemCustomer(foundCustomer || { notFound: true });
  };

  const handleRedeem = (reward) => {
    if (!selectedRedeemCustomer || selectedRedeemCustomer.loyalty_points < reward.points_cost || isRedeeming) {
      return;
    }

    Swal.fire({
      title: 'Konfirmasi Penukaran',
      html: `Anda yakin ingin menukar <b>${reward.points_cost.toLocaleString('id-ID')}</b> poin dengan <b>${reward.name}</b> untuk pelanggan <b>${selectedRedeemCustomer.name}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tukar!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      background: 'var(--bg-default)',
      color: 'var(--text-default)'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsRedeeming(true);
        try {
          const response = await pointsAPI.redeem({
            customerId: selectedRedeemCustomer.id,
            rewardName: reward.name,
            rewardCost: reward.points_cost,
          });

          const { new_balance } = response.data.data;

          // Update customer in the main list
          setAllCustomers(prev => prev.map(c => c.id === selectedRedeemCustomer.id ? { ...c, loyalty_points: new_balance } : c));
          
          // Update selected customer view
          setSelectedRedeemCustomer(prev => ({ ...prev, loyalty_points: new_balance }));
          
          Swal.fire({
            title: 'Berhasil!',
            html: `<b>${selectedRedeemCustomer.name}</b> berhasil menukar <b>${reward.name}</b>.`,
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Luar Biasa!',
            background: 'var(--bg-default)',
            color: 'var(--text-default)'
          });

        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menukar poin.';
          Swal.fire({
            title: 'Gagal!',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Tutup',
            background: 'var(--bg-default)',
            color: 'var(--text-default)'
          });
        } finally {
          setIsRedeeming(false);
        }
      }
    });
  };

  const handleTransferSearch = (type, searchTerm) => {
    if (!searchTerm) {
      if (type === 'from') setSelectedTransferFrom(null);
      else setSelectedTransferTo(null);
      return;
    }
    const foundCustomer = allCustomers.find(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const result = foundCustomer || { notFound: true };

    if (type === 'from') {
      setSelectedTransferFrom(result);
    } else {
      setSelectedTransferTo(result);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferError('');
    const amount = parseInt(transferAmount, 10);

    if (isTransferDisabled || isTransferring) return;

    setIsTransferring(true);
    try {
      const response = await pointsAPI.transfer({
        fromCustomerId: selectedTransferFrom.id,
        toCustomerId: selectedTransferTo.id,
        amount: amount,
      });

      const { from, to } = response.data.data;

      // Update state in the main list
      setAllCustomers(prev => prev.map(c => {
        if (c.id === from.id) return { ...c, loyalty_points: from.new_balance };
        if (c.id === to.id) return { ...c, loyalty_points: to.new_balance };
        return c;
      }));

      // Update selected customer views
      setSelectedTransferFrom(prev => ({ ...prev, loyalty_points: from.new_balance }));
      setSelectedTransferTo(prev => ({ ...prev, loyalty_points: to.new_balance }));
      
      Swal.fire({
        title: 'Berhasil!',
        html: `Berhasil mentransfer <b>${amount.toLocaleString('id-ID')}</b> poin dari <b>${selectedTransferFrom.name}</b> ke <b>${selectedTransferTo.name}</b>.`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Luar Biasa!',
        background: 'var(--bg-default)',
        color: 'var(--text-default)'
      });

      setTransferAmount('');
      setTransferError('');

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mentransfer poin.';
      setTransferError(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  const isTransferDisabled = useMemo(() => {
    const amount = parseInt(transferAmount, 10);
    return (
      !selectedTransferFrom || selectedTransferFrom.notFound ||
      !selectedTransferTo || selectedTransferTo.notFound ||
      selectedTransferFrom.id === selectedTransferTo.id ||
      !transferAmount || isNaN(amount) || amount <= 0 ||
      selectedTransferFrom.loyalty_points < amount
    );
  }, [selectedTransferFrom, selectedTransferTo, transferAmount]);

  const renderRedeemTab = () => (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 mb-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-xl mr-4">
            <FiGift className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Tukar Poin Pelanggan</h2>
            <p className="text-blue-100">Tukarkan poin pelanggan dengan hadiah menarik</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleRedeemSearch} className="mb-6 bg-white dark:bg-[var(--bg-secondary)] rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-[var(--border-default)]"> 
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--text-default)]" />
            <input 
              type="text"
              value={redeemSearchTerm}
              onChange={(e) => setRedeemSearchTerm(e.target.value)}
              placeholder="Cari nama pelanggan..."
              className="w-full pl-10 p-3 border rounded-xl bg-gray-50 dark:bg-[var(--bg-secondary)]focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-200 dark:bg-[var(--bg-secondary)] dark:text-[var(--text-default)] dark:border-[var(--border-default)]"
            />
          </div>
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 shadow-md transition-all duration-300 transform hover:scale-102">
            <FiSearch className="h-5 w-5" />
            <span>Cari Pelanggan</span>
          </button>
        </div>
      </form>

      {selectedRedeemCustomer && (
        <div>
          {!selectedRedeemCustomer.notFound ? (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-xl shadow-lg mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{selectedRedeemCustomer.name}</h3>
                  <p className="text-green-100">Poin Saat Ini: {selectedRedeemCustomer.loyalty_points.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <FiAward className="h-6 w-6" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-xl shadow mb-6">
              <div className="flex items-center">
                <FiUser className="mr-2 h-5 w-5" />
                <span>Pelanggan tidak ditemukan.</span>
              </div>
            </div>
          )}

          {!selectedRedeemCustomer.notFound && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-white">Katalog Hadiah</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map(reward => {
                  const canRedeem = selectedRedeemCustomer.loyalty_points >= reward.points_cost;
                  return (
                    <div key={reward.id} className={`bg-white dark:bg-[var(--bg-secondary)] rounded-xl shadow-lg p-5 flex flex-col border-2 border-gray-200 dark:border-[var(--border-default)] transition-all duration-300 transform hover:scale-102 ${!canRedeem ? 'opacity-70' : ''}`}>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                            <FiGift className="text-white h-5 w-5" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${canRedeem ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-white' : 'bg-gray-100 text-gray-800 dark:bg-[var(--bg-secondary)] dark:text-gray-300'}`}>
                            {reward.points_cost.toLocaleString('id-ID')} Poin
                          </span>
                        </div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{reward.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-[var(--text-default)] mb-4">{reward.description}</p>
                      </div>
                      <div className="mt-auto">
                        <button 
                          onClick={() => handleRedeem(reward)}
                          disabled={!canRedeem || isRedeeming}
                          className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                            canRedeem 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md' 
                              : 'bg-gray-200 text-gray-500 dark:bg-[var(--bg-secondary)] dark:text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isRedeeming && <FiLoader className="animate-spin mr-2" />}
                          {canRedeem ? 'Tukar Sekarang' : 'Poin Tidak Cukup'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTransferTab = () => (
    <div>
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl p-4 mb-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="bg-white/20 p-3 rounded-xl mr-4">
            <FiSend className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Transfer Poin Pelanggan</h2>
            <p className="text-purple-100">Transfer poin antar pelanggan dengan mudah</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleTransfer} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* From Customer */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-5 rounded-xl shadow-lg border-2 border-gray-200 dark:border-[var(--border-default)]">
            <label className="block text-sm font-bold text-gray-700 dark:text-white mb-3">Dari Pelanggan</label>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-grow">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)]" />
                <input 
                  type="text"
                  value={transferFromSearch}
                  onChange={(e) => setTransferFromSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTransferSearch('from', transferFromSearch); } }}
                  placeholder="Cari pengirim..."
                  className="w-full pl-10 p-3 border rounded-xl bg-gray-50 border-gray-200 dark:bg-[var(--bg-secondary)] dark:text-white dark:border-[var(--border-default)]"
                />
              </div>
              <button 
                type="button" 
                onClick={() => handleTransferSearch('from', transferFromSearch)} 
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-md"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </div>
            {selectedTransferFrom && (
              <div className={`p-4 rounded-xl ${!selectedTransferFrom.notFound ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30' : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30'}`}>
                {!selectedTransferFrom.notFound ? (
                  <div>
                    <p className="font-semibold dark:text-white">{selectedTransferFrom.name}</p>
                    <p className="text-sm text-green-500 font-medium">Poin: {selectedTransferFrom.loyalty_points.toLocaleString('id-ID')}</p>
                  </div>
                ) : <p className="text-sm text-red-500">Tidak ditemukan</p>}
              </div>
            )}
          </div>

          {/* To Customer */}
          <div className="bg-white dark:bg-[var(--bg-secondary)] p-5 rounded-xl shadow-lg border-2 border-gray-200 dark:border-[var(--border-default)]">
            <label className="block text-sm font-bold text-gray-700 dark:text-white mb-3">Ke Pelanggan</label>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-grow">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white" />
                <input 
                  type="text"
                  value={transferToSearch}
                  onChange={(e) => setTransferToSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTransferSearch('to', transferToSearch); } }}
                  placeholder="Cari penerima..."
                  className="w-full pl-10 p-3 border rounded-xl bg-gray-50 border-gray-200 dark:bg-[var(--bg-secondary)] dark:text-white dark:border-[var(--border-default)]"
                />
              </div>
              <button 
                type="button" 
                onClick={() => handleTransferSearch('to', transferToSearch)} 
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-xl hover:from-gray-600 hover:to-gray-700 shadow-md"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </div>
            {selectedTransferTo && (
              <div className={`p-4 rounded-xl ${!selectedTransferTo.notFound ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30' : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30'}`}>
                {!selectedTransferTo.notFound ? (
                  <div>
                    <p className="font-semibold dark:text-white">{selectedTransferTo.name}</p>
                    <p className="text-sm text-green-500 font-medium">Poin: {selectedTransferTo.loyalty_points?.toLocaleString('id-ID') || '0'}</p>
                  </div>
                ) : <p className="text-sm text-red-500">Tidak ditemukan</p>}
              </div>
            )}
          </div>
        </div>

        {/* Amount & Action */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] p-5 rounded-xl shadow-lg border-2 border-gray-200 dark:border-[var(--border-default)]">
          <label className="block text-sm font-bold text-gray-700 dark:text-white mb-3">Jumlah Poin</label>
          <div className="relative">
            <input 
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0"
              className="w-full p-3 border rounded-xl bg-gray-50 border-gray-200 dark:bg-[var(--bg-secondary)] dark:text-white dark:border-[var(--border-default)]"
            />
          </div>
          {transferError && <p className="text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{transferError}</p>}
          <button 
            type="submit"
            disabled={isTransferDisabled || isTransferring}
            className={`w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-102 ${
              isTransferDisabled || isTransferring
                ? 'bg-gray-300 text-gray-500 dark:bg-[var(--bg-secondary)] dark:text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-md'
            }`}
          >
            {isTransferring && <FiLoader className="animate-spin mr-2" />}
            <FiArrowRight className="h-5 w-5" />
            <span>Transfer Poin Sekarang</span>
          </button>
        </div>
      </form>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin text-5xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-[var(--bg-secondary)] min-h-50vh rounded-xl shadow-md">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-[var(--text-default)] mb-2">Manajemen Poin</h1>
        <p className="text-gray-600 dark:text-[var(--text-muted)] mb-6">Manajemen penukaran dan transfer poin pelanggan</p>
        
        {/* Tabs */}
        <div className="mb-8 bg-white dark:bg-[var(--bg-secondary)] rounded-xl p-1 shadow-md border-2 border-gray-200 dark:border-[var(--border-default)] inline-flex">
          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'redeem' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-[var(--text-muted)] hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FiGift className="h-4 w-4" />
              <span>Tukar Poin</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'transfer' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-[var(--text-muted)] hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <FiSend className="h-4 w-4" />
              <span>Transfer Poin</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'redeem' && renderRedeemTab()}
          {activeTab === 'transfer' && renderTransferTab()}
        </div>
      </div>

      
    </div>
  );
};

export default PointManagementPage;