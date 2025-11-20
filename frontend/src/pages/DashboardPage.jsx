import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { patientAPI } from '../api';
import { Calendar, AlertCircle, FileText, Clock, LogOut, User } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    appointments: 0,
    referrals: 0,
    alerts: 0,
    lastAppointment: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wait for auth to be fully loaded
    if (authLoading) {
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Admins should use the admin dashboard
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [isAuthenticated, authLoading, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is a patient before fetching patient statistics
      if (user?.userType === 'patient') {
        // Fetch statistics for patients
        const statsData = await patientAPI.getStatistics();
        
        setStats({
          appointments: statsData.data?.totalAppointments || 0,
          referrals: statsData.data?.totalReferrals || 0,
          alerts: statsData.data?.upcomingAppointments || 0,
          lastAppointment: statsData.data?.lastAppointment || null
        });
      } else {
        // For health workers, set default stats or fetch from a different endpoint
        console.log('Health worker dashboard - using default stats');
        setStats({
          appointments: 0,
          referrals: 0,
          alerts: 0,
          lastAppointment: null
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      // Don't show error for 403 (expected for health workers)
      if (err.response?.status !== 403) {
        setError('Failed to load dashboard data. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="NiaHealth Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold text-primary-600">NiaHealth Dashboard</h1>
              <p className="text-gray-600 mt-1">Community Health Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Appointments Card */}
          <button 
            onClick={() => navigate('/appointments')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left w-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Appointments</p>
                <p className="text-3xl font-bold text-primary-600">{stats.appointments}</p>
                <p className="text-xs text-gray-500 mt-2">Active appointments</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </button>

          {/* Referrals Card: Only for health workers and clinic officers */}
          {(user?.userType === 'health_worker' || user?.userType === 'clinic_officer') && (
            <button 
              onClick={() => navigate('/referrals')}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left w-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Referrals</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.referrals}</p>
                  <p className="text-xs text-gray-500 mt-2">Health referrals</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </button>
          )}

          {/* Alerts Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Health Alerts</p>
                <p className="text-3xl font-bold text-red-600">{stats.alerts}</p>
                <p className="text-xs text-gray-500 mt-2">Pending alerts</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <button 
            onClick={() => navigate('/profile')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left w-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Profile Status</p>
                <p className="text-xl font-bold text-green-600">Complete</p>
                <p className="text-xs text-gray-500 mt-2">All verified</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <User className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Last Appointment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Last Appointment
            </h2>
            {stats.lastAppointment ? (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Date:</span> {new Date(stats.lastAppointment.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Time:</span> {stats.lastAppointment.time}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Clinic:</span> {stats.lastAppointment.clinic}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    stats.lastAppointment.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : stats.lastAppointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {stats.lastAppointment.status}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No appointments yet</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/appointments')}
                className="w-full px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors font-medium text-left flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
              {/* Referrals Quick Link: Only for health workers and clinic officers */}
              {(user?.userType === 'health_worker' || user?.userType === 'clinic_officer') && (
                <button 
                  onClick={() => navigate('/referrals')}
                  className="w-full px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium text-left flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Referrals
                </button>
              )}
              <button 
                onClick={() => navigate('/profile')}
                className="w-full px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium text-left flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome to NiaHealth, {user?.name}! 👋
            {user?.userType === 'health_worker' && ' (Health Worker)'}
          </h2>
          <p className="text-primary-100 mb-4">
            {user?.userType === 'patient' 
              ? "You're connected to our community health monitoring and referral system. Use the dashboard above to track your appointments, referrals, and health alerts."
              : "Welcome to the NiaHealth Health Worker Dashboard. You can manage appointments, view referrals, and monitor patient health alerts."}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded p-4">
              <h3 className="font-semibold mb-2">📋 Health Records</h3>
              <p className="text-sm text-primary-100">
                {user?.userType === 'patient' 
                  ? 'Access your complete medical history and records'
                  : 'View and manage patient medical records'}
              </p>
            </div>
            <div className="bg-white/10 rounded p-4">
              <h3 className="font-semibold mb-2">🔔 Notifications</h3>
              <p className="text-sm text-primary-100">Receive alerts for important health updates</p>
            </div>
            <div className="bg-white/10 rounded p-4">
              <h3 className="font-semibold mb-2">👨‍⚕️ Healthcare Providers</h3>
              <p className="text-sm text-primary-100">
                {user?.userType === 'patient'
                  ? 'Connect with verified health professionals'
                  : 'Coordinate with healthcare team members'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>&copy; 2025 NiaHealth. All rights reserved. | Community Health Monitoring & Referral System</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
