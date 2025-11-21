import { Link } from 'react-router-dom';

const AdminAppointmentsPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold text-green-600 mb-4">Manage Appointments</h1>
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <p className="mb-4 text-gray-700">View, schedule, or cancel appointments. Track appointment volumes and status.</p>
      <div className="flex gap-4 flex-wrap">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Schedule Appointment</button>
        <button className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200">Edit Appointment</button>
        <button className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200">Cancel Appointment</button>
      </div>
    </div>
    <Link to="/admin" className="text-green-600 hover:underline">← Back to Dashboard</Link>
  </div>
);

export default AdminAppointmentsPage;
