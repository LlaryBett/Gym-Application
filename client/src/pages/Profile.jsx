import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendar, FaCrown, FaCreditCard,
  FaDumbbell, FaCalendarAlt, FaHeart, FaHistory, FaCog,
  FaCheckCircle, FaClock, FaMapMarkerAlt, FaDownload, FaEdit,
  FaSignOutAlt, FaChevronRight, FaStar, FaRegStar, FaTrash, FaTimes,
  FaGenderless, FaUserTag, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../hooks/authHooks';
import { authAPI, memberAPI } from '../services/api'; // ✅ ADD memberAPI import
import { membershipService } from '../services/membershipService';
import { programService } from '../services/programService';
import { bookingService } from '../services/bookingService';
import CTA from '../components/CTA';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // ===== STATE =====
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Profile Data
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [savedPrograms, setSavedPrograms] = useState([]);
  
  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }
    fetchAllProfileData();
  }, [user]);

  const fetchAllProfileData = async () => {
    try {
      setLoading(true);
      
      const [
        profileRes,
        membershipRes,
        enrollmentsRes,
        bookingsRes,
        savedRes
      ] = await Promise.all([
        authAPI.getCurrentUser(),
        membershipService.getMyMembership().catch(() => ({ success: false })),
        programService.getMyEnrollments(),
        bookingService.getUserBookings(user.id, { upcoming: true, limit: 5 }),
        programService.getMySavedPrograms()
      ]);

      if (profileRes.success && profileRes.data?.user) {
        const userData = profileRes.data.user;
        
        // Split name into first and last
        const nameParts = userData.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setProfile({
          id: userData.id,
          first_name: firstName,
          last_name: lastName,
          email: userData.email,
          cell_phone: userData.phone,
          membership_number: userData.membershipNumber,
          status: userData.status,
          created_at: userData.createdAt || new Date().toISOString(),
          // Emergency contact from API response
          emergency_contact_name: userData.emergencyContact?.name || '',
          emergency_contact_phone: userData.emergencyContact?.phone || '',
          emergency_contact_email: userData.emergencyContact?.email || '',
          emergency_contact_relationship: userData.emergencyContact?.relationship || ''
        });
        
        // Set edit form with current data
        setEditForm({
          first_name: firstName,
          last_name: lastName,
          email: userData.email,
          phone: userData.phone
        });

        // Set emergency contact
        setEmergencyContact({
          name: userData.emergencyContact?.name || '',
          phone: userData.emergencyContact?.phone || '',
          email: userData.emergencyContact?.email || '',
          relationship: userData.emergencyContact?.relationship || ''
        });
      }

      if (membershipRes.success) {
        setMembership(membershipRes.data);
      }

      if (enrollmentsRes.success) {
        setEnrolledPrograms(enrollmentsRes.data || []);
      }

      if (bookingsRes.success) {
        setUpcomingBookings(bookingsRes.data.bookings || []);
      }

      if (savedRes.success) {
        setSavedPrograms(savedRes.data || []);
      }

    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Now actually updates the profile via API
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare update data - only the fields we want to update
      const updateData = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        cell_phone: editForm.phone,
        emergency_contact_name: emergencyContact.name,
        emergency_contact_phone: emergencyContact.phone,
        emergency_contact_email: emergencyContact.email,
        emergency_contact_relationship: emergencyContact.relationship
      };
      
      // Call the API to update member
      const response = await memberAPI.update(user.id, updateData);
      
      if (response.success) {
        // Refresh all profile data
        await fetchAllProfileData();
        setShowEditModal(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!membership) return;
    if (window.confirm('Are you sure you want to cancel your membership?')) {
      try {
        await membershipService.cancelMembership(membership.id);
        fetchAllProfileData();
        alert('Membership cancelled successfully');
      } catch (err) {
        console.error('Failed to cancel membership:', err);
        alert('Failed to cancel membership');
      }
    }
  };

  const handleUnsaveProgram = async (programId) => {
    try {
      await programService.unsaveProgram(programId);
      setSavedPrograms(savedPrograms.filter(p => p.id !== programId));
    } catch (err) {
      console.error('Failed to unsave program:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`;
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 md:px-16 py-16">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 md:px-16 py-16">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-16 py-8">
        
        {/* ===== HEADER ===== */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            My <span className="text-orange-500">Profile</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage your account and view your activity</p>
        </div>

        {/* ===== PROFILE HEADER CARD ===== */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-orange-500">
                  {getInitials()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <FaEnvelope className="text-gray-400" /> {profile?.email}
                </p>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <FaPhone className="text-gray-400" /> {profile?.cell_phone || 'Not provided'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs text-gray-400">
                    <FaCalendar className="inline mr-1" /> 
                    Member since {formatDate(profile?.created_at)}
                  </p>
                  <p className="text-xs text-gray-400">
                    <FaUserTag className="inline mr-1" />
                    #{profile?.membership_number || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditForm({
                    first_name: profile?.first_name || '',
                    last_name: profile?.last_name || '',
                    email: profile?.email || '',
                    phone: profile?.cell_phone || ''
                  });
                  setEmergencyContact({
                    name: profile?.emergency_contact_name || '',
                    phone: profile?.emergency_contact_phone || '',
                    email: profile?.emergency_contact_email || '',
                    relationship: profile?.emergency_contact_relationship || ''
                  });
                  setShowEditModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <FaEdit /> Edit Profile
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* ===== EDIT PROFILE MODAL ===== */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes size={20} />
              </button>

              <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={editForm.first_name || ''}
                        onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editForm.last_name || ''}
                        onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                        disabled // Email should not be editable
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={emergencyContact.name || ''}
                        onChange={(e) => setEmergencyContact({...emergencyContact, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={emergencyContact.relationship || ''}
                        onChange={(e) => setEmergencyContact({...emergencyContact, relationship: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Spouse, Parent, Friend..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={emergencyContact.phone || ''}
                        onChange={(e) => setEmergencyContact({...emergencyContact, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={emergencyContact.email || ''}
                        onChange={(e) => setEmergencyContact({...emergencyContact, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)} 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== MEMBERSHIP CARD ===== */}
        {membership && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 md:p-8 mb-8 text-white">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <FaCrown size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{membership.plan_name} Membership</h3>
                  <p className="text-orange-100 mt-1">Member #{membership.membership_number}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${membership.price_paid}</div>
                <p className="text-orange-100 text-sm">{membership.billing_cycle}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-orange-400">
              <div>
                <p className="text-orange-100 text-sm">Status</p>
                <p className="font-semibold flex items-center gap-1">
                  <FaCheckCircle className="text-green-300" /> {membership.status || 'Active'}
                </p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Renewal Date</p>
                <p className="font-semibold">{formatDate(membership.end_date)}</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Auto-Renew</p>
                <p className="font-semibold">{membership.auto_renew ? 'ON' : 'OFF'}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link to="/membership" className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition">
                Upgrade Plan
              </Link>
              <button onClick={handleCancelMembership} className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition">
                Cancel Membership
              </button>
            </div>
          </div>
        )}

        {/* ===== TABS ===== */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'programs' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
          >
            <FaDumbbell className="inline mr-1" /> My Programs
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'bookings' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
          >
            <FaCalendarAlt className="inline mr-1" /> Schedule
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'saved' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
          >
            <FaHeart className="inline mr-1" /> Saved
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'emergency' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
          >
            <FaExclamationTriangle className="inline mr-1" /> Emergency
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'settings' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}`}
          >
            <FaCog className="inline mr-1" /> Settings
          </button>
        </div>

        {/* ===== TAB CONTENT ===== */}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-orange-500" /> Upcoming Schedule
              </h3>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{booking.service_name}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.booking_date)} at {booking.booking_time}
                        </p>
                      </div>
                      <Link to={`/programs/${booking.service_id}`} className="text-orange-500 text-sm hover:underline">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming bookings</p>
              )}
            </div>

            {/* Enrolled Programs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaDumbbell className="text-orange-500" /> My Programs
              </h3>
              {enrolledPrograms.length > 0 ? (
                <div className="space-y-4">
                  {enrolledPrograms.slice(0, 3).map((program) => (
                    <div key={program.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{program.title}</p>
                        <p className="text-sm text-gray-600">{program.category}</p>
                      </div>
                      <Link to={`/programs/${program.id}`} className="text-orange-500 text-sm hover:underline">
                        Continue
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No enrolled programs</p>
              )}
            </div>

            {/* Emergency Contact Preview */}
            {profile?.emergency_contact_name && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaExclamationTriangle className="text-orange-500" /> Emergency Contact
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{profile.emergency_contact_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{profile.emergency_contact_relationship}</p>
                  <p className="text-sm text-gray-600 mt-1">{profile.emergency_contact_phone}</p>
                  <p className="text-sm text-gray-600 mt-1">{profile.emergency_contact_email}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROGRAMS TAB */}
        {activeTab === 'programs' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">My Enrolled Programs</h3>
            {enrolledPrograms.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {enrolledPrograms.map((program) => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <img src={program.image} alt={program.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                    <h4 className="font-bold">{program.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{program.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">In Progress</span>
                      <Link to={`/programs/${program.id}`} className="text-orange-500 text-sm font-semibold">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't enrolled in any programs yet.</p>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Upcoming Bookings</h3>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{booking.service_name}</h4>
                        <p className="text-sm text-gray-600">with {booking.trainer_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1"><FaCalendarAlt className="text-gray-400" /> {formatDate(booking.booking_date)}</span>
                          <span className="flex items-center gap-1"><FaClock className="text-gray-400" /> {booking.booking_time}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-sm text-orange-500 hover:underline">Reschedule</button>
                        <button className="text-sm text-red-500 hover:underline">Cancel</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming bookings</p>
            )}
          </div>
        )}

        {/* SAVED TAB */}
        {activeTab === 'saved' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaHeart className="text-red-500" /> Saved Programs
            </h3>
            {savedPrograms.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {savedPrograms.map((program) => (
                  <div key={program.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition relative group">
                    <img src={program.image} alt={program.title} className="w-full h-40 object-cover" />
                    <button
                      onClick={() => handleUnsaveProgram(program.id)}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaTrash className="text-red-500 text-sm" />
                    </button>
                    <div className="p-3">
                      <h4 className="font-bold text-sm">{program.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{program.category}</p>
                      <Link to={`/programs/${program.id}`} className="text-orange-500 text-xs font-semibold mt-2 inline-block">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No saved programs yet.</p>
            )}
          </div>
        )}

        {/* EMERGENCY CONTACT TAB */}
        {activeTab === 'emergency' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-orange-500" /> Emergency Contact
            </h3>
            
            {profile?.emergency_contact_name ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Contact Name</p>
                    <p className="font-semibold">{profile.emergency_contact_name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Relationship</p>
                    <p className="font-semibold">{profile.emergency_contact_relationship || 'Not specified'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-semibold">{profile.emergency_contact_phone || 'Not provided'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-semibold">{profile.emergency_contact_email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setEmergencyContact({
                        name: profile.emergency_contact_name,
                        phone: profile.emergency_contact_phone,
                        email: profile.emergency_contact_email,
                        relationship: profile.emergency_contact_relationship
                      });
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    <FaEdit /> Update Emergency Contact
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaExclamationTriangle className="text-gray-300 text-5xl mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-700 mb-2">No Emergency Contact Set</h4>
                <p className="text-gray-500 mb-6">Add an emergency contact to ensure your safety</p>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
                >
                  <FaEdit /> Add Emergency Contact
                </button>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-6">Account Settings</h3>
            
            <div className="space-y-6">
              {/* Notifications */}
              <div>
                <h4 className="font-semibold mb-3">Notification Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="text-orange-500 rounded" defaultChecked />
                    <span>Email notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="text-orange-500 rounded" defaultChecked />
                    <span>SMS reminders</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="text-orange-500 rounded" />
                    <span>Promotional emails</span>
                  </label>
                </div>
              </div>

              {/* Password */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-semibold mb-3">Security</h4>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                  Change Password
                </button>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-red-600 mb-3">Danger Zone</h4>
                <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <CTA />
    </div>
  );
};

export default Profile;