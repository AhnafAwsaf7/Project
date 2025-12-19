import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const MentorOverview = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.name || 'Mentor'}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">📨</span>
              </div>
            </div>
            <Link
              to="/dashboard/mentor/requests"
              className="mt-4 inline-block text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <Link
              to="/dashboard/mentor/sessions"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/dashboard/mentor/requests"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">📨</span>
              <div>
                <h3 className="font-semibold text-gray-900">Review Requests</h3>
                <p className="text-sm text-gray-600">View and respond to mentorship requests</p>
              </div>
            </Link>
            <Link
              to="/dashboard/mentor/sessions"
              className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-3xl">📅</span>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Sessions</h3>
                <p className="text-sm text-gray-600">Schedule and manage upcoming mentorship sessions</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Profile Completion */}
        {(!user?.profile?.bio || !user?.profile?.mentorData?.specialization) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Complete your mentor profile to help entrepreneurs find you.
                </p>
                <Link
                  to="/profile/edit"
                  className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                >
                  Complete Profile →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorOverview;






