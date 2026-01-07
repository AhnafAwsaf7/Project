import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';

const ProfileEdit = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    websiteUrl: '',
    linkedinUrl: '',
    achievements: [],
    entrepreneurData: {
      startupName: '',
      startupPitch: '',
      fundingGoal: '',
      industryCategory: '',
    },
    investorData: {
      companyName: '',
      expertiseArea: [],
      investmentThesis: '',
      typicalCheckSize: '',
    },
    mentorData: {
      expertiseAreas: [],
      yearsExperience: '',
      specialization: '',
    },
  });
  const [newAchievement, setNewAchievement] = useState('');
  const [newExpertiseTag, setNewExpertiseTag] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user profile data
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile/me');
      if (response.data.success) {
        const userData = response.data.data.user;
        setFormData({
          name: userData.name || '',
          bio: userData.profile?.bio || '',
          location: userData.profile?.location || '',
          websiteUrl: userData.profile?.websiteUrl || '',
          linkedinUrl: userData.profile?.linkedinUrl || '',
          achievements: userData.profile?.achievements || [],
          entrepreneurData: {
            startupName: userData.profile?.entrepreneurData?.startupName || '',
            startupPitch: userData.profile?.entrepreneurData?.startupPitch || '',
            fundingGoal: userData.profile?.entrepreneurData?.fundingGoal || '',
            industryCategory: userData.profile?.entrepreneurData?.industryCategory || '',
          },
          investorData: {
            companyName: userData.profile?.investorData?.companyName || '',
            expertiseArea: userData.profile?.investorData?.expertiseArea || [],
            investmentThesis: userData.profile?.investorData?.investmentThesis || '',
            typicalCheckSize: userData.profile?.investorData?.typicalCheckSize || '',
          },
          mentorData: {
            expertiseAreas: userData.profile?.mentorData?.expertiseAreas || [],
            yearsExperience: userData.profile?.mentorData?.yearsExperience || '',
            specialization: userData.profile?.mentorData?.specialization || '',
          },
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('entrepreneurData.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        entrepreneurData: {
          ...prev.entrepreneurData,
          [field]: value,
        },
      }));
    } else if (name.startsWith('investorData.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        investorData: {
          ...prev.investorData,
          [field]: value,
        },
      }));
    } else if (name.startsWith('mentorData.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        mentorData: {
          ...prev.mentorData,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()],
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const addExpertiseTag = (role) => {
    const tag = role === 'investor' ? newExpertiseTag : newExpertiseTag;
    if (tag.trim()) {
      if (role === 'investor') {
        setFormData((prev) => ({
          ...prev,
          investorData: {
            ...prev.investorData,
            expertiseArea: [...prev.investorData.expertiseArea, tag.trim()],
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          mentorData: {
            ...prev.mentorData,
            expertiseAreas: [...prev.mentorData.expertiseAreas, tag.trim()],
          },
        }));
      }
      setNewExpertiseTag('');
    }
  };

  const removeExpertiseTag = (index, role) => {
    if (role === 'investor') {
      setFormData((prev) => ({
        ...prev,
        investorData: {
          ...prev.investorData,
          expertiseArea: prev.investorData.expertiseArea.filter((_, i) => i !== index),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        mentorData: {
          ...prev.mentorData,
          expertiseAreas: prev.mentorData.expertiseAreas.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name,
        profile: {
          bio: formData.bio || '',
          location: formData.location || '',
          websiteUrl: formData.websiteUrl || '',
          linkedinUrl: formData.linkedinUrl || '',
          achievements: Array.isArray(formData.achievements) ? formData.achievements.filter(a => a && a.trim() !== '') : [],
        },
      };

      // Add role-specific data - always include all fields
      if (user.role === 'ENTREPRENEUR') {
        payload.profile.entrepreneurData = {
          startupName: formData.entrepreneurData.startupName || '',
          startupPitch: formData.entrepreneurData.startupPitch || '',
          fundingGoal: formData.entrepreneurData.fundingGoal ? parseFloat(formData.entrepreneurData.fundingGoal) : 0,
          industryCategory: formData.entrepreneurData.industryCategory || '',
        };
      } else if (user.role === 'INVESTOR') {
        payload.profile.investorData = {
          companyName: formData.investorData.companyName || '',
          expertiseArea: Array.isArray(formData.investorData.expertiseArea) 
            ? formData.investorData.expertiseArea.filter(e => e && e.trim() !== '') 
            : [],
          investmentThesis: formData.investorData.investmentThesis || '',
          typicalCheckSize: formData.investorData.typicalCheckSize ? parseFloat(formData.investorData.typicalCheckSize) : 0,
        };
      } else if (user.role === 'MENTOR') {
        payload.profile.mentorData = {
          expertiseAreas: Array.isArray(formData.mentorData.expertiseAreas)
            ? formData.mentorData.expertiseAreas.filter(e => e && e.trim() !== '')
            : [],
          yearsExperience: formData.mentorData.yearsExperience ? parseInt(formData.mentorData.yearsExperience) : 0,
          specialization: formData.mentorData.specialization || '',
        };
      }

      console.log('Saving profile payload:', JSON.stringify(payload, null, 2));

      const response = await api.put('/profile/me', payload);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Profile update error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Failed to update profile. Please check your input.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Profile</h1>
          <p className="text-sm text-slate-600 leading-relaxed">Update your profile information and role-specific details</p>
        </div>

        <Card>

          {/* Tabs */}
          <div className="border-b border-slate-200 mb-6">
            <nav className="flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'general'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                General
              </button>
              {(user.role === 'ENTREPRENEUR' || user.role === 'INVESTOR' || user.role === 'MENTOR') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('role-specific')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'role-specific'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {user.role === 'ENTREPRENEUR' && 'Startup Details'}
                  {user.role === 'INVESTOR' && 'Investor Info'}
                  {user.role === 'MENTOR' && 'Mentor Info'}
                </button>
              )}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'general' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label htmlFor="websiteUrl" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="linkedinUrl" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Achievements
                  </label>
                  <div className="space-y-2">
                    {formData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => {
                            const newAchievements = [...formData.achievements];
                            newAchievements[index] = e.target.value;
                            setFormData((prev) => ({ ...prev, achievements: newAchievements }));
                          }}
                          className="flex-1 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeAchievement(index)}
                          className="text-danger-600 hover:text-danger-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAchievement();
                          }
                        }}
                        placeholder="Add achievement..."
                        className="flex-1 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                      />
                      <Button
                        type="button"
                        onClick={addAchievement}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {user.role === 'ENTREPRENEUR' && (
                  <>
                    <div>
                      <label htmlFor="startupName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Startup Name
                      </label>
                      <input
                        type="text"
                        id="startupName"
                        name="entrepreneurData.startupName"
                        value={formData.entrepreneurData.startupName}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                      />
                    </div>

                    <div>
                      <label htmlFor="startupPitch" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Startup Pitch
                      </label>
                      <textarea
                        id="startupPitch"
                        name="entrepreneurData.startupPitch"
                        rows={6}
                        value={formData.entrepreneurData.startupPitch}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        placeholder="Describe your startup, mission, and vision..."
                      />
                    </div>

                    <div>
                      <label htmlFor="fundingGoal" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Funding Goal ($)
                      </label>
                      <input
                        type="number"
                        id="fundingGoal"
                        name="entrepreneurData.fundingGoal"
                        value={formData.entrepreneurData.fundingGoal}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        placeholder="50000"
                      />
                    </div>

                    <div>
                      <label htmlFor="industryCategory" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Industry Category
                      </label>
                      <input
                        type="text"
                        id="industryCategory"
                        name="entrepreneurData.industryCategory"
                        value={formData.entrepreneurData.industryCategory}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        placeholder="Technology, Healthcare, Finance, etc."
                      />
                    </div>
                  </>
                )}

                {user.role === 'INVESTOR' && (
                  <>
                    <div>
                      <label htmlFor="companyName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="investorData.companyName"
                        value={formData.investorData.companyName}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Expertise Areas
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.investorData.expertiseArea.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeExpertiseTag(index, 'investor')}
                              className="ml-2 text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newExpertiseTag}
                          onChange={(e) => setNewExpertiseTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addExpertiseTag('investor');
                            }
                          }}
                          placeholder="Type and press Enter to add tag"
                          className="flex-1 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        />
                        <Button
                          type="button"
                          onClick={() => addExpertiseTag('investor')}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="investmentThesis" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Investment Thesis
                      </label>
                      <textarea
                        id="investmentThesis"
                        name="investorData.investmentThesis"
                        rows={4}
                        value={formData.investorData.investmentThesis}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        placeholder="Describe your investment focus and strategy..."
                      />
                    </div>

                    <div>
                      <label htmlFor="typicalCheckSize" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Typical Check Size ($)
                      </label>
                      <input
                        type="number"
                        id="typicalCheckSize"
                        name="investorData.typicalCheckSize"
                        value={formData.investorData.typicalCheckSize}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        placeholder="100000"
                      />
                    </div>
                  </>
                )}

                {user.role === 'MENTOR' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Expertise Areas
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.mentorData.expertiseAreas.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeExpertiseTag(index, 'mentor')}
                              className="ml-2 text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newExpertiseTag}
                          onChange={(e) => setNewExpertiseTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addExpertiseTag('mentor');
                            }
                          }}
                          placeholder="Type and press Enter to add tag"
                          className="flex-1 border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        />
                        <Button
                          type="button"
                          onClick={() => addExpertiseTag('mentor')}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="specialization" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="mentorData.specialization"
                        value={formData.mentorData.specialization}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        placeholder="e.g., Product Strategy, Growth Marketing"
                      />
                    </div>

                    <div>
                      <label htmlFor="yearsExperience" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="yearsExperience"
                        name="mentorData.yearsExperience"
                        value={formData.mentorData.yearsExperience}
                        onChange={handleChange}
                        className="w-full border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm px-3 py-2"
                        placeholder="5"
                        min="0"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfileEdit;



