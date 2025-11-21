import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../api';

import DashboardCharts from '../components/DashboardCharts';

const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className={`text-3xl font-bold ${
          color === 'primary' ? 'text-primary-600' : color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-gray-900'
        }`}>{value}</p>
      </div>
      <div className={`${
        color === 'primary' ? 'bg-primary-100' : color === 'blue' ? 'bg-blue-100' : color === 'green' ? 'bg-green-100' : 'bg-gray-100'
      } p-3 rounded-lg`}>
        <Icon className={`w-8 h-8 ${
          color === 'primary' ? 'text-primary-600' : color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-gray-600'
        }`} />
      </div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-primary-700">Admin Dashboard</h1>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Top Summary KPI Cards */}
              <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                <StatCard icon={Users} label="Patients" value={stats?.patients ?? '--'} color="primary" />
                <StatCard icon={Building2} label="Clinics" value={stats?.clinics ?? '--'} color="blue" />
                <StatCard icon={CalendarCheck} label="Appointments" value={stats?.appointments ?? '--'} color="green" />
                <StatCard icon={Share2} label="Referrals" value={stats?.referrals ?? '--'} color="primary" />
                <StatCard icon={Bell} label="Health Alerts" value={stats?.alerts ?? '--'} color="blue" />
                <StatCard icon={Activity} label="System Uptime" value={stats?.uptime ?? '--'} color="green" />
              </section>

              {/* Analytics & Reports Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><LineChart className="w-6 h-6" /> Analytics & Reports</h2>
                <DashboardCharts analytics={analytics} />
              </section>

              {/* Dashboard Modules Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User & Role Management */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">User & Role Management</h3>
                  <p className="text-gray-600 mb-2">Add/remove clinics, manage health worker accounts, reset passwords, approve registrations, assign roles.</p>
                  <button onClick={() => navigate('/admin/patients')} className="text-primary-600 hover:underline">Manage Patients</button>
                  <button onClick={() => navigate('/admin/clinics')} className="ml-4 text-blue-600 hover:underline">Manage Clinics</button>
                  <button onClick={() => navigate('/admin/health-workers')} className="ml-4 text-green-600 hover:underline">Manage Health Workers</button>
                  <button onClick={() => navigate('/admin/approve-clinics')} className="ml-4 text-purple-600 hover:underline">Approve Clinics</button>
                </div>

                {/* Alerts & Communication Management */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">Alerts & Communication</h3>
                  <p className="text-gray-600 mb-2">Create, schedule, and monitor health alerts. Choose SMS/Email, review delivery status, manage templates.</p>
                  <button onClick={() => navigate('/admin/alerts')} className="text-green-600 hover:underline">Manage Alerts</button>
                </div>

                {/* Referral System Oversight */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">Referral System Oversight</h3>
                  <p className="text-gray-600 mb-2">Track referral timelines, status, bottlenecks, and resolve escalations.</p>
                  <button onClick={() => navigate('/admin/referrals')} className="text-primary-600 hover:underline">View Referrals</button>
                </div>

                {/* Audit Logs Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
                  <p className="text-gray-600 mb-2">Review login attempts, patient record access, activity timestamps. Export logs for compliance.</p>
                  <button onClick={() => navigate('/admin/audit')} className="text-blue-600 hover:underline">View Audit Logs</button>
                </div>

                {/* System Settings */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">System Settings</h3>
                  <p className="text-gray-600 mb-2">Backup management, API configs, scaling settings, sync intervals.</p>
                  <button onClick={() => navigate('/admin/settings')} className="text-green-600 hover:underline">System Settings</button>
                </div>

                {/* Security & Compliance Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">Security & Compliance</h3>
                  <p className="text-gray-600 mb-2">2FA status, encryption health, breach alerts, role-based access mappings.</p>
                  <button onClick={() => navigate('/admin/security')} className="text-primary-600 hover:underline">Security Overview</button>
                </div>
              </section>
            </main>
          </div>
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [authLoading, isAuthenticated, user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, analyticsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAnalytics('30'),
      ]);

      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (e) {
      console.error('Failed to load admin dashboard:', e);
      setError(e.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="NiaHealth Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold text-primary-600">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System overview and management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Admin</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-pulse">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Patients" value={stats?.totalPatients ?? 0} color="primary" />
          <StatCard icon={Building2} label="Active Clinics" value={stats?.totalClinics ?? 0} color="blue" />
          <StatCard icon={CalendarCheck} label="Total Appointments" value={stats?.totalAppointments ?? 0} color="green" />
          <StatCard icon={Share2} label="Total Referrals" value={stats?.totalReferrals ?? 0} />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard icon={CalendarCheck} label="Upcoming Appointments" value={stats?.upcomingAppointments ?? 0} color="green" />
          <StatCard icon={Share2} label="Pending Referrals" value={stats?.pendingReferrals ?? 0} color="blue" />
          <StatCard icon={Activity} label="New Patients (30d)" value={stats?.recentPatients ?? 0} color="primary" />
        </div>

        {/* Analytics and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Analytics */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 flex flex-col min-h-[300px]">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary-600" />
              System Analytics (30 days)
            </h2>
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading analytics...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <p className="mb-2">Appointment records: {analytics?.appointmentTrends?.length ?? 0}</p>
                <p className="mb-2">Referral stats groups: {analytics?.referralStats?.length ?? 0}</p>
                <p>Top clinics listed: {analytics?.topClinics?.length ?? 0}</p>
              </div>
            )}
          </div>

          {/* Quick Alert Composer */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-600" />
              Send Health Alert
            </h2>
            <AlertComposer />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            className="bg-primary-600 text-white rounded-lg p-4 shadow hover:bg-primary-700 transition-colors font-semibold"
            title="View Patients"
            onClick={() => window.location.href = '/admin/patients'}
          >
            <Users className="w-6 h-6 mb-2" />
            Manage Patients
          </button>
          <button
            className="bg-blue-600 text-white rounded-lg p-4 shadow hover:bg-blue-700 transition-colors font-semibold"
            title="View Clinics"
            onClick={() => window.location.href = '/admin/clinics'}
          >
            <Building2 className="w-6 h-6 mb-2" />
            Manage Clinics
          </button>
          <button
            className="bg-green-600 text-white rounded-lg p-4 shadow hover:bg-green-700 transition-colors font-semibold"
            title="View Appointments"
            onClick={() => window.location.href = '/admin/appointments'}
          >
            <CalendarCheck className="w-6 h-6 mb-2" />
            Manage Appointments
          </button>
          <button
            className="bg-red-600 text-white rounded-lg p-4 shadow hover:bg-red-700 transition-colors font-semibold"
            title="View Referrals"
            onClick={() => window.location.href = '/admin/referrals'}
          >
            <Share2 className="w-6 h-6 mb-2" />
            Manage Referrals
          </button>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>&copy; 2025 NiaHealth. Admin Console</p>
        </div>
      </footer>
    </div>
  );
};

const AlertComposer = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState('all');
  const [targetLocation, setTargetLocation] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');

    // Client-side validation to avoid backend 400s
    if (!subject.trim()) {
      setFeedback('Subject is required');
      return;
    }
    if (!message.trim()) {
      setFeedback('Message is required');
      return;
    }
    if (targetGroup === 'specific' && !targetLocation.trim()) {
      setFeedback('Please provide a location when Target Group is Specific');
      return;
    }

    setSending(true);
    try {
      // Build payload explicitly so we don't send undefined for optional keys
      const payload = {
        subject: subject.trim(),
        message: message.trim(),
        target_group: targetGroup,
      };

      if (targetGroup === 'specific') {
        payload.target_location = targetLocation.trim();
      }

      const res = await adminAPI.createAlert(payload);

      setFeedback(res?.message || 'Alert sent successfully');
      setSubject('');
      setMessage('');
      setTargetLocation('');
      setTargetGroup('all');
    } catch (e) {
      // Show backend validation error messages when available
      const msg = e?.response?.data?.message || e?.response?.data?.errors?.[0]?.message || e.message || 'Failed to send alert';
      setFeedback(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-label="Send health alert form">
      {feedback && (
        <div role="status" className="p-2 text-sm rounded bg-gray-50 border text-gray-700">{feedback}</div>
      )}

      <div>
        <label htmlFor="alert-subject" className="block text-sm text-gray-700 mb-1">Subject</label>
        <input
          id="alert-subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Outbreak update"
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="alert-message" className="block text-sm text-gray-700 mb-1">Message</label>
        <textarea
          id="alert-message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2"
          placeholder="Details about the alert..."
          required
          aria-required="true"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="alert-target-group" className="block text-sm text-gray-700 mb-1">Target Group</label>
          <select
            id="alert-target-group"
            name="target_group"
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="all">All Users</option>
            <option value="patients">Patients</option>
            <option value="health_workers">Health Workers</option>
            <option value="specific">Specific Location</option>
          </select>
        </div>

        {targetGroup === 'specific' && (
          <div>
            <label htmlFor="alert-target-location" className="block text-sm text-gray-700 mb-1">Location Contains</label>
            <input
              id="alert-target-location"
              name="target_location"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Nairobi"
              required
              aria-required="true"
            />
          </div>
        )}
      </div>

      <button
        disabled={sending}
        type="submit"
        className={`w-full py-2 rounded text-white ${sending ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'}`}
      >
        {sending ? 'Sending...' : 'Send Alert'}
      </button>
    </form>
  );
};

export default AdminDashboardPage;
