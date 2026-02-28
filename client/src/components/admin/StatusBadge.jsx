// components/admin/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
    suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' },
    expired: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Expired' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;