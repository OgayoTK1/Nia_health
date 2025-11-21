
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api';

const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', gender: '' });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getAllPatients();
      setPatients(res.data || []);
    } catch (e) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      // You may need to create a dedicated adminAPI.createPatient endpoint in backend
      await adminAPI.createPatient(form);
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', dob: '', gender: '' });
      fetchPatients();
    } catch (e) {
      setError('Failed to add patient');
    }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updatePatient(editPatient.id, form);
      setShowEdit(false);
      setEditPatient(null);
      setForm({ name: '', email: '', phone: '', dob: '', gender: '' });
      fetchPatients();
    } catch (e) {
      setError('Failed to update patient');
    }
  };

  const handleRemovePatient = async (id) => {
    if (!window.confirm('Are you sure you want to remove this patient?')) return;
    try {
      await adminAPI.deletePatient(id);
      fetchPatients();
    } catch (e) {
      setError('Failed to remove patient');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-primary-600 mb-4">Manage Patients</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700">View, add, edit, or remove patient records. Ensure data accuracy and privacy.</p>
          <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700" onClick={() => setShowAdd(true)}>Add Patient</button>
        </div>
        {loading ? (
          <p>Loading patients...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-primary-50">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">DOB</th>
                <th className="p-2">Gender</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b">
                  <td className="p-2">{patient.name}</td>
                  <td className="p-2">{patient.email}</td>
                  <td className="p-2">{patient.phone}</td>
                  <td className="p-2">{patient.dob}</td>
                  <td className="p-2">{patient.gender}</td>
                  <td className="p-2 flex gap-2">
                    <button className="bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200" onClick={() => { setShowEdit(true); setEditPatient(patient); setForm({ name: patient.name, email: patient.email, phone: patient.phone, dob: patient.dob, gender: patient.gender }); }}>Edit</button>
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" onClick={() => handleRemovePatient(patient.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow p-6 w-full max-w-md" onSubmit={handleAddPatient}>
            <h2 className="text-xl font-bold mb-4">Add Patient</h2>
            <input type="text" placeholder="Name" className="w-full mb-2 p-2 border rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input type="email" placeholder="Email" className="w-full mb-2 p-2 border rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input type="text" placeholder="Phone" className="w-full mb-2 p-2 border rounded" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <input type="date" placeholder="DOB" className="w-full mb-2 p-2 border rounded" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} required />
            <select className="w-full mb-4 p-2 border rounded" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Add</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow p-6 w-full max-w-md" onSubmit={handleEditPatient}>
            <h2 className="text-xl font-bold mb-4">Edit Patient</h2>
            <input type="text" placeholder="Name" className="w-full mb-2 p-2 border rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input type="email" placeholder="Email" className="w-full mb-2 p-2 border rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input type="text" placeholder="Phone" className="w-full mb-2 p-2 border rounded" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <input type="date" placeholder="DOB" className="w-full mb-2 p-2 border rounded" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} required />
            <select className="w-full mb-4 p-2 border rounded" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Update</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => { setShowEdit(false); setEditPatient(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <Link to="/admin" className="text-primary-600 hover:underline">← Back to Dashboard</Link>
    </div>
  );
};

export default AdminPatientsPage;
