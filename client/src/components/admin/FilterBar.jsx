// components/admin/FilterBar.jsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

const FilterBar = ({ filters, setFilters, statusOptions, membershipOptions }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search members..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Membership Type Filter */}
      <select
        value={filters.membershipType}
        onChange={(e) => setFilters({ ...filters, membershipType: e.target.value, page: 1 })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        {membershipOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;