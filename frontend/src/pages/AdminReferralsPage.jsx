
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { referralAPI } from '../api';

const AdminReferralsPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResolve, setShowResolve] = useState(false);
  const [resolveReferral, setResolveReferral] = useState(null);
  const [form, setForm] = useState({ status: '', notes: '', follow_up_date: '' });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await referralAPI.getAll();
      setReferrals(res.data || []);
    } catch (e) {
      setError('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReferral = async (e) => {
    e.preventDefault();
    // Implement referral resolve logic here
    setShowResolve(false);
    setResolveReferral(null);
    setForm({ status: '', notes: '', follow_up_date: '' });
    fetchReferrals();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Manage Referrals</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700">Track, approve, or resolve referrals. Monitor referral status and bottlenecks.</p>
        </div>
        {loading ? (
          <p>Loading referrals...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-red-50">
                <th className="p-2">Patient</th>
                <th className="p-2">Clinic</th>
                <th className="p-2">Hospital</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => (
                <tr key={ref.id} className="border-b">
                  <td className="p-2">{ref.patient_id}</td>
                  <td className="p-2">{ref.clinic_id}</td>
                  <td className="p-2">{ref.hospital_name}</td>
                  <td className="p-2">{ref.status}</td>
                  <td className="p-2">{ref.referral_date}</td>
                  <td className="p-2 flex gap-2">
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" onClick={() => { setShowResolve(true); setResolveReferral(ref); setForm({ status: ref.status, notes: '', follow_up_date: '' }); }}>Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Resolve Referral Modal */}
      {showResolve && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow p-6 w-full max-w-md" onSubmit={handleResolveReferral}>
            <h2 className="text-xl font-bold mb-4">Resolve Referral</h2>
            <select className="w-full mb-2 p-2 border rounded" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required>
              <option value="">Select Status</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="pending">Pending</option>
            </select>
            <input type="text" placeholder="Notes" className="w-full mb-2 p-2 border rounded" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <input type="date" placeholder="Follow Up Date" className="w-full mb-4 p-2 border rounded" value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} />
            <div className="flex gap-2">
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Resolve</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => { setShowResolve(false); setResolveReferral(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <Link to="/admin" className="text-red-600 hover:underline">← Back to Dashboard</Link>
    </div>
  );
};

export default AdminReferralsPage;
