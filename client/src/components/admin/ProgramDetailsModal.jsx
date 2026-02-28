import React from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaUsers, FaDumbbell, FaMoneyBill, FaStar, FaVideo, FaBook, FaQuestionCircle } from 'react-icons/fa';
import { GiWeightLiftingUp } from 'react-icons/gi';

const ProgramDetailsModal = ({
  isOpen,
  onClose,
  program = {}
}) => {
  if (!isOpen || !program) return null;

  const getLevelBadgeColor = (level) => {
    const colors = {
      'Beginner': 'bg-green-50 text-green-800 border-green-200',
      'Intermediate': 'bg-yellow-50 text-yellow-800 border-yellow-200',
      'Advanced': 'bg-red-50 text-red-800 border-red-200',
      'All Levels': 'bg-blue-50 text-blue-800 border-blue-200'
    };
    return colors[level] || 'bg-gray-50 text-gray-800 border-gray-200';
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
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{program.title}</h2>
            {program.featured && (
              <div className="flex items-center gap-2 mt-2">
                <FaStar className="text-yellow-500" />
                <span className="text-sm text-gray-600">Featured Program</span>
              </div>
            )}
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
          {/* Image and Video */}
          {(program.image || program.video_url) && (
            <div className="grid grid-cols-2 gap-4">
              {program.image && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Program Image</h3>
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Program+Image';
                    }}
                  />
                </div>
              )}
              {program.video_url && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                    <FaVideo className="text-red-500" />
                    Video Preview
                  </h3>
                  <a
                    href={program.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <FaVideo className="text-gray-400 text-2xl" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{program.description}</p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Category</p>
              <p className="text-gray-900 font-medium">{program.category || 'N/A'}</p>
            </div>
            <div className={`border rounded-lg p-4 ${getLevelBadgeColor(program.level)}`}>
              <p className="text-xs font-semibold uppercase mb-1">Level</p>
              <p className="font-medium">{program.level || 'All Levels'}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Duration</p>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                <FaClock size={12} />
                {program.duration || 'N/A'}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-xs text-orange-600 font-semibold uppercase mb-1">Price</p>
              <p className="text-gray-900 font-bold text-lg">KSH {program.price?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-600 font-semibold uppercase mb-1">Capacity</p>
              <p className="text-gray-900 font-medium">{program.capacity || 'Unlimited'}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">Enrolled</p>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                <FaUsers size={12} />
                {program.enrolled_count || 0}
              </p>
            </div>
          </div>

          {/* Instructor & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <GiWeightLiftingUp />
                Instructor
              </p>
              <p className="text-gray-900 font-medium">{program.instructor_name || 'TBD'}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {program.status || 'active'}
              </span>
            </div>
          </div>

          {/* Program Dates */}
          {(program.start_date || program.end_date) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  Start Date
                </p>
                <p className="text-gray-900 font-medium">{formatDate(program.start_date)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-red-500" />
                  End Date
                </p>
                <p className="text-gray-900 font-medium">{formatDate(program.end_date)}</p>
              </div>
            </div>
          )}

          {/* Schedule */}
          {program.schedule && program.schedule.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaCalendarAlt className="text-purple-500" />
                Schedule
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                {program.schedule.map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-700 font-medium">{item.day}</span>
                    <span className="text-gray-600 flex items-center gap-2">
                      <FaClock size={12} />
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          {program.curriculum && program.curriculum.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaBook className="text-green-500" />
                Curriculum ({program.curriculum.length} weeks)
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                {program.curriculum.map((week, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-3">
                    <p className="text-sm font-semibold text-gray-900">Week {index + 1}{week.title ? `: ${week.title}` : ''}</p>
                    {week.topics && (
                      <p className="text-xs text-gray-600 mt-1">{week.topics}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {program.faqs && program.faqs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaQuestionCircle className="text-orange-500" />
                Frequently Asked Questions
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {program.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 last:border-b-0 p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">{faq.question}</p>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
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

export default ProgramDetailsModal;
