import { Link } from 'react-router-dom';

const AdminPatientsPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold text-primary-600 mb-4">Manage Patients</h1>
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <p className="mb-4 text-gray-700">View, add, edit, or remove patient records. Ensure data accuracy and privacy.</p>
      <div className="flex gap-4 flex-wrap">
        <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Add Patient</button>
        <button className="bg-primary-100 text-primary-700 px-4 py-2 rounded hover:bg-primary-200">Edit Patient</button>
        <button className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200">Remove Patient</button>
      </div>
    </div>
    <Link to="/admin" className="text-primary-600 hover:underline">← Back to Dashboard</Link>
  </div>
);

export default AdminPatientsPage;
