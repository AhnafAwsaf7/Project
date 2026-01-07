import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import PitchModal from '../components/PitchModal';

const BrowseCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showPitchModal, setShowPitchModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/active');
      if (response.data.success) {
        setCampaigns(response.data.data.campaigns);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handlePitchClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowPitchModal(true);
  };

  const handlePitchSubmitted = () => {
    setShowPitchModal(false);
    setSelectedCampaign(null);
    fetchCampaigns(); // Refresh to show updated status
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-900">Browse Campaigns</h1>
          <p className="mt-2 text-gray-600">Find and pitch to active funding opportunities</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No active campaigns</h3>
            <p className="text-gray-600">There are currently no open funding campaigns</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                  {campaign.investor?.profile?.investorData?.companyName && (
                    <p className="text-sm text-gray-600 mb-2">
                      by {campaign.investor.profile.investorData.companyName}
                    </p>
                  )}
                  {campaign.description && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{campaign.description}</p>
                  )}
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Amount:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(campaign.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-semibold text-gray-900">{campaign.durationDays} days</span>
                  </div>
                  {campaign.industryFocus && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Industry:</span>
                      <span className="font-semibold text-gray-900">{campaign.industryFocus}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handlePitchClick(campaign)}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  View & Pitch
                </button>
              </div>
            ))}
          </div>
        )}

        {showPitchModal && selectedCampaign && (
          <PitchModal
            campaign={selectedCampaign}
            onClose={() => {
              setShowPitchModal(false);
              setSelectedCampaign(null);
            }}
            onSubmitted={handlePitchSubmitted}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrowseCampaigns;








