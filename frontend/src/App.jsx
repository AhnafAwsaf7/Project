import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import RoleDashboard from './pages/RoleDashboard';
import EntrepreneurOverview from './pages/EntrepreneurOverview';
import InvestorOverview from './pages/InvestorOverview';
import MentorOverview from './pages/MentorOverview';
import AdminOverview from './pages/AdminOverview';
import BrowseCampaigns from './pages/BrowseCampaigns';
import MyPitches from './pages/MyPitches';
import MyCampaigns from './pages/MyCampaigns';
import CreateCampaign from './pages/CreateCampaign';
import ReviewPitches from './pages/ReviewPitches';
import FindMentor from './pages/FindMentor';
import MyMentorships from './pages/MyMentorships';
import MentorRequests from './pages/MentorRequests';
import MentorSessions from './pages/MentorSessions';
import MentorshipMonitoring from './pages/MentorshipMonitoring';
import MyNetwork from './pages/MyNetwork';
import Events from './pages/Events';
import AdminEvents from './pages/AdminEvents';
import ProfileEdit from './pages/ProfileEdit';
import AdminVerificationQueue from './pages/AdminVerificationQueue';
import UserManagement from './pages/UserManagement';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Redirect old role dashboard routes to overview */}
            <Route
              path="/dashboard/entrepreneur"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/entrepreneur/overview" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/investor"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/investor/overview" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mentor"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/mentor/overview" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Navigate to="/dashboard/admin/overview" replace />
                </ProtectedRoute>
              }
            />
            
            {/* Entrepreneur Routes */}
            <Route
              path="/dashboard/entrepreneur/overview"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRENEUR']}>
                  <EntrepreneurOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/entrepreneur/campaigns"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRENEUR']}>
                  <BrowseCampaigns />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/entrepreneur/my-pitches"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRENEUR']}>
                  <MyPitches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/entrepreneur/mentors"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRENEUR']}>
                  <FindMentor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/entrepreneur/my-mentorships"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRENEUR']}>
                  <MyMentorships />
                </ProtectedRoute>
              }
            />
            
            {/* Investor Routes */}
            <Route
              path="/dashboard/investor/overview"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <InvestorOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/investor/my-campaigns"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <MyCampaigns />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/investor/campaigns/create"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <CreateCampaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/investor/review-pitches"
              element={
                <ProtectedRoute allowedRoles={['INVESTOR']}>
                  <ReviewPitches />
                </ProtectedRoute>
              }
            />
            
            {/* Mentor Routes */}
            <Route
              path="/dashboard/mentor/overview"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <MentorOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mentor/requests"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <MentorRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mentor/sessions"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <MentorSessions />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/dashboard/admin/overview"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/verifications"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminVerificationQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/mentorship-monitoring"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MentorshipMonitoring />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/events"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/network"
              element={
                <ProtectedRoute>
                  <MyNetwork />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verification-queue"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminVerificationQueue />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

