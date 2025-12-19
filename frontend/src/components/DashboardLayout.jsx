import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const DashboardLayout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getNavItems = () => {
    switch (role) {
      case 'ENTREPRENEUR':
        return [
          { path: '/dashboard/entrepreneur/overview', label: 'Overview', icon: '📊' },
          { path: '/dashboard/entrepreneur/campaigns', label: 'Browse Campaigns', icon: '🔍' },
          { path: '/dashboard/entrepreneur/my-pitches', label: 'My Pitches', icon: '📝' },
          { path: '/dashboard/entrepreneur/mentors', label: 'Find a Mentor', icon: '👥' },
          { path: '/dashboard/entrepreneur/my-mentorships', label: 'My Mentorships', icon: '🤝' },
        ];
      case 'INVESTOR':
        return [
          { path: '/dashboard/investor/overview', label: 'Overview', icon: '📊' },
          { path: '/dashboard/investor/my-campaigns', label: 'My Campaigns', icon: '💼' },
          { path: '/dashboard/investor/review-pitches', label: 'Review Pitches', icon: '📋' },
        ];
      case 'MENTOR':
        return [
          { path: '/dashboard/mentor/overview', label: 'Overview', icon: '📊' },
          { path: '/dashboard/mentor/requests', label: 'Mentorship Requests', icon: '📨' },
          { path: '/dashboard/mentor/sessions', label: 'Upcoming Sessions', icon: '📅' },
        ];
      case 'ADMIN':
        return [
          { path: '/dashboard/admin/overview', label: 'Overview', icon: '📊' },
          { path: '/dashboard/admin/users', label: 'User Management', icon: '👥' },
          { path: '/dashboard/admin/verifications', label: 'Verification Queue', icon: '✅' },
          { path: '/dashboard/admin/mentorship-monitoring', label: 'Mentorship Monitoring', icon: '📈' },
          { path: '/dashboard/admin/events', label: 'Event Management', icon: '📅' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
                StartupConnect
              </Link>
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/events"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Events
                </Link>
                <Link
                  to="/dashboard/network"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Network
                </Link>
                <Link
                  to="/profile/edit"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/verification-queue"
                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Verification Queue
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-2">
                <span className="text-slate-600 text-sm">{user?.name || user?.email}</span>
                {user?.verificationStatus === 'VERIFIED' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Verified
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-4 py-2 text-danger-600 hover:text-danger-700 text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white h-screen fixed">
          <nav className="p-4 space-y-2 pt-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white border-l-4 border-primary-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 bg-slate-50 min-h-screen p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

