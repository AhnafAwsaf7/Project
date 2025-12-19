import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on role
    if (user?.role === 'ADMIN') {
      navigate('/dashboard/admin');
    } else if (user?.role === 'INVESTOR') {
      navigate('/dashboard/investor');
    } else if (user?.role === 'MENTOR') {
      navigate('/dashboard/mentor');
    } else if (user?.role === 'ENTREPRENEUR') {
      navigate('/dashboard/entrepreneur');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">StartupConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Role: <span className="font-semibold">{user?.role}</span></p>
              <p className="text-gray-600">Email: <span className="font-semibold">{user?.email}</span></p>
              <p className="text-gray-600">
                Status: <span className="font-semibold">{user?.isVerified ? 'Verified' : 'Pending Verification'}</span>
              </p>
            </div>
            <p className="text-gray-500">Redirecting to your role-specific dashboard...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

