import { useState } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import Button from './Button';

const ConnectModal = ({ user, onClose, onSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'PARTNERSHIP_INQUIRY',
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
      const response = await api.post('/networking/request', {
        toUserId: user._id,
        type: formData.type,
        message: formData.message,
      });

      if (response.data.success) {
        toast.success('Request sent successfully!');
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Connect with {user.name}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="type" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Request Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2 bg-white"
              >
                <option value="PARTNERSHIP_INQUIRY">Partnership Inquiry</option>
                <option value="FUNDING_INQUIRY">Funding Inquiry</option>
              </select>
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
                placeholder="Introduce yourself and explain why you'd like to connect..."
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

export default ConnectModal;


