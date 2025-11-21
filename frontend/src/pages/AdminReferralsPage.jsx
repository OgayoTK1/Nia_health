import { Link } from 'react-router-dom';

const AdminReferralsPage = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <h1 className="text-3xl font-bold text-red-600 mb-4">Manage Referrals</h1>
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <p className="mb-4 text-gray-700">Track, approve, or resolve referrals. Monitor referral status and bottlenecks.</p>
      <div className="flex gap-4 flex-wrap">
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">View Active Referrals</button>
        <button className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200">Resolve Referral</button>
      </div>
    </div>
    <Link to="/admin" className="text-red-600 hover:underline">← Back to Dashboard</Link>
  </div>
);

export default AdminReferralsPage;
