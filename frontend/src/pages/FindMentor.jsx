import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import MentorshipRequestModal from '../components/MentorshipRequestModal';
import ConnectModal from '../components/ConnectModal';

const FindMentor = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectUser, setConnectUser] = useState(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mentorship/mentors');
      if (response.data.success) {
        setMentors(response.data.data.mentors);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = (mentor) => {
    setSelectedMentor(mentor);
    setShowRequestModal(true);
  };

  const handleRequestSubmitted = () => {
    setShowRequestModal(false);
    setSelectedMentor(null);
  };

  if (loading) {
    return (
      <DashboardLayout role="ENTREPRENEUR">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ENTREPRENEUR">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find a Mentor</h1>
          <p className="mt-2 text-gray-600">Connect with experienced mentors in your industry</p>
        </div>

        {mentors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl mb-4 block">👥</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors available</h3>
            <p className="text-gray-600">There are currently no mentors on the platform</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {mentor.name || mentor.email || 'Unknown Mentor'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{mentor.email || 'Email not available'}</p>
                  {mentor.profile?.mentorData?.specialization && (
                    <p className="text-sm font-medium text-primary-600 mb-2">
                      {mentor.profile.mentorData.specialization}
                    </p>
                  )}
                  {mentor.profile?.bio && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{mentor.profile.bio}</p>
                  )}
                </div>

                {mentor.profile?.mentorData?.expertiseAreas && mentor.profile.mentorData.expertiseAreas.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.profile.mentorData.expertiseAreas.slice(0, 3).map((area, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mentor.profile?.mentorData?.yearsExperience && (
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-medium">Experience:</span> {mentor.profile.mentorData.yearsExperience} years
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRequestClick(mentor)}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Request Mentorship
                  </button>
                  <button
                    onClick={() => {
                      setConnectUser(mentor);
                      setShowConnectModal(true);
                    }}
                    className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium"
                    title="Connect"
                  >
                    👥
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showRequestModal && selectedMentor && (
          <MentorshipRequestModal
            mentor={selectedMentor}
            onClose={() => {
              setShowRequestModal(false);
              setSelectedMentor(null);
            }}
            onSubmitted={handleRequestSubmitted}
          />
        )}

        {showConnectModal && connectUser && (
          <ConnectModal
            user={connectUser}
            onClose={() => {
              setShowConnectModal(false);
              setConnectUser(null);
            }}
            onSubmitted={() => {
              setShowConnectModal(false);
              setConnectUser(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindMentor;
