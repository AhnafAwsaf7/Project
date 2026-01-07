import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const MyPitches = () => {
  const { user } = useAuth();
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure only entrepreneurs can access this page
  if (user?.role !== 'ENTREPRENEUR') {
    return <Navigate to="/unauthorized" replace />;
  }

  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pitches/my');
      if (response.data.success) {
        setPitches(response.data.data.pitches);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load pitches');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review' },
      REVIEWED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
      FUNDED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Funded' },
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
          <h1 className="text-3xl font-bold text-gray-900">My Pitches</h1>
          <p className="mt-2 text-gray-600">Track the status of your funding pitches</p>
        </div>

        {pitches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pitches yet</h3>
            <p className="text-gray-600 mb-6">Start browsing campaigns and submit your first pitch</p>
            <a
              href="/dashboard/entrepreneur/campaigns"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Browse Campaigns
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {pitches.map((pitch) => (
              <div key={pitch._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {pitch.campaign?.title || 'Unknown Campaign'}
                      </h3>
                      {getStatusBadge(pitch.status)}
                    </div>
                    {pitch.campaign?.investor && (
                      <p className="text-sm text-gray-600 mb-2">
                        Investor: {pitch.campaign.investor.name || pitch.campaign.investor.email}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(pitch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {pitch.message && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{pitch.message}</p>
                  </div>
                )}

                      {pitch.pitchDeckUrl && (
                        <div className="mb-4">
                          <a
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${pitch.pitchDeckUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                          >
                            📄 View Pitch Deck
                          </a>
                        </div>
                      )}

                {pitch.reviewNotes && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Investor Notes:</p>
                    <p className="text-sm text-blue-800">{pitch.reviewNotes}</p>
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

export default MyPitches;

