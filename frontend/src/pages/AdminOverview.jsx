import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const AdminOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    activeMentorships: 0,
    activeCampaigns: 0,
  });
  const [analytics, setAnalytics] = useState({
    totalByRole: [],
    verificationByRole: [],
    last30Days: [],
  });
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get('/admin/analytics/registrations');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch registration analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const roleCounts = analytics.totalByRole.reduce((acc, entry) => {
    acc[entry._id] = entry.count;
    return acc;
  }, {});

  const verificationByRole = analytics.verificationByRole.reduce((acc, entry) => {
    const role = entry._id?.role || 'UNKNOWN';
    const status = entry._id?.verificationStatus || 'UNKNOWN';
    acc[role] = acc[role] || {};
    acc[role][status] = entry.count;
    return acc;
  }, {});

  const dailyTotals = analytics.last30Days.reduce((acc, entry) => {
    const day = entry._id?.day;
    if (!day) return acc;
    acc[day] = (acc[day] || 0) + entry.count;
    return acc;
  }, {});

  const dailyEntries = Object.entries(dailyTotals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14);
  const maxDaily = dailyEntries.reduce((max, [, count]) => Math.max(max, count), 0) || 1;

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.name || 'Admin'}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <Link
              to="/dashboard/admin/users"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.pendingVerifications}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <Link
              to="/dashboard/admin/verifications"
              className="mt-4 inline-block text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Review →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Mentorships</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.activeMentorships}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
            <Link
              to="/dashboard/admin/mentorship-monitoring"
              className="mt-4 inline-block text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Monitor →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.activeCampaigns}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">💼</span>
              </div>
            </div>
          </div>
        </div>


        {/* Registration Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Registration Analytics</h2>
            {analyticsLoading && <span className="text-sm text-gray-500">Loading...</span>}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Total by Role</h3>
              {Object.keys(roleCounts).length === 0 ? (
                <p className="text-sm text-gray-500">No data</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(roleCounts).map(([role, count]) => (
                    <div key={role}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{role}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded">
                        <div
                          className="h-2 bg-primary-600 rounded"
                          style={{
                            width: `${Math.min(100, (count / Math.max(...Object.values(roleCounts))) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Verification by Role</h3>
              {Object.keys(verificationByRole).length === 0 ? (
                <p className="text-sm text-gray-500">No data</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(verificationByRole).map(([role, statuses]) => (
                    <div key={role} className="text-xs text-gray-600">
                      <div className="font-semibold text-gray-700 mb-1">{role}</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(statuses).map(([status, count]) => (
                          <span key={status} className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                            {status}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Last 14 Days</h3>
              {dailyEntries.length === 0 ? (
                <p className="text-sm text-gray-500">No data</p>
              ) : (
                <div className="space-y-2">
                  {dailyEntries.map(([day, count]) => (
                    <div key={day}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{day}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded">
                        <div
                          className="h-2 bg-secondary-600 rounded"
                          style={{ width: `${(count / maxDaily) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/dashboard/admin/users"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">👥</span>
              <div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage platform users and permissions</p>
              </div>
            </Link>
            <Link
              to="/dashboard/admin/verifications"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">✅</span>
              <div>
                <h3 className="font-semibold text-gray-900">Verification Queue</h3>
                <p className="text-sm text-gray-600">Review and approve user verifications</p>
              </div>
            </Link>
            <Link
              to="/dashboard/admin/mentorship-monitoring"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">📈</span>
              <div>
                <h3 className="font-semibold text-gray-900">Mentorship Monitoring</h3>
                <p className="text-sm text-gray-600">Monitor mentorship activity and engagement</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminOverview;








