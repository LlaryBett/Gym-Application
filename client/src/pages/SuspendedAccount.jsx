// client/src/pages/SuspendedAccount.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaExclamationTriangle, 
  FaEnvelope, 
  FaPhone, 
  FaLock,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { useAuth } from '../hooks/authHooks';

const SuspendedAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [contacting, setContacting] = useState(false);
  
  // Get suspension data from location state or use defaults
  const suspensionData = location.state || {
    reason: 'Violation of terms of service',
    suspended_at: new Date().toISOString()
  };

  const handleContactSupport = async () => {
    setContacting(true);
    try {
      window.location.href = 'mailto:support@powergym.com?subject=Account Suspension Appeal&body=Please reinstate my account. My membership number is: ...';
    } finally {
      setContacting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-100 to-black-200 flex items-center justify-center p-5 relative overflow-hidden">
      <div className="relative z-10 max-w-lg w-full bg-white rounded-2xl shadow-2xl border-2 border-orange-200 p-12 overflow-hidden">
        
        {/* Background decoration circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-orange-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-orange-200 rounded-full opacity-15 blur-3xl" />

        {/* Content */}
        <div className="relative z-20">
          {/* Warning Icon */}
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-orange-200 animate-pulse">
            <FaExclamationTriangle className="text-5xl text-orange-600" />
          </div>

          <h1 className="text-4xl font-black text-black-900 mb-2 text-center tracking-tight">
            Account Suspended
          </h1>

          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-400 mx-auto mb-6 rounded-full" />

          <p className="text-black-600 leading-relaxed mb-7 text-center text-base">
            Your PowerGym account has been suspended. You cannot access your membership or book services until this is resolved.
          </p>

          {/* Suspension Details Card */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-5">
            <div className="flex gap-3.5 mb-4">
              <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                <FaLock className="text-lg text-orange-700" />
              </div>
              <div>
                <div className="text-xs font-bold text-orange-900 mb-1.5 uppercase tracking-wide">
                  Reason for Suspension
                </div>
                <div className="text-base font-medium text-orange-800">
                  {suspensionData.reason}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-orange-700">
              <FaCalendarAlt className="text-xs" />
              <span className="text-xs">
                Suspended on {formatDate(suspensionData.suspended_at)}
              </span>
            </div>
          </div>

          {/* Toggle Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-orange-600 text-sm font-bold cursor-pointer mb-5 py-2 px-2 text-center flex items-center justify-center gap-2 hover:text-orange-700 transition"
          >
            {showDetails ? 'Hide details' : 'What can I do?'}
            {showDetails ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {/* Details Panel */}
          {showDetails && (
            <div className="bg-black-50 rounded-xl p-6 mb-6 border border-black-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="text-base font-bold text-black-900 mb-4">
                Next Steps:
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </span>
                  <span className="text-black-600 text-sm">
                    Contact support to understand why your account was suspended and what you can do to resolve it.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </span>
                  <span className="text-black-600 text-sm">
                    Provide any requested documentation or information to verify your account.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </span>
                  <span className="text-black-600 text-sm">
                    Wait for review and reinstatement. This typically takes 24-48 hours.
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-black-100 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3.5 mb-4">
              <FaEnvelope className="text-black-500 text-lg" />
              <a 
                href="mailto:support@powergym.com?subject=Account Suspension Appeal"
                className="text-orange-500 no-underline text-sm font-medium hover:text-orange-600 transition"
              >
                support@powergym.com
              </a>
            </div>
            <div className="flex items-center gap-3.5">
              <FaPhone className="text-black-500 text-lg" />
              <a 
                href="tel:+254700000000"
                className="text-orange-500 no-underline text-sm font-medium hover:text-orange-600 transition"
              >
                +254 700 000 000
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 bg-white text-black-600 border border-black-200 py-4 rounded-lg text-sm font-bold cursor-pointer transition hover:bg-black-100"
            >
              Logout
            </button>
            <button
              onClick={handleContactSupport}
              disabled={contacting}
              className="flex-1 bg-orange-600 text-white border-0 py-4 rounded-lg text-sm font-bold cursor-pointer transition hover:bg-orange-700 disabled:opacity-70"
            >
              {contacting ? 'Opening...' : 'Contact Support'}
            </button>
          </div>

          <p className="text-xs text-black-400 text-center mt-5">
            Account reference: {location.state?.membershipNumber || 'N/A'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: slideInFromTop 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default SuspendedAccount;
