import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import VerificationStatusCard from '../components/VerificationStatusCard';
import api from '../utils/axios';

const EntrepreneurOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activePitches: 0,
    activeMentorships: 0,
    availableCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [pitchesRes, mentorshipsRes, campaignsRes] = await Promise.all([
        api.get('/pitches/stats'),
        api.get('/mentorship/entrepreneur/stats'),
        api.get('/campaigns/stats/entrepreneur'),
      ]);

      if (pitchesRes.data.success) {
        setStats((prev) => ({ ...prev, activePitches: pitchesRes.data.data.activePitches }));
      }
      if (mentorshipsRes.data.success) {
        setStats((prev) => ({ ...prev, activeMentorships: mentorshipsRes.data.data.activeMentorships }));
      }
      if (campaignsRes.data.success) {
        setStats((prev) => ({ ...prev, availableCampaigns: campaignsRes.data.data.availableCampaigns }));
      }
    } catch (error) {
      console.error('Failed to fetch entrepreneur stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="ENTREPRENEUR">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Entrepreneur Dashboard</h1>
          <p className="text-sm text-slate-600 leading-relaxed">Welcome back, {user?.name || 'Entrepreneur'}!</p>
        </div>

        {/* Verification Status Card */}
        <VerificationStatusCard />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Pitches</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? '...' : stats.activePitches}
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <span className="text-2xl">📝</span>
              </div>
            </div>
            <Link
              to="/dashboard/entrepreneur/my-pitches"
              className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Mentorships</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? '...' : stats.activeMentorships}
                </p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
            <Link
              to="/dashboard/entrepreneur/my-mentorships"
              className="mt-4 inline-block text-sm text-secondary-600 hover:text-secondary-700 font-medium"
            >
              View all →
            </Link>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Available Campaigns</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? '...' : stats.availableCampaigns}
                </p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <span className="text-2xl">🔍</span>
              </div>
            </div>
            <Link
              to="/dashboard/entrepreneur/campaigns"
              className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Browse →
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/dashboard/entrepreneur/campaigns"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">💼</span>
              <div>
                <h3 className="font-semibold text-slate-900">Browse Funding Campaigns</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Find and pitch to active funding opportunities</p>
              </div>
            </Link>
            <Link
              to="/dashboard/entrepreneur/mentors"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">👥</span>
              <div>
                <h3 className="font-semibold text-slate-900">Find a Mentor</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Connect with experienced mentors in your industry</p>
              </div>
            </Link>
          </div>
        </Card>

        {/* Profile Completion */}
        {(!user?.profile?.bio || !user?.profile?.entrepreneurData?.startupName) && (
          <Card className="bg-accent-50 border-accent-200">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Complete your profile to unlock all features and increase your chances of success.
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

export default EntrepreneurOverview;


