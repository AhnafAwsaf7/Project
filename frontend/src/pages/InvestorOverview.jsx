import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import VerificationStatusCard from '../components/VerificationStatusCard';
import api from '../utils/axios';

const InvestorOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    pendingPitches: 0,
    totalFunded: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/stats/investor');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch investor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout role="INVESTOR">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Investor Dashboard</h1>
          <p className="text-sm text-slate-600 leading-relaxed">Welcome back, {user?.name || 'Investor'}!</p>
        </div>

        {/* Verification Status Card */}
        <VerificationStatusCard />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Campaigns</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? '...' : stats.activeCampaigns}
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <span className="text-2xl">💼</span>
              </div>
            </div>
            <Link
              to="/dashboard/investor/my-campaigns"
              className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Pitches</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? '...' : stats.pendingPitches}
                </p>
              </div>
              <div className="p-3 bg-accent-50 rounded-full">
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <Link
              to="/dashboard/investor/review-pitches"
              className="mt-4 inline-block text-sm text-accent-600 hover:text-accent-700 font-medium"
            >
              Review →
            </Link>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Funded</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? '...' : formatCurrency(stats.totalFunded)}
                </p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/dashboard/investor/my-campaigns"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">➕</span>
              <div>
                <h3 className="font-semibold text-slate-900">Create New Campaign</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Launch a new funding campaign to attract entrepreneurs</p>
              </div>
            </Link>
            <Link
              to="/dashboard/investor/review-pitches"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">📋</span>
              <div>
                <h3 className="font-semibold text-slate-900">Review Pitches</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Review and evaluate pitches from entrepreneurs</p>
              </div>
            </Link>
          </div>
        </Card>

        {/* Profile Completion */}
        {(!user?.profile?.bio || !user?.profile?.investorData?.companyName) && (
          <Card className="bg-accent-50 border-accent-200">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Complete your investor profile to build trust with entrepreneurs.
                </p>
                <Link
                  to="/profile/edit"
                  className="inline-block px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 text-sm font-medium transition-colors"
                >
                  Complete Profile →
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InvestorOverview;



