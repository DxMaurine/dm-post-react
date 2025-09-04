import {
  FiHome, FiBookOpen, FiShoppingCart, FiPackage, FiUsers, FiBarChart2,
  FiSettings, FiLogOut, FiChevronLeft, FiChevronRight, FiTag, FiList,
  FiTrendingUp, FiUserCheck, FiAward, FiTruck, FiRepeat, FiClipboard,
  FiArchive, FiChevronDown, FiTrendingDown, FiPrinter, FiCpu, FiBox,
  FiPieChart, FiGrid, FiServer, FiDatabase, FiFileText, FiTool, FiMonitor
} from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import ThemeDropdown from './ThemeDropdown'; // Import new ThemeDropdown
import { SettingsContext } from '../context/SettingsContext';
import React from 'react';

// Helper function untuk mendapatkan URL gambar yang kompatibel dengan Electron
const getImageUrl = (path) => {
  const backendUrl = 'http://localhost:5000';
  if (!path) return `${backendUrl}/dm.jpg`;
  if (path.startsWith('http')) return path;
  return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
const mainMenuItems = [
  { icon: FiHome, name: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager'] },
  { icon: FiShoppingCart, name: 'POS', path: '/pos', roles: ['admin', 'manager', 'kasir'] }
];
const menuGroups = [
    {
    title: 'Manajemen Store',
    icon: FiDatabase,
    roles: ['admin', 'manager', 'kasir'],
    links: [
      { icon: FiPackage, name: 'Data Barang', path: '/data-barang', roles: ['admin', 'manager'] },
      { icon: FiTruck, name: 'Penerimaan Barang', path: '/penerimaan-barang', roles: ['admin', 'manager'] },
      { icon: FiClipboard, name: 'Stock Opname', path: '/stock-opname', roles: ['admin', 'manager'] },
      { icon: FiList, name: 'Kartu Stok', path: '/kartu-stok', roles: ['admin', 'manager'] },
      { icon: FiPrinter, name: 'Manajemen Barcode', path: '/barcode-management', roles: ['admin', 'manager'] },
      { icon: FiRepeat, name: 'Retur Pembelian', path: '/retur-pembelian', roles: ['admin', 'manager'] },
      { icon: FiArchive, name: 'Retur Penjualan', path: '/sales-return', roles: ['admin', 'manager', 'kasir'] },
    ]
  },
  {
    title: 'Laporan',
    icon: FiFileText,
    roles: ['admin', 'manager', 'kasir'],
    links: [
      { icon: FiBarChart2, name: 'Rekap Penjualan', path: '/rekap', roles: ['admin', 'manager', 'kasir'] },
      { icon: FiTrendingUp, name: 'Laporan Laba/Rugi', path: '/laporan-laba-rugi', roles: ['admin'] },
      { icon: FiUserCheck, name: 'Laporan per Kasir', path: '/laporan-per-kasir', roles: ['admin'] },
      { icon: FiAward, name: 'Produk Terlaris', path: '/laporan-produk-terlaris', roles: ['admin'] },
      { icon: FiList, name: 'Riwayat Transaksi', path: '/history', roles: ['admin', 'manager', 'kasir'] },
      { icon: FiPrinter, name: 'Cetak Laporan', path: '/print-reports', roles: ['admin', 'manager'] },
    ]
  },
  {
    title: 'Pengelolaan',
    icon: FiTool,
    roles: ['admin', 'manager', 'kasir'],
    links: [
      { icon: FiUsers, name: 'Pelanggan', path: '/customers', roles: ['admin', 'manager', 'kasir'] },
      { icon: FiTruck, name: 'Supplier', path: '/suppliers', roles: ['admin', 'manager'] },
      { icon: FiUsers, name: 'Manajemen Pengguna', path: '/manajemen-pengguna', roles: ['admin'] },
      { icon: FiTag, name: 'Manajemen Diskon', path: '/discounts', roles: ['admin', 'manager'] },
      { icon: FiRepeat, name: 'Manajemen Shift', path: '/shift', roles: ['admin', 'manager', 'kasir'] },
      { icon: FiTrendingDown, name: 'Beban Operasional', path: '/beban-operasional', roles: ['admin', 'manager', 'kasir'] },
    ]
  },
  {
    title: 'Sistem',
    icon: FiMonitor,
    roles: ['admin', 'manager'],
    links: [
      { icon: FiSettings, name: 'Pengaturan', path: '/pengaturan', roles: ['admin', 'manager'] },
    ]
  }
];

const AccordionGroup = ({ group, isCollapsed, location, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => setIsOpen(!isOpen);
  const isGroupActive = group.links.some(link => location.pathname === link.path);
  const filteredLinks = group.links.filter(link => link.roles.includes(userRole));

  if (filteredLinks.length === 0) return null;

  return (
    <li className="mb-1">
      <button 
        onClick={handleToggle} 
        className={`w-full flex justify-between items-center text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-lg transition-all ${isGroupActive 
            ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500/50'}`}
      >
        <div className="flex items-center">
          {group.icon && <group.icon className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
            isOpen 
              ? (isGroupActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300')
              : 'text-yellow-600 dark:text-yellow-400'
          } ${!isCollapsed ? 'mr-2' : ''}`} />}
          {!isCollapsed && <span>{group.title}</span>}
        </div>
        {!isCollapsed && (
          <FiChevronDown className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        )}
      </button>
      {(isOpen || isCollapsed) && (
        <ul className="mt-1">
          {filteredLinks.map(link => (
            <li key={link.name} className="ml-2">
              <NavLink
                to={link.path}
                className={`flex items-center py-2.5 px-4 my-1 rounded-lg transition-all ${location.pathname === link.path 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500/50'} ${isCollapsed ? 'justify-center' : ''}`}
              >
                <link.icon className={`h-5 w-5 flex-shrink-0 ${location.pathname === link.path ? 'text-white' : 'text-gray-500 dark:text-gray-400'} ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && (
                  <span className="ml-3 font-medium text-sm truncate">{link.name}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ onOpenCatalog }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const { settings } = useContext(SettingsContext);
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        // Invalid user data in localStorage, remove it
        localStorage.removeItem('user');
      }
    }
  }, []);

  const userRole = user?.role || 'kasir';

  return (
    <div className={`relative z-10 bg-white dark:bg-[var(--sidebar-bg-dark)] border-r border-[var(--border-default)] dark:border-[var(--border-default)] transition-all duration-300 flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center justify-between p-4 border-b border-[var(--border-default)] dark:border-[var(--border-default)] ${isCollapsed ? 'h-[69px]' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img 
                src={getImageUrl(settings?.storeLogo || '/dm.jpg')}
                alt="DM POS Logo"
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-size='40' fill='%236b7280' font-family='sans-serif' text-anchor='middle' dominant-baseline='middle'%3EDM%3C/text%3E%3C/svg%3E" }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-2xl text-[var(--primary-color)] dark:text-[var(--primary-color)] tracking-tight">
                <span className="text-[var(--primary-color-hover)] dark:text-[var(--primary-color-hover)]">DM</span>-POS
              </h1>
              <p className="text-xs font-semibold text-[var(--text-muted)] dark:text-[var(--text-default)]">
                Selamat Datang, {user?.username || 'Guest'}
              </p>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] dark:text-[var(--text-muted)] hover:text-[var(--text-default)] dark:hover:text-[var(--text-default)] transition-colors"
        >
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>
      
      <div className="p-3 border-b border-gray-100 dark:border-gray-700/50">
        <ul>
          {mainMenuItems.filter(item => item.roles.includes(userRole)).map(item => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all ${location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500/50'} ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${location.pathname === item.path ? 'text-white' : 'text-gray-500 dark:text-gray-400'} ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && (
                  <span className="ml-3 font-medium text-sm">{item.name}</span>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={onOpenCatalog}
              className={`w-full flex items-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500/50 transition-all ${isCollapsed ? 'justify-center' : ''}`}
            >
              <FiBookOpen className={`h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && (
                <span className="ml-3 font-medium text-sm">Katalog</span>
              )}
            </button>
          </li>
        </ul>
      </div>
      
      <nav className="flex-grow p-3 overflow-y-auto">
        <ul>
          {menuGroups.filter(group => group.roles.includes(userRole)).map(group => (
            <AccordionGroup 
              key={group.title} 
              group={group} 
              isCollapsed={isCollapsed} 
              location={location} 
              userRole={userRole}
            />
          ))}
        </ul>
      </nav>
    
      <div className="mt-auto">
        <ThemeDropdown isCollapsed={isCollapsed} />
        <div className="p-4 border-t border-[var(--border-default)]">
            <NavLink
              to="/logout"
              className={`flex items-center p-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors group ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : ''}`}>
              <FiLogOut className="h-5 w-5" />
              {!isCollapsed && (
                  <span className="ml-3 font-medium text-sm">Logout</span>
              )}
            </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;