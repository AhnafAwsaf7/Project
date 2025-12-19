import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, User } from 'lucide-react';

const LandingNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDashboardRedirect = () => {
    if (!user) return;
    const role = user.role.toLowerCase();
    navigate(`/dashboard/${role}/overview`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-success-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-slate-900">
              StartupConnect
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="#features"
              className="text-slate-600 hover:text-primary-600 transition-colors font-medium"
            >
              How it Works
            </Link>
            <Link
              to="#features"
              className="text-slate-600 hover:text-primary-600 transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              to="#success-stories"
              className="text-slate-600 hover:text-primary-600 transition-colors font-medium"
            >
              Success Stories
            </Link>
            <Link
              to="/events"
              className="text-slate-600 hover:text-primary-600 transition-colors font-medium"
            >
              Events
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-600 font-medium">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                      <button
                        onClick={handleDashboardRedirect}
                        className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Go to Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors shadow-md"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200 mt-2">
            <div className="flex flex-col space-y-2 pt-4">
              <Link
                to="#features"
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link
                to="#features"
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="#success-stories"
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Success Stories
              </Link>
              <Link
                to="/events"
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Events
              </Link>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      handleDashboardRedirect();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-left text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 text-left text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNavbar;

