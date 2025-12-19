import { useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import Button from './Button';

const CreateEventModal = ({ onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    durationMinutes: '',
    meetingLink: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/events', {
        ...formData,
        durationMinutes: parseInt(formData.durationMinutes),
      });

      if (response.data.success) {
        toast.success('Event created successfully!');
        onCreated();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create event';
      const errors = error.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach((err) => toast.error(err.msg || err.message));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Create Virtual Pitch Event</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                placeholder="e.g., Q4 2024 Virtual Pitch Event"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                placeholder="Describe the event, agenda, and what participants can expect..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="scheduledAt" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="scheduledAt"
                  name="scheduledAt"
                  required
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="durationMinutes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  id="durationMinutes"
                  name="durationMinutes"
                  required
                  min="1"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="meetingLink" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Meeting Link (Zoom/Google Meet) *
              </label>
              <input
                type="url"
                id="meetingLink"
                name="meetingLink"
                required
                value={formData.meetingLink}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;


