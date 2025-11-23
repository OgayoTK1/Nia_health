
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clinicAPI } from '../api';

const AdminClinicsPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editClinic, setEditClinic] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clinicAPI.getAll();
      setClinics(res.data || []);
    } catch (e) {
      setError('Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      await clinicAPI.create(form);
      setShowAdd(false);
      setForm({ name: '', address: '', phone: '' });
      fetchClinics();
    } catch (e) {
      setError('Failed to add clinic');
    }
  };

  const handleEditClinic = async (e) => {
    e.preventDefault();
    try {
      await clinicAPI.update(editClinic.id, form);
      setShowEdit(false);
      setEditClinic(null);
      setForm({ name: '', address: '', phone: '' });
      fetchClinics();
    } catch (e) {
      setError('Failed to update clinic');
    }
  };

  const handleRemoveClinic = async (id) => {
    if (!window.confirm('Are you sure you want to remove this clinic?')) return;
    try {
      await clinicAPI.delete(id);
      fetchClinics();
    } catch (e) {
      setError('Failed to remove clinic');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Manage Clinics</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700">View, add, edit, or remove clinics from the system.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setShowAdd(true)}>Add Clinic</button>
        </div>
        {loading ? (
          <p>Loading clinics...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2">Name</th>
                <th className="p-2">Address</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic) => (
                <tr key={clinic.id} className="border-b">
                  <td className="p-2">{clinic.name}</td>
                  <td className="p-2">{clinic.address}</td>
                  <td className="p-2">{clinic.phone}</td>
                  <td className="p-2 flex gap-2">
                    <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200" onClick={() => { setShowEdit(true); setEditClinic(clinic); setForm({ name: clinic.name, address: clinic.address, phone: clinic.phone }); }}>Edit</button>
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" onClick={() => handleRemoveClinic(clinic.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Clinic Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow p-6 w-full max-w-md" onSubmit={handleAddClinic}>
            <h2 className="text-xl font-bold mb-4">Add Clinic</h2>
            <input type="text" placeholder="Name" className="w-full mb-2 p-2 border rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input type="text" placeholder="Address" className="w-full mb-2 p-2 border rounded" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            <input type="text" placeholder="Phone" className="w-full mb-4 p-2 border rounded" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Clinic Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow p-6 w-full max-w-md" onSubmit={handleEditClinic}>
            <h2 className="text-xl font-bold mb-4">Edit Clinic</h2>
            <input type="text" placeholder="Name" className="w-full mb-2 p-2 border rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input type="text" placeholder="Address" className="w-full mb-2 p-2 border rounded" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            <input type="text" placeholder="Phone" className="w-full mb-4 p-2 border rounded" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => { setShowEdit(false); setEditClinic(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <Link to="/admin" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
    </div>
  );
};

export default AdminClinicsPage;
