// components/admin/ActionButtons.jsx
import React from 'react';
import { FaEye, FaEdit, FaBan, FaCheck, FaTrash } from 'react-icons/fa';

const ActionButtons = ({ onView, onEdit, onStatusChange, onDelete }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onView}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="View details"
      >
        <FaEye size={16} />
      </button>
      <button
        onClick={onEdit}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
        title="Edit"
      >
        <FaEdit size={16} />
      </button>
      <button
        onClick={onStatusChange}
        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
        title="Toggle status"
      >
        <FaBan size={16} />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Delete"
      >
        <FaTrash size={16} />
      </button>
    </div>
  );
};

export default ActionButtons;