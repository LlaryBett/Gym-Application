import React from 'react';
import { FaTimes, FaCheck, FaStar } from 'react-icons/fa';

const PlanDetailsModal = ({
  isOpen,
  onClose,
  plan = {}
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
            {plan.popular && (
              <div className="flex items-center gap-2 mt-2">
                <FaStar className="text-yellow-500" />
                <span className="text-sm text-gray-600">Popular Plan</span>
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
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{plan.description}</p>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-semibold mb-1">Monthly Price</p>
              <p className="text-2xl font-bold text-blue-900">KSH {plan.price_monthly?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-semibold mb-1">Yearly Price</p>
              <p className="text-2xl font-bold text-green-900">KSH {plan.price_yearly?.toLocaleString() || '0'}</p>
            </div>
          </div>

          {/* Features */}
          {plan.features && plan.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{plan.status || 'Unknown'}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Trial Days</p>
              <p className="text-sm font-semibold text-gray-900">{plan.trial_days || 0} days</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Max Members</p>
              <p className="text-sm font-semibold text-gray-900">{plan.max_members || 'Unlimited'}</p>
            </div>
            {plan.active_members !== undefined && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Active Members</p>
                <p className="text-sm font-semibold text-gray-900">{plan.active_members}</p>
              </div>
            )}
            {plan.revenue !== undefined && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Revenue</p>
                <p className="text-sm font-semibold text-gray-900">KSH {plan.revenue?.toLocaleString() || '0'}</p>
              </div>
            )}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Display Order</p>
              <p className="text-sm font-semibold text-gray-900">{plan.display_order || 0}</p>
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-3 gap-4">
            {plan.cancel_anytime !== false && (
              <div className="flex items-center gap-2 text-green-600">
                <FaCheck />
                <span className="text-sm">Cancel Anytime</span>
              </div>
            )}
            {plan.highlighted && (
              <div className="flex items-center gap-2 text-blue-600">
                <FaStar />
                <span className="text-sm">Featured</span>
              </div>
            )}
            {plan.popular && (
              <div className="flex items-center gap-2 text-orange-600">
                <FaStar />
                <span className="text-sm">Popular</span>
              </div>
            )}
          </div>
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

export default PlanDetailsModal;
