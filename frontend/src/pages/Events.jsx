import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [engagementScores, setEngagementScores] = useState({});
  const [engagementSubmitting, setEngagementSubmitting] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      if (response.data.success) {
        setEvents(response.data.data.events);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      if (response.data.success) {
        toast.success('Registered for event successfully!');
        fetchEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleJoin = async (event) => {
    try {
      const response = await api.post(`/events/${event._id}/join`);
      if (response.data.success) {
        // Redirect to meeting link
        window.open(response.data.data.meetingLink, '_blank');
        fetchEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join event');
    }
  };

  const handleEngagementChange = (eventId, value) => {
    setEngagementScores((prev) => ({
      ...prev,
      [eventId]: value,
    }));
  };

  const handleEngagementSubmit = async (eventId) => {
    const score = parseInt(engagementScores[eventId], 10);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      toast.error('Engagement score must be between 0 and 100');
      return;
    }

    setEngagementSubmitting(eventId);
    try {
      const response = await api.patch(`/events/${eventId}/engagement`, {
        engagementScore: score,
      });
      if (response.data.success) {
        toast.success('Engagement score submitted');
        fetchEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit engagement');
    } finally {
      setEngagementSubmitting(null);
    }
  };

  const canJoin = (event) => {
    const now = new Date();
    const tenMinutesBefore = new Date(new Date(event.scheduledAt).getTime() - 10 * 60 * 1000);
    const eventEnd = new Date(
      new Date(event.scheduledAt).getTime() + event.durationMinutes * 60 * 1000
    );
    return now >= tenMinutesBefore && now <= eventEnd;
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Virtual Pitch Events</h1>
          <p className="text-sm text-slate-600 leading-relaxed">Join upcoming virtual pitch events and network with the community</p>
        </div>

        {events.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📅</span>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No upcoming events</h3>
              <p className="text-slate-600">There are currently no scheduled events</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.scheduledAt);
              const canJoinEvent = canJoin(event);
              const isRegistered = event.isRegistered;

              return (
                <Card key={event._id} hoverable>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">{event.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-slate-600">
                      <span className="mr-2">📅</span>
                      <span>{eventDate.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <span className="mr-2">⏱️</span>
                      <span>{event.durationMinutes} minutes</span>
                    </div>
                    {event.createdBy && (
                      <div className="flex items-center text-slate-600">
                        <span className="mr-2">👤</span>
                        <span>Hosted by {event.createdBy.name}</span>
                      </div>
                    )}
                    {event.meetingLink && (
                      <div className="flex items-center text-slate-600">
                        <span className="mr-2">Link</span>
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:text-primary-700 break-all"
                        >
                          {event.meetingLink}
                        </a>
                      </div>
                    )}
                  </div>

                  {event.userStatus === 'ATTENDED' && (
                    <div className="mb-4">
                      {event.engagementScore !== null && event.engagementScore !== undefined ? (
                        <div className="text-sm text-slate-700">
                          Engagement score: <span className="font-semibold">{event.engagementScore}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={engagementScores[event._id] || ''}
                            onChange={(e) => handleEngagementChange(event._id, e.target.value)}
                            className="flex-1 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                            placeholder="Engagement (0-100)"
                          />
                          <Button
                            onClick={() => handleEngagementSubmit(event._id)}
                            disabled={engagementSubmitting === event._id}
                            className="bg-secondary-600 hover:bg-secondary-700"
                          >
                            {engagementSubmitting === event._id ? 'Submitting...' : 'Submit'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {!isRegistered && !canJoinEvent && (
                      <Button
                        onClick={() => handleRegister(event._id)}
                        className="flex-1"
                      >
                        Register
                      </Button>
                    )}
                    {isRegistered && !canJoinEvent && (
                      <Button
                        disabled
                        variant="secondary"
                        className="flex-1 opacity-50 cursor-not-allowed"
                      >
                        Registered
                      </Button>
                    )}
                    {canJoinEvent && (
                      <Button
                        onClick={() => handleJoin(event)}
                        className="flex-1 bg-secondary-600 hover:bg-secondary-700"
                      >
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;


