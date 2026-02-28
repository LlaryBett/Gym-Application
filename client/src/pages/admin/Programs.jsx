import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus,
  FaFileExport, FaDumbbell, FaClock, FaUsers,
  FaCalendarAlt, FaStar, FaFire, FaCheckCircle,
  FaTimesCircle, FaImage, FaVideo, FaQuestionCircle,
  FaCalendarPlus, FaLayerGroup, FaCrown
} from 'react-icons/fa';
import { GiStrongMan, GiWeightLiftingUp } from 'react-icons/gi';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ProgramDetailsModal from '../../components/admin/ProgramDetailsModal';
import GalleryModal from '../../components/admin/GalleryModal';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    featured: ''
  });
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'All Levels',
    duration: '',
    price: '',
    image: '',
    video_url: '',
    featured: false,
    capacity: '',
    instructor_id: '',
    instructor_name: '',
    start_date: '',
    end_date: '',
    schedule: [],
    curriculum: [],
    faqs: [],
    gallery: []
  });

  useEffect(() => {
    fetchPrograms();
    fetchCategories();
  }, [pagination.page, filters]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllPrograms({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success) {
        setPrograms(response.data.programs);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch programs error:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getProgramCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.createProgram(formData);
      
      if (response.success) {
        toast.success('Program created successfully');
        setShowAddModal(false);
        setFormData({
          title: '',
          description: '',
          category: '',
          level: 'All Levels',
          duration: '',
          price: '',
          image: '',
          video_url: '',
          featured: false,
          capacity: '',
          instructor_id: '',
          instructor_name: '',
          start_date: '',
          end_date: '',
          schedule: [],
          curriculum: [],
          faqs: [],
          gallery: []
        });
        fetchPrograms();
      }
    } catch (error) {
      console.error('Add program error:', error);
      toast.error('Failed to create program');
    }
  };

  const handleDeleteProgram = async (id) => {
    try {
      const response = await adminAPI.deleteProgram(id);
      
      if (response.success) {
        toast.success('Program deleted successfully');
        fetchPrograms();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete program');
    } finally {
      setShowDeleteConfirm(false);
      setSelectedProgram(null);
    }
  };

  const openEditModal = (program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title || '',
      description: program.description || '',
      category: program.category || '',
      level: program.level || 'All Levels',
      duration: program.duration || '',
      price: program.price || '',
      image: program.image || '',
      video_url: program.video_url || '', // Convert null to empty string
      featured: program.featured || false,
      capacity: program.capacity || '',
      instructor_id: program.instructor_id || '',
      instructor_name: program.instructor_name || '',
      start_date: program.start_date || '',
      end_date: program.end_date || '',
      schedule: program.schedule || [],
      curriculum: program.curriculum || [],
      faqs: program.faqs || [],
      gallery: program.gallery || []
    });
    setShowEditModal(true);
  };

 const handleEditProgram = async (e) => {
  e.preventDefault();
  try {
    console.log('Token before update:', localStorage.getItem('token'));
    console.log('Updating program:', editingProgram.id);
    console.log('Form data:', formData);
    
    const response = await adminAPI.updateProgram(editingProgram.id, formData);
    console.log('Update response:', response);
    
    if (response.success) {
      toast.success('Program updated successfully');
      setShowEditModal(false);
      setEditingProgram(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        level: 'All Levels',
        duration: '',
        price: '',
        image: '',
        video_url: '',
        featured: false,
        capacity: '',
        instructor_id: '',
        instructor_name: '',
        start_date: '',
        end_date: '',
        schedule: [],
        curriculum: [],
        faqs: [],
        gallery: []
      });
      fetchPrograms();
    }
  } catch (error) {
    console.error('❌ Edit program error:', error);
    console.error('Error status:', error.status); // Check what status is returned
    console.error('Error message:', error.message);
    
    // Only redirect if it's actually a 401
    if (error.status === 401) {
      toast.error('Session expired. Please login again.');
    } else if (error.status === 403) {
      toast.error('You do not have permission to update programs');
    } else {
      toast.error('Failed to update program');
    }
  }
};

  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const response = await adminAPI.exportPrograms(format, filters);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `programs_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Programs exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export programs');
    } finally {
      setExportLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      'All Levels': 'bg-green-100 text-green-800',
      'Beginner': 'bg-blue-100 text-blue-800',
      'Intermediate': 'bg-orange-100 text-orange-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      header: 'Program',
      accessor: (program) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
            {program.image ? (
              <img 
                src={program.image} 
                alt={program.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <FaDumbbell className="text-white text-lg" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{program.title}</p>
            <p className="text-xs text-gray-500">{program.category}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Details',
      accessor: (program) => (
        <div className="space-y-1">
          <p className="text-sm flex items-center gap-2">
            <FaClock className="text-gray-400" size={12} />
            {program.duration}
          </p>
          <p className="text-sm flex items-center gap-2">
            <FaUsers className="text-gray-400" size={12} />
            {program.enrolled_count || 0} enrolled
          </p>
          <p className="text-sm flex items-center gap-2">
            <GiWeightLiftingUp className="text-gray-400" size={12} />
            {program.instructor_name || 'TBD'}
          </p>
        </div>
      )
    },
    {
      header: 'Level',
      accessor: (program) => (
        <span className={`${getLevelBadge(program.level)} px-3 py-1 rounded-full text-xs font-medium`}>
          {program.level}
        </span>
      )
    },
    {
      header: 'Price',
      accessor: (program) => (
        <div>
          <p className="font-semibold text-gray-900">KSH {program.price}</p>
          <p className="text-xs text-gray-500">{program.capacity || 'Limited spots'}</p>
        </div>
      )
    },
    {
      header: 'Schedule',
      accessor: (program) => (
        <div className="space-y-1">
          {program.schedule?.slice(0, 2).map((s, idx) => (
            <p key={idx} className="text-xs flex items-center gap-1">
              <FaCalendarAlt className="text-gray-400" size={10} />
              {s.day}: {s.time}
            </p>
          ))}
          {program.schedule?.length > 2 && (
            <p className="text-xs text-gray-500">+{program.schedule.length - 2} more</p>
          )}
        </div>
      )
    },
    {
      header: 'Featured',
      accessor: (program) => (
        program.featured ? (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
            <FaStar size={10} /> Featured
          </span>
        ) : (
          <span className="text-gray-400 text-xs">No</span>
        )
      )
    },
    {
      header: 'Status',
      accessor: (program) => (
        <StatusBadge status={program.status || 'active'} />
      )
    },
    {
      header: 'Actions',
      accessor: (program) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedProgram(program);
              setShowDetailsModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="View details"
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => openEditModal(program)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedProgram(program);
              setShowGalleryModal(true);
            }}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
            title="Manage gallery"
          >
            <FaImage size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedProgram(program);
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

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c.name, label: c.name }))
  ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'All Levels', label: 'All Levels' }
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
        <h1 className="text-2xl font-bold text-gray-900">Programs Management</h1>
        <p className="text-gray-600 mt-1">Create and manage fitness programs and classes</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Programs</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Programs</p>
          <p className="text-2xl font-bold text-green-600">
            {programs.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Featured</p>
          <p className="text-2xl font-bold text-yellow-600">
            {programs.filter(p => p.featured).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Enrollments</p>
          <p className="text-2xl font-bold text-orange-600">
            {programs.reduce((acc, p) => acc + (p.enrolled_count || 0), 0)}
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
                placeholder="Search programs..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {levelOptions.map(opt => (
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
              Add Program
            </button>
          </div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={programs}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        />
      </div>

      {/* Add Program Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Create New Program</h2>
            </div>

            <form onSubmit={handleAddProgram} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="All Levels">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="e.g., 12 weeks"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSH)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Media</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Image URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Instructor & Capacity */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Instructor & Capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name</label>
                    <input
                      type="text"
                      value={formData.instructor_name}
                      onChange={(e) => setFormData({...formData, instructor_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor ID</label>
                    <input
                      type="text"
                      value={formData.instructor_id}
                      onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="text"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      placeholder="e.g., 20 spots"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
                    <div className="flex items-center gap-3 mt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                          className="text-orange-500 focus:ring-orange-500 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Show as featured program</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Create Program
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditModal && editingProgram && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Edit Program</h2>
            </div>

            <form onSubmit={handleEditProgram} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({...formData, level: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Duration</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="text"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Images & Media */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Images & Media</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Image URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Instructor & Capacity */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Instructor & Capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name</label>
                    <input
                      type="text"
                      value={formData.instructor_name}
                      onChange={(e) => setFormData({...formData, instructor_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor ID</label>
                    <input
                      type="text"
                      value={formData.instructor_id}
                      onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Featured */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="text-orange-500 focus:ring-orange-500 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Show as featured program</span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Update Program
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProgram(null);
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
        onConfirm={() => handleDeleteProgram(selectedProgram?.id)}
        title="Delete Program"
        message={`Are you sure you want to delete "${selectedProgram?.title}"? This action cannot be undone.`}
        type="danger"
      />

      {/* Program Details Modal */}
      {showDetailsModal && selectedProgram && (
        <ProgramDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          program={selectedProgram}
        />
      )}

      {/* Gallery Modal */}
      {showGalleryModal && selectedProgram && (
        <GalleryModal
          isOpen={showGalleryModal}
          onClose={() => setShowGalleryModal(false)}
          program={selectedProgram}
          onUpdate={fetchPrograms}
        />
      )}
    </div>
  );
};

export default Programs;