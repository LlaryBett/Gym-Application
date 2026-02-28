import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus,
  FaFileExport, FaCrown, FaDumbbell, FaCheckCircle,
  FaTimesCircle, FaStar, FaFire, FaCalendarAlt,
  FaUsers, FaMoneyBill, FaPercent, FaRocket,
  FaChartLine, FaAward, FaGift
} from 'react-icons/fa';
import { GiStrongMan, GiWeightLiftingUp } from 'react-icons/gi';
import { adminAPI } from '../../services/adminAPI';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import PlanDetailsModal from '../../components/admin/PlanDetailsModal';

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    featured: ''
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_monthly: '',
    price_yearly: '',
    features: [],
    highlighted: false,
    display_order: 0,
    status: 'active',
    trial_days: 0,
    max_members: '',
    cancel_anytime: true,
    popular: false
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (pagination) {
      fetchPlans();
    }
  }, [pagination?.page, JSON.stringify(filters)]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllPlans({
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        ...filters
      });

      if (response.success) {
        // Handle both array and object response formats
        const plansData = Array.isArray(response.data) ? response.data : (response.data?.plans || []);
        setPlans(plansData);
        setPagination(response.data?.pagination || { page: 1, limit: 10, total: plansData.length, totalPages: 1 });
      }
    } catch (error) {
      console.error('Fetch plans error:', error);
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.createPlan(formData);
      
      if (response.success) {
        toast.success('Plan created successfully');
        setShowAddModal(false);
        resetForm();
        fetchPlans();
      }
    } catch (error) {
      console.error('Add plan error:', error);
      toast.error('Failed to create plan');
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const response = await adminAPI.updatePlan(selectedPlan.id, formData);
      
      if (response.success) {
        toast.success('Plan updated successfully');
        setShowEditModal(false);
        setSelectedPlan(null);
        resetForm();
        fetchPlans();
      }
    } catch (error) {
      console.error('Update plan error:', error);
      toast.error('Failed to update plan');
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      const response = await adminAPI.deletePlan(id);
      
      if (response.success) {
        toast.success('Plan deleted successfully');
        fetchPlans();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete plan');
    } finally {
      setShowDeleteConfirm(false);
      setSelectedPlan(null);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const response = await adminAPI.exportPlans(format, filters);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `membership_plans_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Plans exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export plans');
    } finally {
      setExportLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_monthly: '',
      price_yearly: '',
      features: [],
      highlighted: false,
      display_order: 0,
      status: 'active',
      trial_days: 0,
      max_members: '',
      cancel_anytime: true,
      popular: false
    });
    setFeatureInput('');
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const calculateYearlySavings = (plan) => {
    const monthly = parseFloat(plan.price?.monthly || 0) * 12;
    const yearly = parseFloat(plan.price?.yearly || 0);
    if (monthly && yearly) {
      const savings = monthly - yearly;
      const percentage = Math.round((savings / monthly) * 100);
      return { savings, percentage };
    }
    return null;
  };

  const columns = [
    {
      header: 'Plan',
      accessor: (plan) => (
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${
            plan.highlighted ? 'bg-gradient-to-br from-orange-500 to-purple-600' :
            plan.name.toLowerCase().includes('premium') ? 'bg-gradient-to-br from-purple-600 to-purple-800' :
            plan.name.toLowerCase().includes('pro') ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
            'bg-gradient-to-br from-green-600 to-green-800'
          }`}>
            {plan.highlighted ? <FaCrown /> : <FaDumbbell />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{plan.name}</p>
              {plan.popular && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FaFire size={10} /> Popular
                </span>
              )}
              {plan.highlighted && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{plan.description}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Pricing',
      accessor: (plan) => {
        const savings = calculateYearlySavings(plan);
        return (
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">KSH {plan.price?.monthly || 0}</p>
              <p className="text-xs text-gray-500">per month</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">KSH {plan.price?.yearly || 0}</p>
              <p className="text-xs text-gray-500">per year</p>
            </div>
            {savings && savings.percentage > 0 && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Save {savings.percentage}%
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Features',
      accessor: (plan) => (
        <div className="space-y-1 max-w-xs">
          {plan.features?.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <FaCheckCircle className="text-green-500 flex-shrink-0" size={12} />
              <span className="text-gray-600 truncate">{feature}</span>
            </div>
          ))}
          {plan.features?.length > 3 && (
            <p className="text-xs text-gray-400">+{plan.features.length - 3} more features</p>
          )}
        </div>
      )
    },
    {
      header: 'Trial',
      accessor: (plan) => (
        <div>
          {plan.trial_days > 0 ? (
            <div className="text-center">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                {plan.trial_days} days free
              </span>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">No trial</span>
          )}
        </div>
      )
    },
    {
      header: 'Stats',
      accessor: (plan) => (
        <div className="space-y-1">
          <p className="text-xs flex items-center gap-1">
            <FaUsers className="text-gray-400" size={10} />
            {plan.active_members || 0} active members
          </p>
          <p className="text-xs flex items-center gap-1">
            <FaChartLine className="text-gray-400" size={10} />
            {plan.revenue || 0} KSH this month
          </p>
          {plan.max_members && (
            <p className="text-xs flex items-center gap-1">
              <FaUsers className="text-gray-400" size={10} />
              Max {plan.max_members} members
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Order',
      accessor: (plan) => (
        <div className="text-center">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
            #{plan.display_order}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (plan) => (
        <StatusBadge status={plan.status} />
      )
    },
    {
      header: 'Actions',
      accessor: (plan) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPlan(plan);
              setShowDetailsModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View details"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedPlan(plan);
              setFormData({
                name: plan.name,
                description: plan.description,
                price_monthly: plan.price?.monthly || 0,
                price_yearly: plan.price?.yearly || 0,
                features: plan.features || [],
                highlighted: plan.highlighted || false,
                display_order: plan.display_order || 0,
                status: plan.status || 'active',
                trial_days: plan.trial_days || 0,
                max_members: plan.max_members || '',
                cancel_anytime: plan.cancel_anytime !== false,
                popular: plan.popular || false
              });
              setShowEditModal(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedPlan(plan);
              setShowDeleteConfirm(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  const featuredOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Featured Only' },
    { value: 'false', label: 'Non-featured' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
        <p className="text-gray-600 mt-1">Create and manage membership plans and pricing</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Plans</p>
          <p className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Plans</p>
          <p className="text-2xl font-bold text-green-600">
            {(plans || []).filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Members</p>
          <p className="text-2xl font-bold text-orange-600">
            {(plans || []).reduce((acc, p) => acc + (p.active_members || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
          <p className="text-2xl font-bold text-blue-600">
            KSH {(plans || []).reduce((acc, p) => acc + (p.revenue || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.featured}
              onChange={(e) => setFilters({ ...filters, featured: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {featuredOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, page: 1 })}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            <input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })}
              className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <FaFileExport />
              {exportLoading ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <FaPlus />
              Add Plan
            </button>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={plans || []}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        />
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Create New Membership Plan</h2>
            </div>

            <form onSubmit={handleAddPlan} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price (KSH)</label>
                    <input
                      type="number"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData({...formData, price_monthly: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Price (KSH)</label>
                    <input
                      type="number"
                      value={formData.price_yearly}
                      onChange={(e) => setFormData({...formData, price_yearly: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Enter a feature..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm text-gray-700">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trial Days</label>
                    <input
                      type="number"
                      value={formData.trial_days}
                      onChange={(e) => setFormData({...formData, trial_days: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Members</label>
                    <input
                      type="number"
                      value={formData.max_members}
                      onChange={(e) => setFormData({...formData, max_members: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.highlighted}
                      onChange={(e) => setFormData({...formData, highlighted: e.target.checked})}
                      className="text-orange-500 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Highlight this plan (featured)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                      className="text-orange-500 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Mark as popular</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.cancel_anytime}
                      onChange={(e) => setFormData({...formData, cancel_anytime: e.target.checked})}
                      className="text-orange-500 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Allow cancellation anytime</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Create Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Edit Plan: {selectedPlan.name}</h2>
            </div>

            <form onSubmit={handleUpdatePlan} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price (KSH)</label>
                    <input
                      type="number"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData({...formData, price_monthly: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Price (KSH)</label>
                    <input
                      type="number"
                      value={formData.price_yearly}
                      onChange={(e) => setFormData({...formData, price_yearly: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Enter a feature..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm text-gray-700">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trial Days</label>
                    <input
                      type="number"
                      value={formData.trial_days}
                      onChange={(e) => setFormData({...formData, trial_days: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Members</label>
                    <input
                      type="number"
                      value={formData.max_members}
                      onChange={(e) => setFormData({...formData, max_members: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.highlighted}
                      onChange={(e) => setFormData({...formData, highlighted: e.target.checked})}
                      className="text-orange-500 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Highlight this plan (featured)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                      className="text-orange-500 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Mark as popular</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.cancel_anytime}
                      onChange={(e) => setFormData({...formData, cancel_anytime: e.target.checked})}
                      className="text-orange-500 focus:ring-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Allow cancellation anytime</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Update Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPlan(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handleDeletePlan(selectedPlan?.id)}
        title="Delete Membership Plan"
        message={`Are you sure you want to delete "${selectedPlan?.name}"? This will affect all members on this plan.`}
        type="danger"
      />

      {/* Plan Details Modal */}
      {showDetailsModal && selectedPlan && (
        <PlanDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          plan={selectedPlan}
        />
      )}
    </div>
  );
};

export default MembershipPlans;