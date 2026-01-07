import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const MentorSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mentorship/requests/incoming?status=SCHEDULED');
      if (response.data.success) {
        setSessions(response.data.data.requests);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Sessions</h1>
          <p className="mt-2 text-gray-600">Manage your scheduled mentorship sessions</p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">📅</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming sessions</h3>
            <p className="text-gray-600">You don't have any scheduled mentorship sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {session.entrepreneur?.name ||
                        session.entrepreneur?.email ||
                        'Unknown Entrepreneur'}
                    </h3>
                    {session.entrepreneur?.profile?.entrepreneurData?.startupName && (
                      <p className="text-sm text-gray-600 mb-2">
                        {session.entrepreneur.profile.entrepreneurData.startupName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Topic:</p>
                  <p className="text-gray-900">{session.topic}</p>
                </div>

                {session.scheduledDate && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Scheduled For:</p>
                    <p className="text-lg font-semibold text-blue-800">
                      {new Date(session.scheduledDate).toLocaleString()}
                    </p>
                  </div>
                )}

                {session.message && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.message}</p>
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

export default MentorSessions;








