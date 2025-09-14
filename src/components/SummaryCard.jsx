
// Enhanced Summary Card Component
import React from 'react';

const SummaryCard = ({ title, value, subtitle, icon, color, trend, percentage }) => {
  const colorMap = {
    blue: { iconBg: 'bg-blue-100 dark:bg-blue-900', iconColor: 'text-blue-600 dark:text-[var(--warning-color)]'},
    green: { iconBg: 'bg-green-100 dark:bg-green-900', iconColor: 'text-green-600 dark:text-green-300' },
    orange: { iconBg: 'bg-orange-100 dark:bg-orange-900', iconColor: 'text-orange-600 dark:text-orange-300' },
    red: { iconBg: 'bg-red-100 dark:bg-red-900', iconColor: 'text-red-600 dark:text-red-300' },
    purple: { iconBg: 'bg-purple-100 dark:bg-purple-900', iconColor: 'text-purple-600 dark:text-purple-300' },
  };

  const iconMap = {
    currency: (
      <span className="font-bold text-xl">Rp</span>
    ),
    star: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.324 1.118l1.519 4.674c.3.921-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.539-1.118l1.519-4.674a1 1 0 00-.324-1.118L2.285 9.097c-.783-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
      </svg>
    ),
    return: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m15 3v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v4" />
      </svg>
    )
  };

  const renderValue = () => {
    if (typeof value === 'string' && value.startsWith('Rp')) {
      const currencySymbol = value.substring(0, 2);
      const amount = value.substring(2);
      return (
        <>
          <span className={`${colorMap[color].iconColor} mr-1`}>{currencySymbol}</span>
          <span className="text-gray-900 dark:text-[var(--text-default)]">{amount}</span>
        </>
      );
    }
    return <span className="text-gray-900 dark:text-[var(--text-default)]">{value}</span>;
  };

  return (
    <div className={`p-5 rounded-xl shadow-sm  bg-white dark:bg-[var(--bg-secondary)] hover:shadow-md transition`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-muted)] mb-1">{title}</p>
          <p className="text-2xl font-bold mb-1">
            {renderValue()}
          </p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{subtitle}</p>}
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorMap[color].iconBg} ${colorMap[color].iconColor}`}>
          {iconMap[icon]}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-600' : 'text-red-600 dark:text-red-600'}`}>
            {percentage} {trend === 'up' ? '↑' : '↓'} Dari hari sebelumnya
          </span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;