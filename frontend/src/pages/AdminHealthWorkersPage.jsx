import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';

const AdminHealthWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getAllHealthWorkers();
      setWorkers(res.data || []);
    } catch (e) {
      setError('Failed to load health workers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      await adminAPI.updateUserStatus(id, 'health-worker', isActive);
      fetchWorkers();
    } catch (e) {
      setError('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Manage Health Workers</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {loading ? (
          <p>Loading health workers...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-green-50">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker.id} className="border-b">
                  <td className="p-2">{worker.name}</td>
                  <td className="p-2">{worker.email}</td>
                  <td className="p-2">{worker.is_active ? 'Active' : 'Disabled'}</td>
                  <td className="p-2 flex gap-2">
                    <button className={`px-2 py-1 rounded ${worker.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`} onClick={() => handleStatusChange(worker.id, !worker.is_active)}>
                      {worker.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminHealthWorkersPage;
