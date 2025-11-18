import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { referralAPI, appointmentAPI } from '../api';
import { CalendarCheck, Share2, Building2, LogOut } from 'lucide-react';

const HealthWorkerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    clinicAppointments: 0,
    clinicReferrals: 0,
    pendingReferrals: 0,
    upcomingAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClinicData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClinicData = async () => {
    if (!user?.clinic_id) {
      setError('No clinic assigned to this health worker.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      // Fetch referrals & appointments for clinic
      const [refRes, appRes] = await Promise.all([
        referralAPI.getClinicReferrals(user.clinic_id, { limit: 50 }),
        appointmentAPI.getClinicAppointments(user.clinic_id, { limit: 50 })
      ]);

      const referrals = refRes.data || [];
      const appointments = appRes.data || [];

      const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
      const upcomingAppointments = appointments.filter(a => ['scheduled','confirmed'].includes(a.status)).length;

      setStats({
        clinicAppointments: appointments.length,
        clinicReferrals: referrals.length,
        pendingReferrals,
        upcomingAppointments
      });
    } catch (e) {
      console.error('Failed to load clinic data', e);
      setError(e.response?.data?.message || 'Failed to load clinic data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="NiaHealth Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold text-primary-600">Health Worker Dashboard</h1>
              <p className="text-gray-600 mt-1">Clinic operations overview</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">{user?.role === 'admin' ? 'Admin (Health Worker View)' : 'Health Worker'}</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}
        {loading ? (
          <div className="text-center py-12">Loading clinic data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={CalendarCheck} label="Appointments" value={stats.clinicAppointments} color="primary" />
              <StatCard icon={Share2} label="Referrals" value={stats.clinicReferrals} color="blue" />
              <StatCard icon={Share2} label="Pending Referrals" value={stats.pendingReferrals} color="orange" />
              <StatCard icon={CalendarCheck} label="Upcoming Appointments" value={stats.upcomingAppointments} color="green" />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" /> Clinic Summary
              </h2>
              {user?.clinic_id ? (
                <p className="text-sm text-gray-600">Clinic ID: {user.clinic_id} • Manage referrals and appointments efficiently.</p>
              ) : (
                <p className="text-sm text-gray-600">No clinic assigned.</p>
              )}
              <div className="mt-4 text-xs text-gray-500">Data represents last fetch; implement real-time updates with websockets for live ops.</div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const colorMap = {
    primary: 'text-primary-600 bg-primary-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100'
  };
  const badge = colorMap[color] || 'text-gray-600 bg-gray-100';
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold {color === 'primary' ? 'text-primary-600' : ''}">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${badge}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default HealthWorkerDashboardPage;
