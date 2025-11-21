
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';

const AdminAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'email', scheduled_at: '' });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getAllAlerts();
      setAlerts(res.data || []);
    } catch (e) {
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createAlert(form);
      setShowAdd(false);
      setForm({ title: '', message: '', type: 'email', scheduled_at: '' });
      fetchAlerts();
    } catch (e) {
      setError('Failed to create alert');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Alerts & Communication Management</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p>Create, schedule, and monitor health alerts. Choose SMS/Email, review delivery status, manage templates.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowAdd(true)}>Create New Alert</button>
        </div>
        {loading ? (
          <p>Loading alerts...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-green-50">
                <th className="p-2">Title</th>
                <th className="p-2">Type</th>
                <th className="p-2">Scheduled At</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-b">
                  <td className="p-2">{alert.title}</td>
                  <td className="p-2">{alert.type}</td>
                  <td className="p-2">{alert.scheduled_at}</td>
                  <td className="p-2">{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Alert Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow p-6 w-full max-w-md" onSubmit={handleAddAlert}>
            <h2 className="text-xl font-bold mb-4">Create New Alert</h2>
            <input type="text" placeholder="Title" className="w-full mb-2 p-2 border rounded" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea placeholder="Message" className="w-full mb-2 p-2 border rounded" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            <select className="w-full mb-2 p-2 border rounded" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <input type="datetime-local" className="w-full mb-4 p-2 border rounded" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} required />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAlertsPage;
