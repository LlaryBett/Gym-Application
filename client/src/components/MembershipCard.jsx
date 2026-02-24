import React from 'react';
import { FaCrown, FaDumbbell, FaShieldAlt, FaCreditCard, FaRegClock, FaCalendarAlt } from 'react-icons/fa';
import { GiBodyBalance, GiStrongMan } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';

const MembershipCard = ({ membership, user }) => {
  const navigate = useNavigate();

  // Format card number with spaces every 4 digits
  const formatCardNumber = (number) => {
    if (!number) return '•••• •••• •••• ••••';
    const cleaned = number.replace(/\s/g, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return '•••• •••• •••• ••••';
  };

  // Format expiry date
  const formatExpiry = (dateString) => {
    if (!dateString) return '••/••';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}`.padStart(2, '0') + '/' + date.getFullYear().toString().slice(-2);
  };

  // Get card type based on membership plan
  const getCardType = () => {
    if (!membership?.plan_name) return 'Standard';
    if (membership.plan_name.includes('Premium')) return 'Premium';
    if (membership.plan_name.includes('Pro')) return 'Pro';
    return 'Standard';
  };

  // Get gradient based on plan
  const getCardGradient = () => {
    if (!membership?.plan_name) return 'from-gray-800 to-gray-900';
    if (membership.plan_name.includes('Premium')) return 'from-purple-800 via-purple-700 to-orange-600';
    if (membership.plan_name.includes('Pro')) return 'from-blue-800 via-blue-700 to-orange-500';
    return 'from-green-800 via-green-700 to-orange-500';
  };

  // Get icon based on plan
  const getCardIcon = () => {
    if (!membership?.plan_name) return <FaCrown className="text-yellow-400" />;
    if (membership.plan_name.includes('Premium')) return <GiStrongMan className="text-yellow-400 text-2xl" />;
    if (membership.plan_name.includes('Pro')) return <GiBodyBalance className="text-yellow-400 text-2xl" />;
    return <FaDumbbell className="text-yellow-400 text-2xl" />;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div className={`
        relative overflow-hidden rounded-2xl shadow-2xl
        bg-gradient-to-br ${getCardGradient()}
        text-white p-6 transition-transform hover:scale-105 duration-300
        border border-white/20 backdrop-blur-sm
      `}>
        
        {/* Background Pattern - Circuit lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 100 M100 0 L0 100" stroke="white" strokeWidth="0.5" />
            <path d="M0 20 L100 80 M0 40 L100 60 M0 60 L100 40 M0 80 L100 20" stroke="white" strokeWidth="0.3" opacity="0.5" />
          </svg>
        </div>

        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

        {/* Card Header */}
<div className="relative flex justify-between items-start">
  <div>
    <div className="flex items-center gap-2">
      {/* YOUR OFFICIAL POWERGYM LOGO */}
      <img 
        src="https://res.cloudinary.com/dm6mcyuvu/image/upload/v1771598823/Logo_r5gks2.png" 
        alt="PowerGym Logo" 
        className="w-8 h-8 rounded-full object-cover border-2 border-white/30 shadow-lg"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/fallback-logo.png'; // Optional fallback
        }}
      />
      <span className="text-xl font-bold tracking-wider">PowerGym</span>
    </div>
    <p className="text-xs text-white/70 mt-1">{getCardType()}</p>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
      {getCardIcon()}
    </div>
    <div className="mastercard-logo text-xl font-bold">
      MC
    </div>
  </div>
</div>
        

        {/* Chip & Contactless */}
        <div className="relative flex items-center gap-4 mb-8">
          <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md flex items-center justify-center">
            <div className="w-8 h-6 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-sm"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-white/60"></div>
            </div>
            <span className="text-xs text-white/60">CONTACTLESS</span>
          </div>
        </div>

        {/* Card Number */}
        <div className="relative mb-6">
          <p className="text-xs text-white/60 mb-1">Card Number</p>
          <p className="font-mono text-xl tracking-wider">
            {formatCardNumber(membership?.membership_number)}
          </p>
        </div>

        {/* Card Details */}
        <div className="relative grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-white/60 mb-1">Member Name</p>
            <p className="font-semibold text-lg truncate">
              {user?.name || 'Member Name'}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Valid Thru</p>
            <p className="font-semibold text-lg">
              {formatExpiry(membership?.end_date)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaRegClock className="text-white/40" />
            <span className="text-xs text-white/60">
              {membership?.days_remaining ? `${membership.days_remaining} days remaining` : 'Lifetime'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-orange-500/30 flex items-center justify-center">
              <span className="text-xs">V</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
              <span className="text-xs">MC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-6 flex gap-3 justify-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-50 transition"
        >
          Download Card
        </button>
      </div>

      {/* Card Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          <FaShieldAlt className="inline mr-1 text-green-500" />
          Your virtual membership card is secure and can be used for gym access
        </p>
      </div>
    </div>
  );
};

export default MembershipCard;