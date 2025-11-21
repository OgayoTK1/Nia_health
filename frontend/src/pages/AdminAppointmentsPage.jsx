import { Link } from 'react-router-dom';

const AdminAppointmentsPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold text-green-600 mb-4">Manage Appointments</h1>
    <p className="mb-8 text-gray-700">Appointment management features coming soon.</p>
    <Link to="/admin" className="text-green-600 hover:underline">← Back to Dashboard</Link>
  </div>
);

export default AdminAppointmentsPage;
