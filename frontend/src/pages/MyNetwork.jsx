import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConnectModal from '../components/ConnectModal';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

const MyNetwork = () => {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchRequests();
    if (activeTab === 'browse') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get('/networking/requests/incoming'),
        api.get('/networking/requests/outgoing'),
      ]);

      if (incomingRes.data.success) {
        setIncomingRequests(incomingRes.data.data.requests);
      }
      if (outgoingRes.data.success) {
        setOutgoingRequests(outgoingRes.data.data.requests);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await api.patch(`/networking/requests/${requestId}/status`, {
        status: 'ACCEPTED',
      });
      if (response.data.success) {
        toast.success('Request accepted');
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const response = await api.patch(`/networking/requests/${requestId}/status`, {
        status: 'DECLINED',
      });
      if (response.data.success) {
        toast.success('Request declined');
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to decline request');
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/networking/users');
      if (response.data.success) {
        setUsers(response.data.data.users || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleConnectClick = (targetUser) => {
    setSelectedUser(targetUser);
    setShowConnectModal(true);
  };


  const getTypeLabel = (type) => {
    return type === 'FUNDING_INQUIRY' ? 'Funding Inquiry' : 'Partnership Inquiry';
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const requests = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  return (
    <DashboardLayout role={user?.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6">My Network</h1>
          <p className="text-sm text-slate-600 leading-relaxed">Manage your partnership and funding requests</p>
        </div>

        {/* Tabs */}
        <Card>
          <div className="flex space-x-4 flex-wrap">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'incoming'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Incoming Requests ({incomingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'outgoing'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sent Requests ({outgoingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Browse Users
            </button>
          </div>
        </Card>

        {/* Browse Users Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Search and Filter */}
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
                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2 bg-white"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ENTREPRENEUR">Entrepreneurs</option>
                    <option value="INVESTOR">Investors</option>
                    <option value="MENTOR">Mentors</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Users List */}
            {usersLoading ? (
              <Card>
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              </Card>
            ) : (
              <>
                {(() => {
                  const filteredUsers = users.filter((u) => {
                    const matchesSearch =
                      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
                    return matchesSearch && matchesRole && u._id !== user?._id;
                  });

                  return filteredUsers.length === 0 ? (
                    <Card>
                      <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">🔍</span>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No users found</h3>
                        <p className="text-slate-600">Try adjusting your search or filters</p>
                      </div>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredUsers.map((targetUser) => {
                        // Check if there's already a request with this user
                        const hasPendingRequest = outgoingRequests.some(
                          (req) =>
                            (req.toUserId?._id === targetUser._id || req.toUserId === targetUser._id) &&
                            req.status === 'PENDING'
                        );
                        const hasAcceptedRequest = outgoingRequests.some(
                          (req) =>
                            (req.toUserId?._id === targetUser._id || req.toUserId === targetUser._id) &&
                            req.status === 'ACCEPTED'
                        );

                        return (
                          <Card key={targetUser._id}>
                            <div className="flex flex-col">
                              <div className="mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                  {targetUser.name || 'Unknown User'}
                                </h3>
                                <p className="text-sm text-slate-600 mb-2">{targetUser.email}</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                  {targetUser.role}
                                </span>
                                {targetUser.profile?.bio && (
                                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                                    {targetUser.profile.bio}
                                  </p>
                                )}
                              </div>
                              <Button
                                onClick={() => handleConnectClick(targetUser)}
                                disabled={hasPendingRequest || hasAcceptedRequest}
                                className="w-full"
                                variant={hasAcceptedRequest ? 'secondary' : 'primary'}
                              >
                                {hasAcceptedRequest
                                  ? '✓ Connected'
                                  : hasPendingRequest
                                  ? 'Request Pending'
                                  : 'Send Request'}
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            )}
          </>
        )}

        {/* Requests List */}
        {activeTab !== 'browse' && requests.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No {activeTab === 'incoming' ? 'incoming' : 'sent'} requests
              </h3>
              <p className="text-slate-600">
                {activeTab === 'incoming'
                  ? "You don't have any pending requests"
                  : "You haven't sent any requests yet"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const otherUser = activeTab === 'incoming' ? request.fromUserId : request.toUserId;
              const statusMap = {
                PENDING: 'pending',
                ACCEPTED: 'verified',
                DECLINED: 'rejected',
              };
              return (
                <Card key={request._id}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">
                          {otherUser?.name || 'Unknown User'}
                        </h3>
                        <StatusBadge status={statusMap[request.status] || 'pending'} />
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{otherUser?.email}</p>
                      <p className="text-sm font-medium text-primary-600">
                        {getTypeLabel(request.type)}
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        {activeTab === 'incoming' ? 'Received' : 'Sent'}:{' '}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{request.message}</p>
                    </div>
                  )}

                  {activeTab === 'incoming' && request.status === 'PENDING' && (
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleAccept(request._id)}
                        className="bg-secondary-600 hover:bg-secondary-700"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDecline(request._id)}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {showConnectModal && selectedUser && (
          <ConnectModal
            user={selectedUser}
            onClose={() => {
              setShowConnectModal(false);
              setSelectedUser(null);
            }}
            onSubmitted={() => {
              setShowConnectModal(false);
              setSelectedUser(null);
              fetchRequests();
              if (activeTab === 'browse') {
                fetchUsers();
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyNetwork;



