import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const CardPreview = ({ membership, user }) => {
  const [showCVV, setShowCVV] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Format card number
  const formatCardNumber = (number) => {
    if (!number) return '**** **** **** ****';
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
    return '**** **** **** ****';
  };

  // Get card color based on plan
  const getCardColor = () => {
    if (!membership?.plan_name) return 'from-gray-600 to-gray-800';
    if (membership.plan_name.includes('Premium')) return 'from-purple-600 to-orange-600';
    if (membership.plan_name.includes('Pro')) return 'from-blue-600 to-orange-500';
    return 'from-green-600 to-orange-500';
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div
        className={`relative w-full h-64 cursor-pointer transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className={`
          absolute inset-0 backface-hidden rounded-2xl p-6
          bg-gradient-to-br ${getCardColor()}
          text-white shadow-2xl border border-white/20
        `}>
          {/* Card content (same as before) */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs opacity-80">PowerGym</p>
              <p className="text-sm font-bold">{membership?.plan_name || 'Member Card'}</p>
            </div>
            <FaEye className="text-white/60" />
          </div>

          <div className="mt-8">
            <p className="text-xs opacity-80 mb-1">Card Number</p>
            <p className="font-mono text-xl tracking-wider">
              {formatCardNumber(membership?.membership_number)}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs opacity-80 mb-1">Member</p>
              <p className="font-semibold truncate">{user?.name || 'Member'}</p>
            </div>
            <div>
              <p className="text-xs opacity-80 mb-1">Valid Thru</p>
              <p className="font-semibold">
                {membership?.end_date ? new Date(membership.end_date).toLocaleDateString() : '--/--'}
              </p>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className={`
          absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-6
          bg-gradient-to-br from-gray-700 to-gray-900
          text-white shadow-2xl border border-white/20
        `}>
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold">Security Details</p>
              <FaEyeSlash className="text-white/60" />
            </div>

            <div className="mt-4 bg-black/40 h-10 rounded flex items-center justify-end px-4">
              <span className="text-white/80 text-sm">Authorized Signature</span>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs opacity-80">CVV</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg">
                  {showCVV ? membership?.cvv || '123' : '•••'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCVV(!showCVV);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  {showCVV ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="mt-auto text-center">
              <p className="text-xs opacity-60">This card is for gym access only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;