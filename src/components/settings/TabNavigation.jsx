// TabNavigation.jsx
import { Receipt, Printer, Database, CreditCard, Barcode, Cloud, PlayCircle, Zap } from 'lucide-react';
import React from 'react';
const TabNavigation = ({ tabs, activeTab, setActiveTab }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'receipt': return <Receipt size={18} />;
      case 'printer': return <Printer size={18} />;
      case 'database': return <Database size={18} />;
      case 'credit-card': return <CreditCard size={18} />;
      case 'barcode': return <Barcode size={18} />;
      case 'cloud': return <Cloud size={18} />;
      case 'play-circle': return <PlayCircle size={18} />;
      case 'zap': return <Zap size={18} />;
      default: return <Receipt size={18} />;
    }
  };

  return (
    <nav className="flex flex-col space-y-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`w-full flex items-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 text-left ${
            activeTab === tab.id 
              ? 'bg-blue-100 dark:bg-[var(--primary-color)]/20 text-blue-700 dark:text-[var(--primary-color)]' 
              : 'text-gray-600 dark:text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
        >
          <span className="mr-3">{getIcon(tab.icon)}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;