import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { patientAPI } from '../api';
import { User, Mail, Phone, Calendar, MapPin, ArrowLeft, Edit2, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dob: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        dob: response.data.dob ? response.data.dob.split('T')[0] : '',
        gender: response.data.gender || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await patientAPI.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
      address: profile.address || '',
      dob: profile.dob ? profile.dob.split('T')[0] : '',
      gender: profile.gender || ''
    });
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-primary-600">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your personal information</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-8 py-12 rounded-t-lg">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-600" />
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">{profile?.name}</h2>
                <p className="text-primary-100">{profile?.email}</p>
                {profile?.is_verified && (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                    ✓ Verified Account
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            {!editing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Full Name</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">{profile?.name || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">{profile?.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">{profile?.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Date of Birth</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">
                        {profile?.dob ? new Date(profile.dob).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Gender</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-lg">{profile?.gender || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Address</label>
                    <div className="flex items-start gap-2 text-gray-900">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <span className="text-lg">{profile?.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Member since:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last updated:</span>
                      <span className="ml-2 text-gray-900 font-medium">
                        {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+254712345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows="3"
                      placeholder="Enter your full address..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
