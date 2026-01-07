import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import VerificationStatusCard from '../components/VerificationStatusCard';

const RoleDashboard = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== role) {
    return null;
  }

  const getVerificationBadge = () => {
    if (user.verificationStatus === 'VERIFIED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Verified
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-primary-600">StartupConnect</h1>
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile/edit"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Edit Profile
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/verification-queue"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Verification Queue
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">{user.name || user.email}</span>
                {getVerificationBadge()}
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {role === 'ENTREPRENEUR' && 'Entrepreneur Dashboard'}
            {role === 'INVESTOR' && 'Investor Dashboard'}
            {role === 'MENTOR' && 'Mentor Dashboard'}
            {role === 'ADMIN' && 'Admin Dashboard'}
          </h2>
        </div>

        {/* Verification Status Card - Only for Entrepreneurs and Investors */}
        {(role === 'ENTREPRENEUR' || role === 'INVESTOR') && (
          <div className="mb-6">
            <VerificationStatusCard />
          </div>
        )}

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Status</h3>
            <p className="text-sm text-gray-600">
              {user.profile?.bio ? 'Profile completed' : 'Complete your profile to get started'}
            </p>
            <Link
              to="/profile/edit"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Edit Profile →
            </Link>
          </div>

          {role === 'ENTREPRENEUR' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Pitches</h3>
                <p className="text-sm text-gray-600">View and manage your funding pitches</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Mentors</h3>
                <p className="text-sm text-gray-600">Connect with experienced mentors</p>
              </div>
            </>
          )}

          {role === 'INVESTOR' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">My Campaigns</h3>
                <p className="text-sm text-gray-600">Manage your funding campaigns</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Pitches</h3>
                <p className="text-sm text-gray-600">Review pitches from entrepreneurs</p>
              </div>
            </>
          )}

          {role === 'MENTOR' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mentorship Requests</h3>
                <p className="text-sm text-gray-600">View pending mentorship requests</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Sessions</h3>
                <p className="text-sm text-gray-600">Manage your scheduled sessions</p>
              </div>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Queue</h3>
                <p className="text-sm text-gray-600">Review pending verifications</p>
                <Link
                  to="/admin/verification-queue"
                  className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Queue →
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                <p className="text-sm text-gray-600">Manage platform users</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-sm text-gray-600">View platform analytics</p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoleDashboard;





