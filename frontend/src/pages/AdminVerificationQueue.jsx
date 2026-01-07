import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const AdminVerificationQueue = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      return;
    }
    loadQueue();
  }, [user]);

  const loadQueue = async () => {
    try {
      const response = await api.get('/admin/verification-queue');
      if (response.data.success) {
        setQueue(response.data.data.queue);
      }
    } catch (error) {
      toast.error('Failed to load verification queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user?')) {
      return;
    }

    setIsProcessing(true);
    try {
      // Use the new endpoint that works for both UNVERIFIED and PENDING users
      const response = await api.patch(`/admin/users/${userId}/verification`, {
        verificationStatus: 'VERIFIED',
      });

      if (response.data.success) {
        toast.success('User verified successfully');
        await loadQueue();
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve verification');
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
      // Use the new endpoint that works for both UNVERIFIED and PENDING users
      const response = await api.patch(`/admin/users/${selectedUser.userId}/verification`, {
        verificationStatus: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });

      if (response.data.success) {
        toast.success('User verification rejected');
        await loadQueue();
        setShowRejectModal(false);
        setSelectedUser(null);
        setRejectionReason('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const openUserDetail = (userItem) => {
    setSelectedUser(userItem);
  };

  const closeUserDetail = () => {
    setSelectedUser(null);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <DashboardLayout role="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
            <p className="text-slate-600">You must be an admin to access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Verification Queue</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {queue.length} pending verification{queue.length !== 1 ? 's' : ''}
          </p>
        </div>
        {queue.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-slate-600">No pending verifications at this time.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Queue List */}
            <div className="lg:col-span-1">
              <Card>
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">Pending Requests</h2>
                </div>
                <div className="divide-y divide-slate-200">
                  {queue.map((item) => (
                    <button
                      key={item.userId}
                      onClick={() => openUserDetail(item)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                        selectedUser?.userId === item.userId ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-600">{item.email}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <StatusBadge status={item.verificationStatus?.toLowerCase() || 'unverified'}>
                              {item.verificationStatus}
                            </StatusBadge>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              {item.role}
                            </span>
                            {item.verificationMethod && item.verificationMethod !== 'NONE' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                {item.verificationMethod === 'DOMAIN' ? 'Domain' : 'Document'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Verification Details</h2>
                    <button
                      onClick={closeUserDetail}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* User Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">User Information</h3>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
                        <div>
                          <span className="text-sm font-medium text-slate-700">Name:</span>
                          <span className="ml-2 text-sm text-slate-900">{selectedUser.name}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Email:</span>
                          <span className="ml-2 text-sm text-slate-900">{selectedUser.email}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Role:</span>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {selectedUser.role}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-700">Submitted:</span>
                          <span className="ml-2 text-sm text-slate-900">
                            {new Date(selectedUser.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                      {/* Verification Proof */}
                      {selectedUser.verificationMethod && selectedUser.verificationMethod !== 'NONE' ? (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-2">Verification Proof</h3>
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            {selectedUser.verificationMethod === 'DOMAIN' ? (
                              <div>
                                <p className="text-sm text-slate-700 mb-2">Domain Submitted:</p>
                                {selectedUser.verificationDocument?.domain ? (
                                  <a
                                    href={`https://${selectedUser.verificationDocument.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                  >
                                    {selectedUser.verificationDocument.domain}
                                    <svg
                                      className="inline-block w-4 h-4 ml-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                ) : (
                                  <p className="text-sm text-slate-600">No domain submitted</p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm text-slate-700 mb-2">Document Uploaded:</p>
                                {selectedUser.verificationDocument?.fileUrl ? (
                                  <a
                                    href={`http://localhost:5000${selectedUser.verificationDocument.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center transition-colors"
                                  >
                                    View Document
                                    <svg
                                      className="w-4 h-4 ml-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                ) : (
                                  <p className="text-sm text-slate-600">No document available</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-2">Verification Status</h3>
                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="text-sm text-slate-600">
                              This user has not submitted any verification documents yet. You can approve or reject their registration directly.
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4 border-t border-slate-200">
                      <Button
                        onClick={() => handleApprove(selectedUser.userId)}
                        disabled={isProcessing}
                        className="flex-1 bg-secondary-600 hover:bg-secondary-700"
                      >
                        Approve Verification
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(selectedUser)}
                        disabled={isProcessing}
                        variant="destructive"
                        className="flex-1"
                      >
                        Reject Application
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-12">
                    <p className="text-slate-600">Select a user from the queue to review their verification</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-md w-full p-6">
            <h3 className="text-3xl font-bold text-slate-900 mb-6">Reject Verification</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Please provide a reason for rejecting this verification request. This reason will be sent to the user.
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
    </DashboardLayout>
  );
};

export default AdminVerificationQueue;





