import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaSpinner } from 'react-icons/fa';
import { adminAPI } from '../../services/adminAPI';
import toast from 'react-hot-toast';

const MemberEditModal = ({
  isOpen,
  onClose,
  member = {},
  onMemberUpdated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        status: member.status || 'active'
      });
    }
  }, [member, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await adminAPI.updateMember(member.id, formData);
      
      if (response.success) {
        toast.success('Member updated successfully');
        onMemberUpdated();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update member');
      }
    } catch (error) {
      console.error('Update member error:', error);
      toast.error('Failed to update member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Member</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaCheck />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberEditModal;
