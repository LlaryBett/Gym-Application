import React from 'react';
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaDumbbell, FaAward, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaStarHalf } from 'react-icons/fa';
import { GiWeightLiftingUp } from 'react-icons/gi';

const TrainerDetailsModal = ({
  isOpen,
  onClose,
  trainer = {}
}) => {
  if (!isOpen || !trainer) return null;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" size={16} />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<FaStarHalf key={i} className="text-yellow-400" size={16} />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" size={16} />);
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
        <div className="sticky top-0 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              {trainer.image ? (
                <img
                  src={trainer.image}
                  alt={trainer.first_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {trainer.first_name} {trainer.last_name}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <GiWeightLiftingUp className="text-orange-500" />
                {trainer.specialty || 'N/A'}
              </p>
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
          {/* Rating & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-600 font-semibold uppercase mb-2">Rating</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1">
                  {renderStars(trainer.rating || 0)}
                </div>
                <span className="text-lg font-bold text-gray-900">{trainer.rating || '0'}/5</span>
              </div>
              <p className="text-xs text-gray-600">{trainer.total_sessions || 0} sessions</p>
            </div>
            <div className={`rounded-lg p-4 border ${
              trainer.status === 'active' ? 'bg-green-50 border-green-200' : 
              trainer.status === 'inactive' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <p className="text-xs font-semibold uppercase mb-2 text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                trainer.status === 'active' ? 'bg-green-100 text-green-800' :
                trainer.status === 'inactive' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {trainer.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
              </span>
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
                  {trainer.email || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Phone</p>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <FaPhone className="text-orange-500" size={14} />
                  {trainer.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaDumbbell className="text-green-500" />
              Professional Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Experience</p>
                <p className="text-2xl font-bold text-gray-900">{trainer.experience_years || 0}</p>
                <p className="text-xs text-gray-600">years</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Hourly Rate</p>
                <p className="text-2xl font-bold text-orange-600">KSH {trainer.hourly_rate?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-600">per hour</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{trainer.total_sessions || 0}</p>
                <p className="text-xs text-gray-600">completed</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {trainer.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
              <p className="text-gray-600 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-4">
                {trainer.bio}
              </p>
            </div>
          )}

          {/* Certifications */}
          {trainer.certifications && trainer.certifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaAward className="text-purple-500" />
                Certifications ({trainer.certifications.length})
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                {trainer.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3 pb-2 border-b border-gray-200 last:border-b-0">
                    <FaAward className="text-purple-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cert.name || cert}</p>
                      {cert.issued_date && (
                        <p className="text-xs text-gray-600">
                          Issued: {formatDate(cert.issued_date)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {trainer.availability && trainer.availability.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                Availability
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                {trainer.availability.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between pb-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm font-medium text-gray-900">{slot.day || slot.name}</span>
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <FaClock size={12} />
                      {slot.time || `${slot.start_time} - ${slot.end_time}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {trainer.created_at && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-600 mb-3">Additional Information</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Joined Date</span>
                  <span className="text-gray-900 font-medium">{formatDate(trainer.created_at)}</span>
                </div>
                {trainer.specializations && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specializations</span>
                    <span className="text-gray-900 font-medium">{trainer.specializations}</span>
                  </div>
                )}
              </div>
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

export default TrainerDetailsModal;
