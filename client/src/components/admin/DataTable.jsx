import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DataTable = ({ 
  columns, 
  data, 
  loading, 
  pagination, 
  onPageChange,
  onLimitChange 
}) => {
  const pageOptions = [10, 25, 50, 100];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50 transition">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="py-4 px-6">
                    {typeof col.accessor === 'function' 
                      ? col.accessor(row) 
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {pageOptions.map(opt => (
                <option key={opt} value={opt}>{opt} per page</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft size={14} />
            </button>
            <span className="px-3 py-2 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;