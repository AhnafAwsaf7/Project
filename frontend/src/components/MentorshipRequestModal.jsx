import { useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import Button from './Button';

const MentorshipRequestModal = ({ mentor, onClose, onSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    message: '',
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
      const response = await api.post('/mentorship/request', {
        mentorId: mentor._id,
        topic: formData.topic,
        message: formData.message,
      });

      if (response.data.success) {
        toast.success('Mentorship request sent successfully!');
        onSubmitted();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send request';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Request Mentorship</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">Mentor: {mentor.name}</h3>
            {mentor.profile?.mentorData?.specialization && (
              <p className="text-sm text-slate-600 leading-relaxed">{mentor.profile.mentorData.specialization}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Topic / Area of Focus *
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                required
                value={formData.topic}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                placeholder="e.g., Product Development, Fundraising Strategy, Market Entry"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                placeholder="Tell the mentor about your startup, what you're looking for, and why you think they'd be a good fit..."
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send Request'}
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

export default MentorshipRequestModal;


