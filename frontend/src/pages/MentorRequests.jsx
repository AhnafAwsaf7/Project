import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const MentorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mentorship/requests/incoming?status=${filter}`);
      if (response.data.success) {
        setRequests(response.data.data.requests);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await api.patch(`/mentorship/requests/${requestId}/accept`);
      if (response.data.success) {
        toast.success('Request accepted');
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await api.patch(`/mentorship/requests/${requestId}/reject`);
      if (response.data.success) {
        toast.success('Request rejected');
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleSchedule = async (requestId, scheduledDate) => {
    try {
      const response = await api.patch(`/mentorship/requests/${requestId}/schedule`, {
        scheduledDate,
      });
      if (response.data.success) {
        toast.success('Session scheduled');
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule session');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      ACCEPTED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Accepted' },
      SCHEDULED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Scheduled' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout role="MENTOR">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentorship Requests</h1>
          <p className="mt-2 text-gray-600">Review and manage mentorship requests from entrepreneurs</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4">
            {['PENDING', 'ACCEPTED', 'SCHEDULED', 'COMPLETED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">📨</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No {filter.toLowerCase()} requests</h3>
            <p className="text-gray-600">You don't have any {filter.toLowerCase()} mentorship requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.entrepreneur?.name ||
                          request.entrepreneur?.email ||
                          'Unknown Entrepreneur'}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    {request.entrepreneur?.profile?.entrepreneurData?.startupName && (
                      <p className="text-sm text-gray-600 mb-2">
                        {request.entrepreneur.profile.entrepreneurData.startupName}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Received: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Topic:</p>
                  <p className="text-gray-900">{request.topic}</p>
                </div>

                {request.message && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.message}</p>
                  </div>
                )}

                {request.scheduledDate && (
                  <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">📅</span>
                      <p className="text-sm font-semibold text-purple-900">Scheduled Session</p>
                    </div>
                    <p className="text-base font-medium text-purple-800">
                      {new Date(request.scheduledDate).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {new Date(request.scheduledDate) > new Date() ? (
                      <p className="text-xs text-purple-600 mt-1">
                        Upcoming session
                      </p>
                    ) : (
                      <p className="text-xs text-purple-600 mt-1">
                        Past session
                      </p>
                    )}
                  </div>
                )}

                <div className="flex space-x-3">
                  {request.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAccept(request._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === 'ACCEPTED' && (
                    <ScheduleSessionModal
                      requestId={request._id}
                      onSchedule={handleSchedule}
                    />
                  )}
                  {request.status === 'SCHEDULED' && request.scheduledDate && (
                    <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                      📅 Session scheduled for {new Date(request.scheduledDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Schedule Session Modal Component
const ScheduleSessionModal = ({ requestId, onSchedule }) => {
  const [showModal, setShowModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (scheduledDate) {
      onSchedule(requestId, scheduledDate);
      setShowModal(false);
      setScheduledDate('');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
      >
        Schedule Session
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Session</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MentorRequests;








