import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus,
  FaFileExport, FaCalendarAlt, FaClock, FaUser,
  FaCheckCircle, FaTimesCircle, FaBan, FaClock as FaPending,
  FaMoneyBill, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaVideo, FaUsers, FaDumbbell
} from 'react-icons/fa';
import { GiStrongMan } from 'react-icons/gi';
import { adminAPI } from '../../services/adminAPI';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    trainerId: '',
    memberId: ''
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [rescheduleData, setRescheduleData] = useState({
    new_date: '',
    new_time: ''
  });
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchTrainers();
    fetchMembers();
  }, [pagination.page, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllBookings({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success) {
        setBookings(response.data.bookings);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await adminAPI.getAllTrainers({ limit: 100 });
      if (response.success) {
        setTrainers(response.data.trainers);
      }
    } catch (error) {
      console.error('Fetch trainers error:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await adminAPI.getAllMembers({ limit: 100 });
      if (response.success) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Fetch members error:', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await adminAPI.updateBookingStatus(id, status);
      
      if (response.success) {
        toast.success(`Booking ${status} successfully`);
        fetchBookings();
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await adminAPI.deleteBooking(selectedBooking.id);
      if (response.success) {
        toast.success('Booking deleted successfully');
        setShowDeleteConfirm(false);
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete booking');
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.new_date || !rescheduleData.new_time) {
      toast.error('Please select new date and time');
      return;
    }

    try {
      const response = await adminAPI.rescheduleBooking(
        selectedBooking.id,
        rescheduleData.new_date,
        rescheduleData.new_time
      );

      if (response.success) {
        toast.success('Booking rescheduled successfully');
        setShowRescheduleModal(false);
        setRescheduleData({ new_date: '', new_time: '' });
        fetchBookings();
      }
    } catch (error) {
      console.error('Reschedule error:', error);
      toast.error('Failed to reschedule booking');
    }
  };

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      const response = await adminAPI.cancelBooking(
        selectedBooking.id,
        cancellationReason
      );

      if (response.success) {
        toast.success('Booking cancelled successfully');
        setShowCancelModal(false);
        setCancellationReason('');
        fetchBookings();
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const response = await adminAPI.exportBookings(format, filters);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Bookings exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export bookings');
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <FaPending className="text-yellow-500" />,
      'confirmed': <FaCheckCircle className="text-green-500" />,
      'completed': <FaCheckCircle className="text-blue-500" />,
      'cancelled': <FaTimesCircle className="text-red-500" />,
      'no-show': <FaBan className="text-gray-500" />
    };
    return icons[status] || <FaClock className="text-gray-400" />;
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800',
      'unpaid': 'bg-yellow-100 text-yellow-800',
      'refunded': 'bg-purple-100 text-purple-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      header: 'Booking ID',
      accessor: (booking) => (
        <div>
          <p className="font-medium text-gray-900">#{booking.booking_number}</p>
          <p className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</p>
        </div>
      )
    },
    {
      header: 'Member',
      accessor: (booking) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 font-semibold">
              {booking.member_first_name?.[0]}{booking.member_last_name?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{booking.member_name}</p>
            <p className="text-xs text-gray-500">{booking.member_email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Trainer',
      accessor: (booking) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <GiStrongMan className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{booking.trainer_name}</p>
            <p className="text-xs text-gray-500">{booking.trainer_specialty}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Service',
      accessor: (booking) => (
        <div>
          <p className="font-medium text-gray-900">{booking.service_name}</p>
          <p className="text-xs text-gray-500">{booking.session_type}</p>
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: (booking) => (
        <div className="space-y-1">
          <p className="text-sm flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" size={12} />
            {new Date(booking.booking_date).toLocaleDateString()}
          </p>
          <p className="text-sm flex items-center gap-2">
            <FaClock className="text-gray-400" size={12} />
            {booking.booking_time} ({booking.duration_minutes} min)
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (booking) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(booking.status)}
            <StatusBadge status={booking.status} />
          </div>
          <span className={`${getPaymentStatusBadge(booking.payment_status)} px-2 py-1 rounded-full text-xs`}>
            {booking.payment_status}
          </span>
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: (booking) => (
        <div>
          <p className="font-semibold text-gray-900">KSH {booking.amount}</p>
          <p className="text-xs text-gray-500">{booking.payment_method || 'Not paid'}</p>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (booking) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedBooking(booking);
              setShowDetailsModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View details"
          >
            <FaEye size={16} />
          </button>
          
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Confirm booking"
              >
                <FaCheckCircle size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowCancelModal(true);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Cancel booking"
              >
                <FaTimesCircle size={16} />
              </button>
            </>
          )}

          {booking.status === 'confirmed' && (
            <button
              onClick={() => {
                setSelectedBooking(booking);
                setShowRescheduleModal(true);
              }}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
              title="Reschedule"
            >
              <FaCalendarAlt size={16} />
            </button>
          )}

          <button
            onClick={() => {
              setSelectedBooking(booking);
              setShowDeleteConfirm(true);
            }}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' }
  ];

  const trainerOptions = [
    { value: '', label: 'All Trainers' },
    ...trainers.map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name}` }))
  ];

  const memberOptions = [
    { value: '', label: 'All Members' },
    ...members.map(m => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600 mt-1">Manage all member bookings and appointments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Today's Bookings</p>
          <p className="text-2xl font-bold text-orange-600">
            {bookings.filter(b => {
              const today = new Date().toDateString();
              return new Date(b.booking_date).toDateString() === today;
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {bookings.filter(b => b.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            KSH {bookings.reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking number or member..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.trainerId}
              onChange={(e) => setFilters({ ...filters, trainerId: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {trainerOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="From date"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="To date"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <FaFileExport />
              {exportLoading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        />
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reschedule Booking</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.new_date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, new_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                <input
                  type="time"
                  value={rescheduleData.new_time}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, new_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReschedule}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Confirm Reschedule
                </button>
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleData({ new_date: '', new_time: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Please provide a reason for cancellation..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                >
                  Cancel Booking
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellationReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Keep Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This action cannot be undone."
        type="danger"
      />

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          booking={selectedBooking}
        />
      )}
    </div>
  );
};

export default Bookings;