import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaBan,
  FaCheckCircle, FaExclamationTriangle, FaPlus,
  FaFileExport, FaEnvelope, FaPhone, FaCalendar,
  FaUserTag, FaIdCard, FaDumbbell
} from 'react-icons/fa';
import { adminAPI } from '../../services/adminAPI';
import toast from 'react-hot-toast';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ActionButtons from '../../components/admin/ActionButtons';
import FilterBar from '../../components/admin/FilterBar';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import MemberDetailsModal from '../../components/admin/MemberDetailsModal';
import MemberEditModal from '../../components/admin/MemberEditModal';

const Members = () => {
  const [members, setMembers] = useState([]);
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
    membershipType: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusAction, setStatusAction] = useState({ id: null, status: '' });
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [pagination.page, filters]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllMembers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success) {
        setMembers(response.data.members);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Fetch members error:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await adminAPI.updateMemberStatus(id, newStatus);
      
      if (response.success) {
        toast.success(`Member ${newStatus} successfully`);
        fetchMembers();
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('Failed to update member status');
    } finally {
      setShowStatusConfirm(false);
      setStatusAction({ id: null, status: '' });
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      const response = await adminAPI.deleteMember(id);
      
      if (response.success) {
        toast.success('Member deleted successfully');
        fetchMembers();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete member');
    } finally {
      setShowDeleteConfirm(false);
      setSelectedMember(null);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const response = await adminAPI.exportMembers(format, filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `members_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Members exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export members');
    } finally {
      setExportLoading(false);
    }
  };

  const columns = [
    {
      header: 'Member',
      accessor: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 font-semibold">
              {member.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{member.name}</p>
            <p className="text-xs text-gray-500">{member.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Membership',
      accessor: (member) => (
        <div>
          <p className="font-medium text-gray-900">#{member.membershipNumber}</p>
          <p className="text-xs text-gray-500">{member.membershipType || 'Standard'}</p>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: (member) => (
        <div className="space-y-1">
          <p className="text-sm flex items-center gap-2">
            <FaPhone className="text-gray-400 text-xs" />
            {member.phone || 'N/A'}
          </p>
          <p className="text-sm flex items-center gap-2">
            <FaEnvelope className="text-gray-400 text-xs" />
            {member.email}
          </p>
        </div>
      )
    },
    {
      header: 'Joined',
      accessor: (member) => (
        <div>
          <p className="text-sm">{new Date(member.createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {Math.floor((new Date() - new Date(member.createdAt)) / (1000 * 60 * 60 * 24))} days ago
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (member) => (
        <StatusBadge status={member.status} />
      )
    },
    {
      header: 'Actions',
      accessor: (member) => (
        <ActionButtons
          onView={() => {
            setSelectedMember(member);
            setShowDetailsModal(true);
          }}
          onEdit={() => {
            setEditingMember(member);
            setShowEditModal(true);
          }}
          onStatusChange={() => {
            const newStatus = member.status === 'active' ? 'suspended' : 'active';
            setStatusAction({ id: member.id, status: newStatus });
            setShowStatusConfirm(true);
          }}
          onDelete={() => {
            setSelectedMember(member);
            setShowDeleteConfirm(true);
          }}
        />
      )
    }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const membershipOptions = [
    { value: '', label: 'All Types' },
    { value: 'basic', label: 'Basic' },
    { value: 'pro', label: 'Pro' },
    { value: 'premium', label: 'Premium' },
    { value: 'trial', label: 'Trial' }
  ];

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Members Management</h1>
        <p className="text-gray-600 mt-1">View and manage all gym members</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {members.filter(m => m.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {members.filter(m => m.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">New This Month</p>
          <p className="text-2xl font-bold text-orange-600">24</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              statusOptions={statusOptions}
              membershipOptions={membershipOptions}
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
            <Link
              to="/admin/members/add"
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <FaPlus />
              Add Member
            </Link>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={members}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        />
      </div>

      {/* Modals */}
      <MemberDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        member={selectedMember}
      />

      <MemberEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={editingMember}
        onMemberUpdated={fetchMembers}
      />

      <ConfirmDialog
        isOpen={showStatusConfirm}
        onClose={() => setShowStatusConfirm(false)}
        onConfirm={() => handleStatusChange(statusAction.id, statusAction.status)}
        title="Change Member Status"
        message={`Are you sure you want to ${statusAction.status} this member?`}
        type="warning"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => handleDeleteMember(selectedMember?.id)}
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
        type="danger"
      />
    </div>
  );
};

export default Members;