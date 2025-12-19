import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const AdminOverview = () => {
  const { user } = useAuth();

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
                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
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
                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
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
                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
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
                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">💼</span>
              </div>
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






