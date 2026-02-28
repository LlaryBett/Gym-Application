import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaStar,
  FaPlus, FaFileExport, FaEnvelope, FaPhone, FaCalendar,
  FaDumbbell, FaMapMarkerAlt, FaAward, FaClock,
  FaCheckCircle, FaTimesCircle, FaStarHalf
} from 'react-icons/fa';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { adminAPI } from '../../services/adminAPI';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import TrainerDetailsModal from '../../components/admin/TrainerDetailsModal';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
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
    specialty: '',
    rating: ''
  });
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    experience_years: 0,
    hourly_rate: 0,
    image: '',
    certifications: [],
    availability: [],
    status: 'active'
  });

  useEffect(() => {
    fetchTrainers();
    fetchSpecialties();
  }, [pagination.page, filters]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTrainers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success) {
        setTrainers(response.data.trainers);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch trainers error:', error);
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await adminAPI.getTrainerSpecialties();
      if (response.success) {
        setSpecialties(response.data);
      }
    } catch (error) {
      console.error('Fetch specialties error:', error);
    }
  };

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.createTrainer(formData);
      
      if (response.success) {
        toast.success('Trainer added successfully');
        setShowAddModal(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          specialty: '',
          bio: '',
          experience_years: 0,
          hourly_rate: 0,
          image: '',
          certifications: [],
          availability: [],
          status: 'active'
        });
        fetchTrainers();
      }
    } catch (error) {
      console.error('Add trainer error:', error);
      toast.error('Failed to add trainer');
    }
  };

  const handleEditTrainer = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.updateTrainer(editingTrainer.id, formData);
      
      if (response.success) {
        toast.success('Trainer updated successfully');
        setShowEditModal(false);
        setEditingTrainer(null);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          specialty: '',
          bio: '',
          experience_years: 0,
          hourly_rate: 0,
          image: '',
          certifications: [],
          availability: [],
          status: 'active'
        });
        fetchTrainers();
      }
    } catch (error) {
      console.error('Edit trainer error:', error);
      toast.error('Failed to update trainer');
    }
  };

  const openEditModal = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      first_name: trainer.first_name,
      last_name: trainer.last_name,
      email: trainer.email,
      phone: trainer.phone,
      specialty: trainer.specialty,
      bio: trainer.bio,
      experience_years: trainer.experience_years,
      hourly_rate: trainer.hourly_rate,
      image: trainer.image,
      certifications: trainer.certifications || [],
      availability: trainer.availability || [],
      status: trainer.status
    });
    setShowEditModal(true);
  };

  const handleDeleteTrainer = async (id) => {
    try {
      const response = await adminAPI.deleteTrainer(id);
      
      if (response.success) {
        toast.success('Trainer deleted successfully');
        fetchTrainers();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete trainer');
    } finally {
      setShowDeleteConfirm(false);
      setSelectedTrainer(null);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const response = await adminAPI.exportTrainers(format, filters);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trainers_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Trainers exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export trainers');
    } finally {
      setExportLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<FaStarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const columns = [
    {
      header: 'Trainer',
      accessor: (trainer) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
            {trainer.image ? (
              <img 
                src={trainer.image} 
                alt={trainer.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{trainer.first_name} {trainer.last_name}</p>
            <p className="text-xs text-gray-500">{trainer.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Specialty',
      accessor: (trainer) => (
        <div className="flex items-center gap-2">
          <GiWeightLiftingUp className="text-orange-500" />
          <span className="text-sm font-medium">{trainer.specialty}</span>
        </div>
      )
    },
    {
      header: 'Experience',
      accessor: (trainer) => (
        <div className="space-y-1">
          <p className="text-sm font-medium">{trainer.experience_years} years</p>
          <p className="text-xs text-gray-500">KSH {trainer.hourly_rate}/hr</p>
        </div>
      )
    },
    {
      header: 'Rating',
      accessor: (trainer) => (
        <div className="space-y-1">
          <div className="flex gap-1">
            {renderStars(trainer.rating || 4.5)}
          </div>
          <p className="text-xs text-gray-500">{trainer.total_sessions || 0} sessions</p>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: (trainer) => (
        <div className="space-y-1">
          <p className="text-sm flex items-center gap-2">
            <FaPhone className="text-gray-400 text-xs" />
            {trainer.phone}
          </p>
          <p className="text-sm flex items-center gap-2">
            <FaEnvelope className="text-gray-400 text-xs" />
            {trainer.email}
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (trainer) => (
        <StatusBadge status={trainer.status} />
      )
    },
    {
      header: 'Actions',
      accessor: (trainer) => (
        <ActionButtons
          onView={() => {
            setSelectedTrainer(trainer);
            setShowDetailsModal(true);
          }}
          onEdit={() => openEditModal(trainer)}
          onStatusChange={() => {
            // Handle status toggle
            const newStatus = trainer.status === 'active' ? 'inactive' : 'active';
            // Add status change logic
          }}
          onDelete={() => {
            setSelectedTrainer(trainer);
            setShowDeleteConfirm(true);
          }}
        />
      )
    }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on_leave', label: 'On Leave' }
  ];

  const specialtyOptions = [
    { value: '', label: 'All Specialties' },
    ...specialties.map(s => ({ value: s, label: s }))
  ];

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' },
    { value: '2', label: '2+ Stars' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trainers Management</h1>
        <p className="text-gray-600 mt-1">Manage your fitness trainers and their schedules</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Trainers</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {trainers.filter(t => t.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Avg Rating</p>
          <p className="text-2xl font-bold text-orange-600">4.8/5</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-blue-600">1,247</p>
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
                placeholder="Search trainers..."
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
              value={filters.specialty}
              onChange={(e) => setFilters({ ...filters, specialty: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {specialtyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {ratingOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
              Add Trainer
            </button>
          </div>
        </div>
      </div>

      {/* Trainers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={trainers}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        />
      </div>

      {/* Add/Edit Trainer Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {showEditModal ? `Edit ${editingTrainer?.first_name} ${editingTrainer?.last_name}` : 'Add New Trainer'}
              </h2>
            </div>

            <form onSubmit={showEditModal ? handleEditTrainer : handleAddTrainer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select specialty</option>
                    {specialties.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (KSH)</label>
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    required
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
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  {showEditModal ? 'Update Trainer' : 'Add Trainer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingTrainer(null);
                    setFormData({
                      first_name: '',
                      last_name: '',
                      email: '',
                      phone: '',
                      specialty: '',
                      bio: '',
                      experience_years: 0,
                      hourly_rate: 0,
                      image: '',
                      certifications: [],
                      availability: [],
                      status: 'active'
                    });
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
        onConfirm={() => handleDeleteTrainer(selectedTrainer?.id)}
        title="Delete Trainer"
        message={`Are you sure you want to delete ${selectedTrainer?.first_name} ${selectedTrainer?.last_name}? This action cannot be undone.`}
        type="danger"
      />

      {/* Trainer Details Modal */}
      {showDetailsModal && selectedTrainer && (
        <TrainerDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          trainer={selectedTrainer}
        />
      )}
    </div>
  );
};

export default Trainers;