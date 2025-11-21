import { Link } from 'react-router-dom';

const AdminPatientsPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold text-primary-600 mb-4">Manage Patients</h1>
    <p className="mb-8 text-gray-700">Patient management features coming soon.</p>
    <Link to="/admin" className="text-primary-600 hover:underline">← Back to Dashboard</Link>
  </div>
);

export default AdminPatientsPage;
