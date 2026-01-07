import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const ReviewPitches = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pitchesLoading, setPitchesLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchPitches(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/my');
      if (response.data.success) {
        const campaignsData = response.data.data.campaigns;
        setCampaigns(campaignsData);
        if (campaignsData.length > 0) {
          setSelectedCampaign(campaignsData[0]._id);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchPitches = async (campaignId) => {
    try {
      setPitchesLoading(true);
      const response = await api.get(`/campaigns/${campaignId}/pitches`);
      if (response.data.success) {
        setPitches(response.data.data.pitches);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load pitches');
    } finally {
      setPitchesLoading(false);
    }
  };

  const updatePitchStatus = async (pitchId, status, reviewNotes = '') => {
    try {
      const response = await api.patch(`/pitches/${pitchId}/status`, { status, reviewNotes });
      if (response.data.success) {
        toast.success('Pitch status updated');
        fetchPitches(selectedCampaign);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pitch status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      REVIEWED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Reviewed' },
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
      <DashboardLayout role="INVESTOR">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="INVESTOR">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Pitches</h1>
          <p className="mt-2 text-gray-600">Review and evaluate pitches from entrepreneurs</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Create a campaign to start receiving pitches</p>
            <Link
              to="/dashboard/investor/campaigns/create"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Campaign List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-900 mb-4">Select Campaign</h2>
                <div className="space-y-2">
                  {campaigns.map((campaign) => (
                    <button
                      key={campaign._id}
                      onClick={() => setSelectedCampaign(campaign._id)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCampaign === campaign._id
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {campaign.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pitches List */}
            <div className="lg:col-span-3">
              {pitchesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : pitches.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <span className="text-6xl mb-4 block">📝</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No pitches yet</h3>
                  <p className="text-gray-600">No entrepreneurs have submitted pitches to this campaign</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pitches.map((pitch) => (
                    <div key={pitch._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {pitch.entrepreneur?.name || 'Unknown'}
                            </h3>
                            {getStatusBadge(pitch.status)}
                          </div>
                          {pitch.entrepreneur?.profile?.entrepreneurData?.startupName && (
                            <p className="text-sm text-gray-600">
                              {pitch.entrepreneur.profile.entrepreneurData.startupName}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted: {new Date(pitch.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {pitch.message && (
                        <div className="mb-4">
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
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Review Notes:</p>
                          <p className="text-sm text-gray-600">{pitch.reviewNotes}</p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        {pitch.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updatePitchStatus(pitch._id, 'REVIEWED')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              Mark as Reviewed
                            </button>
                            <button
                              onClick={() => updatePitchStatus(pitch._id, 'FUNDED')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                            >
                              Mark as Funded
                            </button>
                            <button
                              onClick={() => updatePitchStatus(pitch._id, 'REJECTED')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {pitch.status === 'REVIEWED' && (
                          <>
                            <button
                              onClick={() => updatePitchStatus(pitch._id, 'FUNDED')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                            >
                              Mark as Funded
                            </button>
                            <button
                              onClick={() => updatePitchStatus(pitch._id, 'REJECTED')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewPitches;

