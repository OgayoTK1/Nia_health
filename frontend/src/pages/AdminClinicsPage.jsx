import { Link } from 'react-router-dom';

const AdminClinicsPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold text-blue-600 mb-4">Manage Clinics</h1>
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <p className="mb-4 text-gray-700">View, add, edit, or remove clinics from the system.</p>
      <div className="flex gap-4 flex-wrap">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Clinic</button>
        <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200">Edit Clinic</button>
        <button className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200">Remove Clinic</button>
      </div>
    </div>
    <Link to="/admin" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
  </div>
);

export default AdminClinicsPage;
