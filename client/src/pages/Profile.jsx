import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendar, FaCrown, FaCreditCard,
  FaDumbbell, FaCalendarAlt, FaHeart, FaHistory, FaCog,
  FaCheckCircle, FaClock, FaMapMarkerAlt, FaDownload, FaEdit,
  FaSignOutAlt, FaChevronRight, FaStar, FaRegStar, FaTrash, FaTimes,
  FaGenderless, FaUserTag, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../hooks/authHooks';
import { authAPI, memberAPI } from '../services/api';
import { membershipService } from '../services/membershipService';
import { programService } from '../services/programService';
import { bookingService } from '../services/bookingService';
import CTA from '../components/CTA';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Just like Dashboard
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [savedPrograms, setSavedPrograms] = useState([]);
  
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Simple redirect like Dashboard
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    fetchAllProfileData();
  }, [user]); // ✅ Same dependency as Dashboard

  const fetchAllProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch all data
      const profileRes = await authAPI.getCurrentUser();
      const membershipRes = await membershipService.getMyMembership().catch(() => ({ success: false, data: null }));
      const enrollmentsRes = await programService.getMyEnrollments().catch(() => ({ success: false, data: [] }));
      const bookingsRes = await bookingService.getUserBookings(user.id, { upcoming: true, limit: 5 }).catch(() => ({ success: false, data: { bookings: [] } }));
      const savedRes = await programService.getMySavedPrograms().catch(() => ({ success: false, data: [] }));

      // Set profile data
      if (profileRes.success && profileRes.data?.user) {
        const userData = profileRes.data.user;
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
          emergency_contact_name: userData.emergencyContact?.name || '',
          emergency_contact_phone: userData.emergencyContact?.phone || '',
          emergency_contact_email: userData.emergencyContact?.email || '',
          emergency_contact_relationship: userData.emergencyContact?.relationship || ''
        });
        
        setEditForm({ first_name: firstName, last_name: lastName, email: userData.email, phone: userData.phone });
        setEmergencyContact({
          name: userData.emergencyContact?.name || '',
          phone: userData.emergencyContact?.phone || '',
          email: userData.emergencyContact?.email || '',
          relationship: userData.emergencyContact?.relationship || ''
        });
      }

      // Set other data
      if (membershipRes.success) setMembership(membershipRes.data);
      setEnrolledPrograms(enrollmentsRes.success ? enrollmentsRes.data || [] : []);
      setUpcomingBookings(bookingsRes.success ? bookingsRes.data.bookings || [] : []);
      setSavedPrograms(savedRes.success ? savedRes.data || [] : []);
      
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers (same as before)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setIsSubmitting(true);
      const updateData = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        cell_phone: editForm.phone,
        emergency_contact_name: emergencyContact.name,
        emergency_contact_phone: emergencyContact.phone,
        emergency_contact_email: emergencyContact.email,
        emergency_contact_relationship: emergencyContact.relationship
      };
      const response = await memberAPI.update(user.id, updateData);
      if (response.success) {
        await fetchAllProfileData();
        setShowEditModal(false);
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile. Please try again.');
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
        toast.success('Membership cancelled successfully');
      } catch {
        toast.error('Failed to cancel membership');
      }
    }
  };

  const handleUnsaveProgram = async (programId) => {
    try {
      await programService.unsaveProgram(programId);
      setSavedPrograms(savedPrograms.filter(p => p.id !== programId));
      toast.success('Program removed from saved');
    } catch {
      toast.error('Failed to unsave program');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return 'N/A'; }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name[0]}${profile.last_name[0]}`;
    if (profile?.email) return profile.email[0].toUpperCase();
    return 'U';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'programs', label: 'My Programs', icon: <FaDumbbell /> },
    { id: 'bookings', label: 'Schedule', icon: <FaCalendarAlt /> },
    { id: 'saved', label: 'Saved', icon: <FaHeart /> },
    { id: 'emergency', label: 'Emergency', icon: <FaExclamationTriangle /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];

  const openEditModal = () => {
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
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── MOBILE LAYOUT (< lg) ── */}
      <div className="lg:hidden">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Mobile Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-orange-500">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{profile?.first_name} {profile?.last_name}</h2>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 truncate">
                  <FaEnvelope className="text-gray-400 flex-shrink-0" /> {profile?.email}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <FaPhone className="text-gray-400 flex-shrink-0" /> {profile?.cell_phone || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-400">
                <span><FaCalendar className="inline mr-1" />Member since {formatDate(profile?.created_at)}</span>
              </div>
              <button onClick={openEditModal} className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <FaEdit size={12} /> Edit
              </button>
            </div>
          </div>

          {/* Mobile Membership Card */}
          {membership && <MembershipCard membership={membership} formatDate={formatDate} handleCancelMembership={handleCancelMembership} />}

          {/* Mobile Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-medium text-sm whitespace-nowrap transition ${
                  activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Tab Content */}
          <TabContent
            activeTab={activeTab}
            profile={profile}
            enrolledPrograms={enrolledPrograms}
            upcomingBookings={upcomingBookings}
            savedPrograms={savedPrograms}
            formatDate={formatDate}
            handleUnsaveProgram={handleUnsaveProgram}
            openEditModal={openEditModal}
          />
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (≥ lg) ── */}
      <div className="hidden lg:block">
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My <span className="text-orange-500">Profile</span></h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your account and view your activity</p>
          </div>

          <div className="flex gap-8 items-start">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="w-72 flex-shrink-0 space-y-4 sticky top-24">
              
              {/* Identity Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-orange-400 to-orange-600" />
                <div className="px-5 pb-5">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center -mt-8 shadow-md border-2 border-white mb-3">
                    <span className="text-2xl font-bold text-orange-500">{getInitials()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">#{profile?.membership_number || 'N/A'}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaEnvelope className="text-gray-400 flex-shrink-0 text-xs" />
                      <span className="truncate">{profile?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaPhone className="text-gray-400 flex-shrink-0 text-xs" />
                      <span>{profile?.cell_phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCalendar className="text-gray-400 flex-shrink-0 text-xs" />
                      <span>Since {formatDate(profile?.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={openEditModal}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700 transition"
                  >
                    <FaEdit size={12} /> Edit Profile
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {tabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-orange-50 text-orange-600 border-l-2 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                    } ${i !== 0 ? 'border-t border-gray-50' : ''}`}
                  >
                    <span className={activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'}>{tab.icon}</span>
                    {tab.label}
                    {activeTab === tab.id && <FaChevronRight className="ml-auto text-orange-400" size={10} />}
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2"><FaDumbbell className="text-orange-400" size={12} /> Programs</span>
                    <span className="text-sm font-bold text-gray-900">{enrolledPrograms.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2"><FaCalendarAlt className="text-orange-400" size={12} /> Bookings</span>
                    <span className="text-sm font-bold text-gray-900">{upcomingBookings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-2"><FaHeart className="text-orange-400" size={12} /> Saved</span>
                    <span className="text-sm font-bold text-gray-900">{savedPrograms.length}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 min-w-0 space-y-6">
              
              {/* Membership Card */}
              {membership && <MembershipCard membership={membership} formatDate={formatDate} handleCancelMembership={handleCancelMembership} />}

              {/* Tab Content */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-orange-500">{tabs.find(t => t.id === activeTab)?.icon}</span>
                  <h3 className="font-semibold text-gray-900">{tabs.find(t => t.id === activeTab)?.label}</h3>
                </div>
                <div className="p-6">
                  <TabContent
                    activeTab={activeTab}
                    profile={profile}
                    enrolledPrograms={enrolledPrograms}
                    upcomingBookings={upcomingBookings}
                    savedPrograms={savedPrograms}
                    formatDate={formatDate}
                    handleUnsaveProgram={handleUnsaveProgram}
                    openEditModal={openEditModal}
                    isDesktop={true}
                  />
                </div>
              </div>
            </main>

          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes size={20} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <input type="text" value={editForm.first_name || ''} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input type="text" value={editForm.last_name || ''} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={editForm.email || ''} disabled
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="tel" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm" />
                  </div>
                </div>
              </div>
              <div className="pt-5 border-t border-gray-100">
                <h4 className="text-base font-semibold text-gray-800 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Contact Name', key: 'name', type: 'text' },
                    { label: 'Relationship', key: 'relationship', type: 'text', placeholder: 'Spouse, Parent, Friend...' },
                    { label: 'Contact Phone', key: 'phone', type: 'tel' },
                    { label: 'Contact Email', key: 'email', type: 'email' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                      <input type={field.type} value={emergencyContact[field.key] || ''} placeholder={field.placeholder}
                        onChange={(e) => setEmergencyContact({...emergencyContact, [field.key]: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition disabled:opacity-50 text-sm">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CTA />
    </div>
  );
};

/* ─── Membership Card ─── */
const MembershipCard = ({ membership, formatDate, handleCancelMembership }) => (
  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl lg:rounded-2xl shadow-lg p-6 text-white">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
          <FaCrown size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold leading-tight">{membership.plan_name}</h3>
            {membership.isTrial && (
              <span className="bg-yellow-400 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {membership.trial_expired ? 'EXPIRED' : 'TRIAL'}
              </span>
            )}
          </div>
          <p className="text-orange-100 text-xs mt-0.5">Member #{membership.membership_number}</p>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-2xl font-bold leading-none">
          {membership.isTrial ? 'Free' : `Ksh${membership.price_paid}`}
        </div>
        <p className="text-orange-100 text-xs mt-0.5">{membership.billing_cycle}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/20">
      <div>
        <p className="text-orange-100 text-xs">Status</p>
        <p className="font-semibold text-sm flex items-center gap-1 mt-0.5">
          <FaCheckCircle className="text-green-300" size={12} />
          {membership.trial_expired ? 'Expired' : (membership.status || 'Active')}
        </p>
      </div>
      <div>
        <p className="text-orange-100 text-xs">{membership.isTrial ? 'Trial Ends' : 'Renews'}</p>
        <p className="font-semibold text-sm mt-0.5">{formatDate(membership.end_date)}</p>
      </div>
      {!membership.isTrial && (
        <div>
          <p className="text-orange-100 text-xs">Auto-Renew</p>
          <p className="font-semibold text-sm mt-0.5">{membership.auto_renew ? 'ON' : 'OFF'}</p>
        </div>
      )}
      {membership.days_remaining > 0 && (
        <div className="ml-auto">
          <div className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-semibold">
            {membership.days_remaining} {membership.isTrial ? 'trial ' : ''}days left
          </div>
        </div>
      )}
    </div>

    <div className="flex gap-3 mt-5">
      {membership.isTrial ? (
        <>
          <Link to="/membership" className="bg-white text-orange-600 px-5 py-2 rounded-full font-semibold hover:bg-gray-100 transition text-sm">
            {membership.trial_expired ? 'Upgrade Now' : 'Upgrade Plan'}
          </Link>
          {!membership.trial_expired && (
            <button onClick={handleCancelMembership} className="bg-white/20 text-white px-5 py-2 rounded-full font-semibold hover:bg-white/30 transition text-sm">
              Cancel Trial
            </button>
          )}
        </>
      ) : (
        <>
          <Link to="/membership" className="bg-gray-900 text-white px-5 py-2 rounded-full font-semibold hover:bg-black transition text-sm">
            Upgrade Plan
          </Link>
          <button onClick={handleCancelMembership} className="bg-white/20 text-white px-5 py-2 rounded-full font-semibold hover:bg-white/30 transition text-sm">
            Cancel
          </button>
        </>
      )}
    </div>
  </div>
);

/* ─── Tab Content ─── */
const TabContent = ({ activeTab, profile, enrolledPrograms, upcomingBookings, savedPrograms, formatDate, handleUnsaveProgram, openEditModal, isDesktop }) => {
  
  if (activeTab === 'overview') return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
          <FaCalendarAlt className="text-orange-400" /> Upcoming Schedule
        </h4>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-2">
            {upcomingBookings.slice(0, isDesktop ? 5 : 3).map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition">
                <div>
                  <p className="font-medium text-sm text-gray-900">{booking.service_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(booking.booking_date)} · {booking.booking_time}</p>
                </div>
                <Link to={`/programs/${booking.service_id}`} className="text-orange-500 text-xs font-semibold hover:underline">View →</Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center bg-gray-50 rounded-xl">No upcoming bookings</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
          <FaDumbbell className="text-orange-400" /> My Programs
        </h4>
        {enrolledPrograms.length > 0 ? (
          <div className={`grid gap-2 ${isDesktop ? 'grid-cols-2' : ''}`}>
            {enrolledPrograms.slice(0, isDesktop ? 4 : 3).map(program => (
              <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition">
                <div>
                  <p className="font-medium text-sm text-gray-900">{program.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{program.category}</p>
                </div>
                <Link to={`/programs/${program.id}`} className="text-orange-500 text-xs font-semibold hover:underline flex-shrink-0">Continue →</Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center bg-gray-50 rounded-xl">No enrolled programs</p>
        )}
      </div>

      {profile?.emergency_contact_name && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
            <FaExclamationTriangle className="text-orange-400" /> Emergency Contact
          </h4>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="font-medium text-sm">{profile.emergency_contact_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{profile.emergency_contact_relationship} · {profile.emergency_contact_phone}</p>
          </div>
        </div>
      )}
    </div>
  );

  if (activeTab === 'programs') return (
    <div>
      {enrolledPrograms.length > 0 ? (
        <div className={`grid gap-4 ${isDesktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
          {enrolledPrograms.map(program => (
            <div key={program.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition">
              <img src={program.image} alt={program.title} className="w-full h-36 object-cover" />
              <div className="p-3">
                <h4 className="font-bold text-sm">{program.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{program.category}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">In Progress</span>
                  <Link to={`/programs/${program.id}`} className="text-orange-500 text-xs font-semibold">View →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaDumbbell className="text-gray-200 text-4xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">You haven't enrolled in any programs yet.</p>
          <Link to="/programs" className="mt-4 inline-block text-orange-500 text-sm font-semibold hover:underline">Browse Programs →</Link>
        </div>
      )}
    </div>
  );

  if (activeTab === 'bookings') return (
    <div>
      {upcomingBookings.length > 0 ? (
        <div className="space-y-3">
          {upcomingBookings.map(booking => (
            <div key={booking.id} className="border border-gray-100 rounded-xl p-4 hover:border-orange-200 transition">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{booking.service_name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">with {booking.trainer_name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><FaCalendarAlt className="text-gray-400" /> {formatDate(booking.booking_date)}</span>
                    <span className="flex items-center gap-1"><FaClock className="text-gray-400" /> {booking.booking_time}</span>
                  </div>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button className="text-xs text-orange-500 hover:underline font-medium">Reschedule</button>
                  <button className="text-xs text-red-400 hover:underline font-medium">Cancel</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No upcoming bookings.</p>
        </div>
      )}
    </div>
  );

  if (activeTab === 'saved') return (
    <div>
      {savedPrograms.length > 0 ? (
        <div className={`grid gap-4 ${isDesktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-2'}`}>
          {savedPrograms.map(program => (
            <div key={program.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition relative group">
              <img src={program.image} alt={program.title} className="w-full h-36 object-cover" />
              <button onClick={() => handleUnsaveProgram(program.id)}
                className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition">
                <FaTrash className="text-red-400" size={11} />
              </button>
              <div className="p-3">
                <h4 className="font-bold text-sm leading-tight">{program.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{program.category}</p>
                <Link to={`/programs/${program.id}`} className="text-orange-500 text-xs font-semibold mt-2 inline-block">View →</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaHeart className="text-gray-200 text-4xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No saved programs yet.</p>
        </div>
      )}
    </div>
  );

  if (activeTab === 'emergency') return (
    <div>
      {profile?.emergency_contact_name ? (
        <div>
          <div className={`grid gap-3 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {[
              { label: 'Contact Name', value: profile.emergency_contact_name },
              { label: 'Relationship', value: profile.emergency_contact_relationship || 'Not specified' },
              { label: 'Phone Number', value: profile.emergency_contact_phone || 'Not provided' },
              { label: 'Email Address', value: profile.emergency_contact_email || 'Not provided' },
            ].map(item => (
              <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="font-semibold text-sm text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-5">
            <button onClick={openEditModal}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition text-sm font-semibold">
              <FaEdit size={12} /> Update Emergency Contact
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FaExclamationTriangle className="text-gray-200 text-4xl mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-gray-700 mb-1">No Emergency Contact Set</h4>
          <p className="text-gray-400 text-sm mb-6">Add an emergency contact to ensure your safety</p>
          <button onClick={openEditModal}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition text-sm">
            <FaEdit size={12} /> Add Emergency Contact
          </button>
        </div>
      )}
    </div>
  );

  if (activeTab === 'settings') return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Notification Preferences</h4>
        <div className="space-y-2">
          {['Email notifications', 'SMS reminders', 'Promotional emails'].map((label, i) => (
            <label key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-orange-50 transition">
              <input type="checkbox" className="text-orange-500 rounded" defaultChecked={i < 2} />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pt-5 border-t border-gray-100">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Security</h4>
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition">
          Change Password
        </button>
      </div>
      <div className="pt-5 border-t border-gray-100">
        <h4 className="font-semibold text-red-500 mb-3 text-sm">Danger Zone</h4>
        <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition">
          Delete Account
        </button>
      </div>
    </div>
  );

  return null;
};

export default Profile;