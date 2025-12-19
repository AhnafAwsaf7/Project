import { useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import Button from './Button';

const PitchModal = ({ campaign, onClose, onSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    pitchDeck: null,
  });

  const handleChange = (e) => {
    if (e.target.name === 'pitchDeck') {
      setFormData({
        ...formData,
        pitchDeck: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('campaignId', campaign._id);
      formDataToSend.append('message', formData.message);
      if (formData.pitchDeck) {
        formDataToSend.append('pitchDeck', formData.pitchDeck);
      }

      const response = await api.post('/pitches', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Pitch submitted successfully!');
        onSubmitted();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit pitch';
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Submit Pitch</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">{campaign.title}</h3>
            {campaign.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{campaign.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                placeholder="Tell the investor about your startup, why you're a good fit, and what you're looking for..."
              />
            </div>

            <div>
              <label htmlFor="pitchDeck" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Pitch Deck (Optional)
              </label>
              <input
                type="file"
                id="pitchDeck"
                name="pitchDeck"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-600">
                Accepted formats: PDF, PPT, PPTX, DOC, DOCX (Max 10MB)
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Pitch'}
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

export default PitchModal;


