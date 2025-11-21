import { Link } from 'react-router-dom';

const AdminClinicsPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold text-blue-600 mb-4">Manage Clinics</h1>
    <p className="mb-8 text-gray-700">Clinic management features coming soon.</p>
    <Link to="/admin" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
  </div>
);

export default AdminClinicsPage;
