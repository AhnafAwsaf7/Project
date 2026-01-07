import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const MyMentorships = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mentorship/requests/my');
      if (response.data.success) {
        setRequests(response.data.data.requests);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load mentorship requests');
    } finally {
      setLoading(false);
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
      <DashboardLayout role="ENTREPRENEUR">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ENTREPRENEUR">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Mentorships</h1>
          <p className="mt-2 text-gray-600">Track your mentorship requests and sessions</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">🤝</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentorship requests yet</h3>
            <p className="text-gray-600 mb-6">Start finding mentors and send your first request</p>
            <a
              href="/dashboard/entrepreneur/mentors"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Find Mentors
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {request.mentor?.name || 'Unknown Mentor'}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    {request.mentor?.profile?.mentorData?.specialization && (
                      <p className="text-sm text-gray-600 mb-2">
                        {request.mentor.profile.mentorData.specialization}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
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
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Scheduled Session:</p>
                    <p className="text-sm text-blue-800">
                      {new Date(request.scheduledDate).toLocaleString()}
                    </p>
                  </div>
                )}

                {request.sessionNotes && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-1">Session Notes:</p>
                    <p className="text-sm text-green-800">{request.sessionNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyMentorships;








