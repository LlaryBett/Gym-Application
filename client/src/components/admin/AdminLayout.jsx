import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaDumbbell, FaCalendarAlt, 
  FaCreditCard, FaChartBar, FaCog, FaSignOutAlt,
  FaBars, FaTimes, FaUserTie, FaClipboardList
} from 'react-icons/fa';
import { useAuth } from '../../hooks/authHooks';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FaTachometerAlt },
    { name: 'Members', href: '/admin/members', icon: FaUsers },
    { name: 'Trainers', href: '/admin/trainers', icon: FaUserTie },
    { name: 'Programs', href: '/admin/programs', icon: FaDumbbell },
    { name: 'Bookings', href: '/admin/bookings', icon: FaCalendarAlt },
    { name: 'Membership Plans', href: '/admin/plans', icon: FaCreditCard },
    { name: 'Reports', href: '/admin/reports', icon: FaChartBar },
    { name: 'Settings', href: '/admin/settings', icon: FaCog },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} 
        lg:translate-x-0 transition duration-200 ease-in-out
        w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white
        z-50 lg:z-30 flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <Link to="/admin" className="flex items-center gap-2">
            <img 
              src="/PowerGym-Logo (1).svg" 
              alt="PowerGym Logo" 
              className="h-8 w-8 object-contain rounded-full"
            />
            <span className="text-lg font-bold">PowerGym Admin</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-hidden py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${isActive(item.href) 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="text-lg" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info & logout */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`
        lg:ml-64 transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'ml-64' : 'ml-0'}
      `}>
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <FaBars size={24} />
            </button>
            
            <div className="flex-1 flex justify-end items-center gap-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FaBars size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content - no footer here */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;