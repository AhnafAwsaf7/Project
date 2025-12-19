import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }
    fetchUsers();
  }, [user, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data.users || []);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-active`, {
        isActive: !currentStatus,
      });
      if (response.data.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleApproveVerification = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.patch(`/admin/users/${userId}/verification`, {
        verificationStatus: 'VERIFIED',
      });
      if (response.data.success) {
        toast.success('User verified successfully');
        await fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (userItem) => {
    setSelectedUser(userItem);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.patch(`/admin/users/${selectedUser._id}/verification`, {
        verificationStatus: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });
      if (response.data.success) {
        toast.success('User verification rejected');
        await fetchUsers();
        setShowRejectModal(false);
        setSelectedUser(null);
        setRejectionReason('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject user');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'VERIFIED' && user.verificationStatus === 'VERIFIED') ||
      (filter === 'PENDING' && user.verificationStatus === 'PENDING') ||
      (filter === 'UNVERIFIED' && user.verificationStatus === 'UNVERIFIED');
    
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6">User Management</h1>
          <p className="text-sm text-slate-600 leading-relaxed">Manage all platform users</p>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'ALL'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('VERIFIED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'VERIFIED'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'PENDING'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('UNVERIFIED')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'UNVERIFIED'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Unverified
              </button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Verification
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-600">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => (
                    <tr key={userItem._id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{userItem.name}</p>
                          <p className="text-sm text-slate-600">{userItem.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {userItem.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {userItem.isActive ? (
                          <StatusBadge status="active">Active</StatusBadge>
                        ) : (
                          <StatusBadge status="rejected">Inactive</StatusBadge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={userItem.verificationStatus?.toLowerCase() || 'unverified'} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-2">
                          {/* Verification Actions */}
                          {userItem.verificationStatus === 'UNVERIFIED' || userItem.verificationStatus === 'PENDING' ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApproveVerification(userItem._id)}
                                disabled={isProcessing}
                                className="text-xs bg-secondary-600 hover:bg-secondary-700"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleRejectClick(userItem)}
                                disabled={isProcessing}
                                className="text-xs"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : userItem.verificationStatus === 'REJECTED' ? (
                            <Button
                              onClick={() => handleApproveVerification(userItem._id)}
                              disabled={isProcessing}
                              className="text-xs bg-secondary-600 hover:bg-secondary-700"
                            >
                              Approve
                            </Button>
                          ) : null}
                          
                          {/* Active/Inactive Toggle */}
                          <Button
                            variant="secondary"
                            onClick={() => handleToggleActive(userItem._id, userItem.isActive)}
                            className="text-xs"
                          >
                            {userItem.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Reject Modal */}
        {showRejectModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-md w-full p-6">
              <h3 className="text-3xl font-bold text-slate-900 mb-6">Reject User Verification</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Please provide a reason for rejecting {selectedUser.name}'s verification. This reason will be visible to the user.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-danger-500 focus:border-danger-500 text-sm px-3 py-2"
                placeholder="Enter rejection reason..."
              />
              <div className="flex space-x-4 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedUser(null);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectSubmit}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;

