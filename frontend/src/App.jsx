import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPatientsPage from './pages/AdminPatientsPage';
import AdminClinicsPage from './pages/AdminClinicsPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import AdminReferralsPage from './pages/AdminReferralsPage';
import HealthWorkerDashboardPage from './pages/HealthWorkerDashboardPage';
import { RequireAuth, RequireAdmin, RequireHealthWorker } from './components/RouteGuards';
import AppointmentsPage from './pages/AppointmentsPage';
import ReferralsPage from './pages/ReferralsPage';
import ProfilePage from './pages/ProfilePage';

const HomePage = () => <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-8">
  <div className="text-center text-white">
    <div className="flex justify-center mb-6">
      <img src="/logo.svg" alt="NiaHealth Logo" className="h-24 w-24" />
    </div>
    <h1 className="text-6xl font-bold mb-4">NiaHealth</h1>
    <p className="text-2xl mb-8">Community Health Monitoring & Referral System</p>
    <div className="flex gap-4 justify-center">
      <a href="/login" className="btn btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg">
        Login
      </a>
      <a href="/register" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg">
        Register
      </a>
    </div>
    <div className="mt-12 text-lg opacity-90">
      <p>Empowering Communities Through Digital Health Solutions</p>
    </div>
  </div>
</div>;

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
          <Route path="/admin/patients" element={<RequireAdmin><AdminPatientsPage /></RequireAdmin>} />
          <Route path="/admin/clinics" element={<RequireAdmin><AdminClinicsPage /></RequireAdmin>} />
          <Route path="/admin/appointments" element={<RequireAdmin><AdminAppointmentsPage /></RequireAdmin>} />
          <Route path="/admin/referrals" element={<RequireAdmin><AdminReferralsPage /></RequireAdmin>} />
            <Route path="/admin/alerts" element={<RequireAdmin><AdminAlertsPage /></RequireAdmin>} />
            <Route path="/admin/audit" element={<RequireAdmin><AdminAuditPage /></RequireAdmin>} />
            <Route path="/admin/settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />
            <Route path="/admin/security" element={<RequireAdmin><AdminSecurityPage /></RequireAdmin>} />
          <Route path="/worker-dashboard" element={<RequireHealthWorker><HealthWorkerDashboardPage /></RequireHealthWorker>} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/referrals" element={<ReferralsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
