import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';

const AdminApproveClinicsPage = () => {
  const [pendingClinics, setPendingClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingClinics();
  }, []);

  const fetchPendingClinics = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with actual API call for pending clinics
      // const res = await adminAPI.getPendingClinics();
      // setPendingClinics(res.data || []);
      setPendingClinics([{ id: 1, name: 'Clinic A', address: '123 Main St', email: 'clinicA@email.com' }]);
    } catch (e) {
      setError('Failed to load pending clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    // Implement approve logic here
    alert('Clinic approved!');
    fetchPendingClinics();
  };

  const handleReject = async (id) => {
    // Implement reject logic here
    alert('Clinic rejected!');
    fetchPendingClinics();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">Approve Clinics</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {loading ? (
          <p>Loading pending clinics...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-purple-50">
                <th className="p-2">Name</th>
                <th className="p-2">Address</th>
                <th className="p-2">Email</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingClinics.map((clinic) => (
                <tr key={clinic.id} className="border-b">
                  <td className="p-2">{clinic.name}</td>
                  <td className="p-2">{clinic.address}</td>
                  <td className="p-2">{clinic.email}</td>
                  <td className="p-2 flex gap-2">
                    <button className="bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200" onClick={() => handleApprove(clinic.id)}>Approve</button>
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" onClick={() => handleReject(clinic.id)}>Reject</button>
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

export default AdminApproveClinicsPage;
