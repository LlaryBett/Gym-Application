import React from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaUser, FaDumbbell, FaMoneyBill, FaCheckCircle, FaTimesCircle, FaBan } from 'react-icons/fa';
import { GiStrongMan } from 'react-icons/gi';

const BookingDetailsModal = ({
  isOpen,
  onClose,
  booking = {}
}) => {
  if (!isOpen || !booking) return null;

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <div className="w-3 h-3 bg-yellow-500 rounded-full" />,
      'confirmed': <FaCheckCircle className="text-green-500" />,
      'completed': <FaCheckCircle className="text-blue-500" />,
      'cancelled': <FaTimesCircle className="text-red-500" />,
      'no-show': <FaBan className="text-gray-500" />
    };
    return icons[status] || <FaClock className="text-gray-400" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'confirmed': 'bg-green-50 border-green-200 text-green-800',
      'completed': 'bg-blue-50 border-blue-200 text-blue-800',
      'cancelled': 'bg-red-50 border-red-200 text-red-800',
      'no-show': 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'paid': 'bg-green-50 border-green-200 text-green-800',
      'unpaid': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'refunded': 'bg-purple-50 border-purple-200 text-purple-800',
      'failed': 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <p className="text-sm text-gray-500 mt-1">#{booking.booking_number}</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div className={`border rounded-lg p-4 ${getStatusColor(booking.status)}`}>
              <p className="text-xs font-semibold uppercase mb-1">Booking Status</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(booking.status)}
                <p className="text-lg font-bold capitalize">{booking.status}</p>
              </div>
            </div>
            <div className={`border rounded-lg p-4 ${getPaymentStatusColor(booking.payment_status)}`}>
              <p className="text-xs font-semibold uppercase mb-1">Payment Status</p>
              <p className="text-lg font-bold capitalize">{booking.payment_status}</p>
            </div>
          </div>

          {/* Member Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Member Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">Name</p>
              <p className="text-gray-900 font-medium mb-3">{booking.member_name}</p>
              <p className="text-sm font-semibold text-gray-600 mb-2">Email</p>
              <p className="text-gray-600">{booking.member_email}</p>
            </div>
          </div>

          {/* Trainer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <GiStrongMan className="text-green-500" />
              Trainer Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">Name</p>
              <p className="text-gray-900 font-medium mb-3">{booking.trainer_name}</p>
              <p className="text-sm font-semibold text-gray-600 mb-2">Specialty</p>
              <p className="text-gray-600">{booking.trainer_specialty || 'N/A'}</p>
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaDumbbell className="text-orange-500" />
              Service Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Service</p>
                <p className="text-gray-900 font-medium">{booking.service_name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Session Type</p>
                <p className="text-gray-900 font-medium capitalize">{booking.session_type}</p>
              </div>
            </div>
          </div>

          {/* Booking Date & Time */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-purple-500" />
              Booking Date & Time
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Date</p>
                <p className="text-gray-900 font-medium">{formatDate(booking.booking_date)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Time & Duration</p>
                <p className="text-gray-900 font-medium">
                  {booking.booking_time} ({booking.duration_minutes} min)
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaMoneyBill className="text-green-500" />
              Payment Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Amount</p>
                <p className="text-2xl font-bold text-gray-900">KSH {booking.amount?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Payment Method</p>
                <p className="text-gray-900 font-medium capitalize">{booking.payment_method || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Booking Created</span>
                <span className="text-gray-900 font-semibold">{formatDate(booking.created_at)}</span>
              </div>
              {booking.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Notes</span>
                  <span className="text-gray-900">{booking.notes}</span>
                </div>
              )}
            </div>
          </div>
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

export default BookingDetailsModal;
