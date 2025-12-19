import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import Card from './Card';
import Button from './Button';
import StatusBadge from './StatusBadge';

const VerificationStatusCard = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('domain'); // 'domain' or 'document'
  const [domain, setDomain] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Only show for Entrepreneurs and Investors
  if (!user || !['ENTREPRENEUR', 'INVESTOR'].includes(user.role)) {
    return null;
  }

  const handleDomainSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/verification/submit-domain', { domain: domain.trim() });
      if (response.data.success) {
        toast.success(response.data.message);
        await refreshUser();
        setDomain('');
      }
    } catch (error) {
      // Show detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to submit domain. Please check the format (e.g., example.com)';
      toast.error(errorMessage);
      console.error('Domain submission error:', error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        toast.error('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', 'BUSINESS_LICENSE');

      const response = await api.post('/verification/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        await refreshUser();
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (user.verificationStatus) {
      case 'VERIFIED':
        return (
          <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'PENDING':
        return (
          <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'REJECTED':
        return (
          <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  const getStatusMessage = () => {
    switch (user.verificationStatus) {
      case 'VERIFIED':
        return 'Your account is verified.';
      case 'PENDING':
        return 'Verification in Progress. Our team is reviewing your submission. This usually takes 24-48 hours.';
      case 'REJECTED':
        return user.verificationRejectionReason
          ? `Verification Rejected: ${user.verificationRejectionReason}`
          : 'Verification Rejected. Please submit a new verification request.';
      default:
        return 'Get Verified to Unlock Features.';
    }
  };

  const statusColors = {
    VERIFIED: 'bg-secondary-100 border-secondary-200',
    PENDING: 'bg-accent-50 border-accent-200',
    REJECTED: 'bg-red-50 border-red-200',
    UNVERIFIED: 'bg-slate-50 border-slate-200',
  };

  return (
    <Card className={`${statusColors[user.verificationStatus] || statusColors.UNVERIFIED}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Verification Status</h3>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">{getStatusMessage()}</p>
          </div>
        </div>
        <StatusBadge status={user.verificationStatus?.toLowerCase() || 'unverified'} />
      </div>

      {(user.verificationStatus === 'UNVERIFIED' || user.verificationStatus === 'REJECTED') && (
        <div className="mt-4">
          <div className="flex border-b border-slate-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('domain')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'domain'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verify via Domain
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('document')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'document'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Document
            </button>
          </div>

          {activeTab === 'domain' ? (
            <form onSubmit={handleDomainSubmit} className="space-y-4">
              <div>
                <label htmlFor="domain" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Business Domain
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com or www.example.com"
                    className="flex-1 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-slate-600">Enter your business domain for verification</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Upload Document (PDF, JPG, PNG - Max 5MB)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="document" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                        <p className="text-xs text-slate-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg
                          className="mx-auto h-12 w-12 text-slate-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-sm text-slate-600">
                          Drag and drop a file here, or click to select
                        </p>
                        <p className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              {selectedFile && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Uploading...' : 'Submit for Review'}
                </Button>
              )}
            </form>
          )}
        </div>
      )}
    </Card>
  );
};

export default VerificationStatusCard;

