import React from 'react';
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaIdCard, FaCalendarAlt, FaUserTag, FaMapMarkerAlt, FaDumbbell, FaCheckCircle, FaBan } from 'react-icons/fa';

const MemberDetailsModal = ({
  isOpen,
  onClose,
  member = {}
}) => {
  if (!isOpen || !member) return null;

  const getStatusBadgeColor = (status) => {
    const colors = {
      'active': 'bg-green-50 border-green-200 text-green-800',
      'inactive': 'bg-gray-50 border-gray-200 text-gray-800',
      'suspended': 'bg-red-50 border-red-200 text-red-800',
      'pending': 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'active': <FaCheckCircle className="text-green-500" />,
      'suspended': <FaBan className="text-red-500" />,
      'inactive': <FaBan className="text-gray-500" />,
      'pending': <FaUser className="text-yellow-500" />
    };
    return icons[status] || <FaUser className="text-gray-500" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysActive = (joinDate) => {
    if (!joinDate) return 0;
    return Math.floor((new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-200 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold text-2xl">
                {member.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {member.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Member ID: {member.membershipNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className={`border rounded-lg p-4 ${getStatusBadgeColor(member.status)}`}>
            <p className="text-xs font-semibold uppercase mb-2">Member Status</p>
            <div className="flex items-center gap-2">
              {member.status === 'active' ? (
                <FaCheckCircle className="text-green-500" size={20} />
              ) : (
                <FaBan className={member.status === 'suspended' ? 'text-red-500' : 'text-gray-500'} size={20} />
              )}
              <p className="text-lg font-bold capitalize">{member.status}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Email</p>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <FaEnvelope className="text-orange-500" size={14} />
                  {member.email || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Phone</p>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <FaPhone className="text-orange-500" size={14} />
                  {member.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Membership Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaIdCard className="text-purple-500" />
              Membership Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Membership #</p>
                <p className="text-gray-900 font-bold text-lg">#{member.membershipNumber}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Type</p>
                <p className="text-gray-900 font-medium capitalize">
                  {member.membershipType || 'Standard'}}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Plan</p>
                <p className="text-gray-900 font-medium">{member.plan_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-semibold uppercase mb-2 flex items-center gap-2">
                <FaCalendarAlt size={12} />
                Joined Date
              </p>
              <p className="text-gray-900 font-medium">{formatDate(member.createdAt)}</p>
              <p className="text-xs text-gray-600 mt-1">{calculateDaysActive(member.createdAt)} days active</p>
            </div>
            {member.end_date && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-600 font-semibold uppercase mb-2 flex items-center gap-2">
                  <FaCalendarAlt size={12} />
                  Valid Until
                </p>
                <p className="text-gray-900 font-medium">{formatDate(member.end_date)}</p>
              </div>
            )}
          </div>

          {/* Address Information */}
          {(member.address || member.city || member.country) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" />
                Address
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                {member.address && (
                  <p className="text-gray-900">
                    <span className="font-semibold text-gray-700 block text-sm">Street</span>
                    {member.address}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {member.city && (
                    <p className="text-gray-900">
                      <span className="font-semibold text-gray-700 block text-sm">City</span>
                      {member.city}
                    </p>
                  )}
                  {member.country && (
                    <p className="text-gray-900">
                      <span className="font-semibold text-gray-700 block text-sm">Country</span>
                      {member.country}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fitness Goals */}
          {member.fitness_goals && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaDumbbell className="text-orange-500" />
                Fitness Goals
              </h3>
              <p className="text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
                {member.fitness_goals}
              </p>
            </div>
          )}

          {/* Additional Information */}
          {(member.emergency_contact || member.date_of_birth) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                {member.date_of_birth && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Date of Birth</span>
                    <span className="text-gray-900">{formatDate(member.date_of_birth)}</span>
                  </div>
                )}
                {member.emergency_contact && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Emergency Contact</span>
                    <span className="text-gray-900">{member.emergency_contact}</span>
                  </div>
                )}
                {member.notes && (
                  <div className="border-t border-gray-200 pt-3">
                    <span className="text-gray-600 font-medium block mb-2">Notes</span>
                    <span className="text-gray-700">{member.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Stats */}
          {(member.total_sessions !== undefined || member.last_visit !== undefined) && (
            <div className="grid grid-cols-2 gap-4">
              {member.total_sessions !== undefined && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-900">{member.total_sessions}</p>
                </div>
              )}
              {member.last_visit && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-semibold uppercase mb-1">Last Visit</p>
                  <p className="text-gray-900 font-medium">{formatDate(member.last_visit)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsModal;
