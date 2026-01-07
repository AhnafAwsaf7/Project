import { useState, useEffect } from 'react';



import { Link } from 'react-router-dom';



import DashboardLayout from '../components/DashboardLayout';



import { useAuth } from '../context/AuthContext';



import api from '../utils/axios';







const MentorOverview = () => {



  const { user } = useAuth();



  const [stats, setStats] = useState({



    pendingRequests: 0,



    upcomingSessions: 0,



    totalMentees: 0,



  });



  const [mentees, setMentees] = useState([]);



  const [loading, setLoading] = useState(true);



  const [menteesLoading, setMenteesLoading] = useState(true);



  const [showMentees, setShowMentees] = useState(false);







  useEffect(() => {



    fetchStats();



    fetchMentees();



  }, []);







  const fetchStats = async () => {



    try {



      setLoading(true);



      const response = await api.get('/mentorship/stats');



      if (response.data.success) {



        setStats(response.data.data);



      }



    } catch (error) {



      console.error('Failed to fetch mentor stats:', error);



    } finally {



      setLoading(false);



    }



  };







  const fetchMentees = async () => {



    try {



      setMenteesLoading(true);



      const response = await api.get('/mentorship/requests/incoming');



      if (response.data.success) {



        const requests = response.data.data.requests || [];



        const activeStatuses = new Set(['ACCEPTED', 'SCHEDULED', 'COMPLETED']);



        const unique = new Map();



        requests.forEach((request) => {



          if (!activeStatuses.has(request.status)) return;



          const entrepreneur = request.entrepreneur;



          if (entrepreneur && entrepreneur._id && !unique.has(entrepreneur._id)) {



            unique.set(entrepreneur._id, entrepreneur);



          }



        });



        setMentees(Array.from(unique.values()));



      }



    } catch (error) {



      console.error('Failed to fetch mentees:', error);



    } finally {



      setMenteesLoading(false);



    }



  };







  const handleMenteesClick = () => {



    setShowMentees(true);



    const section = document.getElementById('mentor-mentees');



    if (section) {



      section.scrollIntoView({ behavior: 'smooth' });



    }



  };







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



                <p className="mt-2 text-3xl font-bold text-gray-900">



                  {loading ? '...' : stats.pendingRequests}



                </p>



              </div>



              <div className="p-3 bg-yellow-100 rounded-full">



                <span className="text-sm font-semibold">REQ</span>



              </div>



            </div>



            <Link



              to="/dashboard/mentor/requests"



              className="mt-4 inline-block text-sm text-yellow-600 hover:text-yellow-700 font-medium"



            >



              View all ->



            </Link>



          </div>







          <div className="bg-white rounded-lg shadow p-6">



            <div className="flex items-center justify-between">



              <div>



                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>



                <p className="mt-2 text-3xl font-bold text-gray-900">



                  {loading ? '...' : stats.upcomingSessions}



                </p>



              </div>



              <div className="p-3 bg-blue-100 rounded-full">



                <span className="text-sm font-semibold">CAL</span>



              </div>



            </div>



            <Link



              to="/dashboard/mentor/sessions"



              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"



            >



              View all ->



            </Link>



          </div>







          <button



            type="button"



            onClick={handleMenteesClick}



            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"



          >



            <div className="flex items-center justify-between">



              <div>



                <p className="text-sm font-medium text-gray-600">Total Mentees</p>



                <p className="mt-2 text-3xl font-bold text-gray-900">



                  {loading ? '...' : stats.totalMentees}



                </p>



              </div>



              <div className="p-3 bg-green-100 rounded-full">



                <span className="text-sm font-semibold">TEAM</span>



              </div>



            </div>



            <p className="mt-4 text-sm text-green-600 font-medium">View all -></p>



          </button>



        </div>










        {/* Quick Actions */}



        <div className="bg-white rounded-lg shadow p-6">



          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>



          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">



            <Link



              to="/dashboard/mentor/requests"



              className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"



            >



              <span className="text-sm font-semibold">REQ</span>



              <div>



                <h3 className="font-semibold text-gray-900">Review Requests</h3>



                <p className="text-sm text-gray-600">View and respond to mentorship requests</p>



              </div>



            </Link>



            <Link



              to="/dashboard/mentor/sessions"



              className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"



            >



              <span className="text-sm font-semibold">CAL</span>



              <div>



                <h3 className="font-semibold text-gray-900">Manage Sessions</h3>



                <p className="text-sm text-gray-600">Schedule and manage upcoming mentorship sessions</p>



              </div>



            </Link>



          </div>



        </div>







        {/* Mentees */}



        <div id="mentor-mentees" className="bg-white rounded-lg shadow p-6">



          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Mentees</h2>



          {menteesLoading ? (



            <p className="text-sm text-gray-500">Loading...</p>



          ) : mentees.length === 0 ? (



            <p className="text-sm text-gray-600">No active mentees yet.</p>



          ) : showMentees ? (



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">



              {mentees.map((mentee) => (



                <div key={mentee._id} className="border border-slate-200 rounded-lg p-4">



                  <p className="font-semibold text-slate-900">



                    {mentee.name || mentee.email || 'Unknown Entrepreneur'}



                  </p>



                  {mentee.email && <p className="text-sm text-slate-600">{mentee.email}</p>}



                  {mentee.profile?.entrepreneurData?.startupName && (



                    <p className="text-sm text-slate-600 mt-1">



                      {mentee.profile.entrepreneurData.startupName}



                    </p>



                  )}



                </div>



              ))}



            </div>



          ) : (



            <button



              type="button"



              onClick={handleMenteesClick}



              className="text-sm text-primary-600 hover:text-primary-700 font-medium"



            >



              Show mentees



            </button>



          )}



        </div>







        {/* Profile Completion */}



        {(!user?.profile?.bio || !user?.profile?.mentorData?.specialization) && (



          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">



            <div className="flex items-start">



              <span className="text-sm font-semibold mr-3">NOTE</span>



              <div className="flex-1">



                <h3 className="font-semibold text-yellow-900 mb-2">Complete Your Profile</h3>



                <p className="text-sm text-yellow-800 mb-4">



                  Complete your mentor profile to help entrepreneurs find you.



                </p>



                <Link



                  to="/profile/edit"



                  className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"



                >



                  Complete Profile ->



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



































