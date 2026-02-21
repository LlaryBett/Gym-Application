import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/authHooks';
import { bookingService } from '../services/bookingService';
import { membershipService } from '../services/membershipService'; // ✅ ADDED
import CTA from '../components/CTA';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [allBookings, setAllBookings] = useState([]);
  const [displayBookings, setDisplayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({
    new_date: '',
    new_time: ''
  });
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    review: '',
    would_recommend: true
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // ✅ TRIAL STATE
  const [membership, setMembership] = useState(null);

  // Success message from booking page
  const successMessage = location.state?.message;

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { from: '/dashboard' } 
      });
      return;
    }

    fetchAllBookings();
    fetchMembership(); // ✅ Fetch membership for trial info
  }, [user]);

  useEffect(() => {
    if (allBookings.length > 0) {
      filterBookingsByTab(activeTab);
    }
  }, [activeTab, allBookings]);

  useEffect(() => {
    if (selectedBooking && rescheduleData.new_date) {
      checkAvailabilityForReschedule();
    }
  }, [rescheduleData.new_date, selectedBooking]);

  // ✅ FETCH MEMBERSHIP FOR TRIAL INFO
  const fetchMembership = async () => {
    try {
      const response = await membershipService.getMyMembership();
      if (response.success && response.data) {
        setMembership(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch membership:', err);
    }
  };

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingService.getUserBookings(user.id, 1, 100, {});
      
      if (response.success) {
        setAllBookings(response.data.bookings || []);
        filterBookingsByTab(activeTab, response.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Unable to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterBookingsByTab = (tab, bookingsData = allBookings) => {
    let filtered = [...bookingsData];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(tab) {
      case 'upcoming':
        filtered = bookingsData.filter(booking => {
          const bookingDate = new Date(booking.booking_date);
          return bookingDate >= today && 
                 ['pending', 'confirmed'].includes(booking.status);
        });
        break;
      case 'past':
        filtered = bookingsData.filter(booking => {
          const bookingDate = new Date(booking.booking_date);
          return bookingDate < today || 
                 ['completed', 'cancelled', 'no-show'].includes(booking.status);
        });
        break;
      case 'pending':
        filtered = bookingsData.filter(booking => booking.status === 'pending');
        break;
      case 'confirmed':
        filtered = bookingsData.filter(booking => booking.status === 'confirmed');
        break;
      case 'cancelled':
        filtered = bookingsData.filter(booking => booking.status === 'cancelled');
        break;
      default:
        break;
    }
    
    setDisplayBookings(filtered);
  };

  const checkAvailabilityForReschedule = async () => {
    if (!selectedBooking?.trainer_id || !rescheduleData.new_date) return;
    
    try {
      const response = await bookingService.checkAvailability(
        selectedBooking.trainer_id,
        rescheduleData.new_date
      );
      
      if (response.success) {
        const slots = bookingService.generateTimeSlots(response.data.bookedSlots || []);
        setAvailableTimeSlots(slots);
      }
    } catch (err) {
      console.error('Failed to check availability:', err);
    }
  };

  // ==================== CANCEL BOOKING ====================
  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setCancelling(true);
      const response = await bookingService.cancelBookingWithReason(
        selectedBooking.id, 
        cancellationReason
      );

      if (response.success) {
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancellationReason('');
        fetchAllBookings();
        toast.success('Booking cancelled successfully');
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  // ==================== RESCHEDULE BOOKING ====================
  const handleRescheduleBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingService.rescheduleBooking(
        selectedBooking.id,
        rescheduleData.new_date,
        rescheduleData.new_time
      );

      if (response.success) {
        setShowRescheduleModal(false);
        setSelectedBooking(null);
        setRescheduleData({ new_date: '', new_time: '' });
        setAvailableTimeSlots([]);
        fetchAllBookings();
        toast.success('Booking rescheduled successfully');
      }
    } catch (err) {
      console.error('Reschedule booking error:', err);
      toast.error('Failed to reschedule booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== SUBMIT FEEDBACK ====================
  const handleSubmitFeedback = async () => {
    try {
      setLoading(true);
      const response = await bookingService.submitFeedback({
        booking_id: selectedBooking.id,
        member_id: user.id,
        trainer_id: selectedBooking.trainer_id,
        rating: feedbackData.rating,
        review: feedbackData.review,
        would_recommend: feedbackData.would_recommend
      });

      if (response.success) {
        setShowFeedbackModal(false);
        setSelectedBooking(null);
        setFeedbackData({ rating: 5, review: '', would_recommend: true });
        fetchAllBookings();
        toast.success('Feedback submitted successfully');
      }
    } catch (err) {
      console.error('Submit feedback error:', err);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FORMAT DATE/TIME ====================
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  // ==================== STATUS BADGE ====================
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'confirmed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      'completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      'no-show': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'No Show' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    );
  };

  // ==================== GET PAYMENT BADGE ====================
  const getPaymentBadge = (status) => {
    const config = {
      'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      'unpaid': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Unpaid' },
      'refunded': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Refunded' }
    };

    const badge = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded-full text-xs`}>
        {badge.label}
      </span>
    );
  };

  // ==================== STATS CARDS ====================
  const renderStatsCards = () => {
    const total = allBookings.length;
    const completed = allBookings.filter(b => b.status === 'completed').length;
    const upcoming = allBookings.filter(b => 
      ['pending', 'confirmed'].includes(b.status) && 
      new Date(b.booking_date) >= new Date()
    ).length;
    const totalHours = allBookings
      .filter(b => b.status === 'completed')
      .reduce((acc, b) => acc + (b.duration_minutes || 60), 0) / 60;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <p className="text-sm font-medium text-orange-600 mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <p className="text-sm font-medium text-green-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-900">{completed}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-sm font-medium text-blue-600 mb-1">Upcoming</p>
          <p className="text-3xl font-bold text-gray-900">{upcoming}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <p className="text-sm font-medium text-purple-600 mb-1">Hours Trained</p>
          <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
        </div>
      </div>
    );
  };

  // ==================== RENDER EMPTY STATE ====================
  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {activeTab === 'upcoming' 
          ? "You don't have any upcoming sessions. Ready to book your first training session?" 
          : activeTab === 'past'
          ? "You haven't completed any sessions yet. Book a session to get started!"
          : "No bookings in this category yet."}
      </p>
      <button
        onClick={() => navigate('/services')}
        className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
      >
        Browse Services
      </button>
    </div>
  );

  // ==================== RENDER BOOKING CARD ====================
  const renderBookingCard = (booking) => {
   
    const canCancel = bookingService.canCancel(booking);
    const canReschedule = bookingService.canReschedule(booking);
    const canProvideFeedback = bookingService.canProvideFeedback(booking);

    return (
      <div key={booking.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="flex flex-wrap justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-gray-500">
                  #{booking.booking_number}
                </span>
                {getStatusBadge(booking.status)}
                {getPaymentBadge(booking.payment_status)}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {booking.service_name || booking.service_title}
              </h3>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {selectedBooking?.id === booking.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => navigate(`/services/${booking.service_id}`)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Service
                    </button>
                    
                    {canReschedule && (
                      <button
                        onClick={() => {
                          setShowRescheduleModal(true);
                          setSelectedBooking(booking);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Reschedule
                      </button>
                    )}
                    
                    {canCancel && (
                      <button
                        onClick={() => {
                          setShowCancelModal(true);
                          setSelectedBooking(booking);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Booking
                      </button>
                    )}
                    
                    {canProvideFeedback && (
                      <button
                        onClick={() => {
                          setShowFeedbackModal(true);
                          setSelectedBooking(booking);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="col-span-1">
              <p className="text-xs text-gray-500 mb-1">Trainer</p>
              <div className="flex items-center gap-2">
                {booking.trainer_image && (
                  <img 
                    src={booking.trainer_image} 
                    alt={booking.trainer_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <p className="font-medium text-gray-900">
                  {booking.trainer_name || 'TBD'}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(booking.booking_date)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Time</p>
              <p className="font-medium text-gray-900 flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(booking.booking_time)} ({booking.duration_minutes} min)
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Session Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {booking.session_type?.replace('-', ' ') || 'One-on-One'}
              </p>
            </div>
          </div>
          
          {booking.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Your Notes</p>
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          )}
          
          {booking.status === 'cancelled' && booking.cancellation_reason && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-red-500 mb-1">Cancellation Reason</p>
              <p className="text-sm text-gray-600">{booking.cancellation_reason}</p>
            </div>
          )}
          
          {booking.reschedule_count > 0 && (
            <div className="mt-2">
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                Rescheduled {booking.reschedule_count} time{booking.reschedule_count > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== RENDER CANCEL MODAL ====================
  const renderCancelModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to cancel your session on{' '}
          {selectedBooking && formatDate(selectedBooking.booking_date)} at{' '}
          {selectedBooking && formatTime(selectedBooking.booking_time)}?
        </p>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Reason for cancellation <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Please tell us why you're cancelling"
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          ></textarea>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCancelModal(false);
              setSelectedBooking(null);
              setCancellationReason('');
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Keep Booking
          </button>
          <button
            onClick={handleCancelBooking}
            disabled={cancelling}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Cancellations made less than 24 hours before the session may be subject to a fee.
        </p>
      </div>
    </div>
  );

  // ==================== RENDER RESCHEDULE MODAL ====================
  const renderRescheduleModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Session</h3>
          <p className="text-gray-600 mb-4">
            Choose a new date and time for your session
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                New Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={rescheduleData.new_date}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, new_date: e.target.value }))}
                min={minDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                New Time <span className="text-red-500">*</span>
              </label>
              <select
                value={rescheduleData.new_time}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, new_time: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select time</option>
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map(slot => (
                    <option 
                      key={slot.time} 
                      value={slot.time}
                      disabled={!slot.available}
                    >
                      {slot.time} {!slot.available && '(Booked)'}
                    </option>
                  ))
                ) : (
                  ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
                   '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM']
                    .map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))
                )}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRescheduleModal(false);
                setSelectedBooking(null);
                setRescheduleData({ new_date: '', new_time: '' });
                setAvailableTimeSlots([]);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRescheduleBooking}
              disabled={!rescheduleData.new_date || !rescheduleData.new_time}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER FEEDBACK MODAL ====================
  const renderFeedbackModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Your Session</h3>
        <p className="text-gray-600 mb-4">
          How was your session with {selectedBooking?.trainer_name}?
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-3">Rating</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                  className="focus:outline-none"
                >
                  <svg 
                    className={`w-10 h-10 ${
                      star <= feedbackData.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Would you recommend this trainer?
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={feedbackData.would_recommend === true}
                  onChange={() => setFeedbackData(prev => ({ ...prev, would_recommend: true }))}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={feedbackData.would_recommend === false}
                  onChange={() => setFeedbackData(prev => ({ ...prev, would_recommend: false }))}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={feedbackData.review}
              onChange={(e) => setFeedbackData(prev => ({ ...prev, review: e.target.value }))}
              placeholder="Share your experience..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowFeedbackModal(false);
              setSelectedBooking(null);
              setFeedbackData({ rating: 5, review: '', would_recommend: true });
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Skip
          </button>
          <button
            onClick={handleSubmitFeedback}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ RENDER TRIAL BANNER
  const renderTrialBanner = () => {
    if (!membership?.isTrial) return null;
    
    if (membership.trial_expired) {
      return (
        <div className="max-w-6xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏰</span>
              <div>
                <p className="font-bold text-red-800 text-lg">Your free trial has ended</p>
                <p className="text-red-600 text-sm">Upgrade to continue accessing all features</p>
              </div>
            </div>
            <Link 
              to="/membership" 
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition text-center"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-6xl mx-auto mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔔</span>
            <div>
              <p className="font-bold text-lg">Your free trial ends in {membership.days_remaining} days</p>
              <p className="text-orange-100 text-sm">Upgrade anytime to continue after your trial</p>
            </div>
          </div>
          <Link 
            to="/membership" 
            className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition text-center"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-16">
        
        {/* Success Message */}
        {successMessage && (
          <div className="max-w-6xl mx-auto mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* ✅ TRIAL BANNER */}
        {renderTrialBanner()}

        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black-900 mb-2">
                My <span className="text-orange-500">Dashboard</span>
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || 'Member'}! Manage your bookings and sessions.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/services')}
              className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book New Session
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        {!loading && !error && allBookings.length > 0 && renderStatsCards()}

        {/* Tabs */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-2 md:gap-6">
              {[
                { id: 'upcoming', label: 'Upcoming Sessions', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { id: 'past', label: 'Past Sessions', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { id: 'pending', label: 'Pending', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { id: 'confirmed', label: 'Confirmed', icon: 'M5 13l4 4L19 7' },
                { id: 'cancelled', label: 'Cancelled', icon: 'M6 18L18 6M6 6l12 12' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-2 flex items-center gap-2 text-sm md:text-base font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your bookings...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAllBookings}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Try Again
              </button>
            </div>
          ) : displayBookings.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-6">
              {displayBookings.map(renderBookingCard)}
            </div>
          )}
        </div>

        {/* CTA Component */}
        <CTA />
      </div>

      {/* Modals */}
      {showCancelModal && renderCancelModal()}
      {showRescheduleModal && renderRescheduleModal()}
      {showFeedbackModal && renderFeedbackModal()}
    </div>
  );
}