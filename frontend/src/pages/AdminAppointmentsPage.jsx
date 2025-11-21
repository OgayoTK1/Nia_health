
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../api';

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);
  const [form, setForm] = useState({ clinic_id: '', appointment_date: '', appointment_time: '', reason: '' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      // For demo, fetch all clinic appointments (clinic_id can be parameterized)
      const res = await appointmentAPI.getClinicAppointments(1); // Replace 1 with actual clinic_id or admin view
      setAppointments(res.data || []);
    } catch (e) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.create(form);
      setShowAdd(false);
      setForm({ clinic_id: '', appointment_date: '', appointment_time: '', reason: '' });
      fetchAppointments();
    } catch (e) {
      setError('Failed to schedule appointment');
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    try {
      await appointmentAPI.update(editAppointment.id, form);
      setShowEdit(false);
      setEditAppointment(null);
      setForm({ clinic_id: '', appointment_date: '', appointment_time: '', reason: '' });
      fetchAppointments();
    } catch (e) {
      setError('Failed to update appointment');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      fetchAppointments();
    } catch (e) {
      setError('Failed to cancel appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Manage Appointments</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700">View, schedule, or cancel appointments. Track appointment volumes and status.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowAdd(true)}>Schedule Appointment</button>
        </div>
        {loading ? (
          <p>Loading appointments...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-green-50">
                <th className="p-2">Clinic</th>
                <th className="p-2">Date</th>
                <th className="p-2">Time</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-b">
                  <td className="p-2">{appt.clinic_id}</td>
                  <td className="p-2">{appt.appointment_date}</td>
                  <td className="p-2">{appt.appointment_time}</td>
                  <td className="p-2">{appt.reason}</td>
                  <td className="p-2 flex gap-2">
                    <button className="bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200" onClick={() => { setShowEdit(true); setEditAppointment(appt); setForm({ clinic_id: appt.clinic_id, appointment_date: appt.appointment_date, appointment_time: appt.appointment_time, reason: appt.reason }); }}>Edit</button>
                    <button className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200" onClick={() => handleCancelAppointment(appt.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow p-6 w-full max-w-md" onSubmit={handleAddAppointment}>
            <h2 className="text-xl font-bold mb-4">Schedule Appointment</h2>
            <input type="text" placeholder="Clinic ID" className="w-full mb-2 p-2 border rounded" value={form.clinic_id} onChange={e => setForm({ ...form, clinic_id: e.target.value })} required />
            <input type="date" placeholder="Date" className="w-full mb-2 p-2 border rounded" value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} required />
            <input type="time" placeholder="Time" className="w-full mb-2 p-2 border rounded" value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} required />
            <input type="text" placeholder="Reason" className="w-full mb-4 p-2 border rounded" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Schedule</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg shadow p-6 w-full max-w-md" onSubmit={handleEditAppointment}>
            <h2 className="text-xl font-bold mb-4">Edit Appointment</h2>
            <input type="text" placeholder="Clinic ID" className="w-full mb-2 p-2 border rounded" value={form.clinic_id} onChange={e => setForm({ ...form, clinic_id: e.target.value })} required />
            <input type="date" placeholder="Date" className="w-full mb-2 p-2 border rounded" value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} required />
            <input type="time" placeholder="Time" className="w-full mb-2 p-2 border rounded" value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} required />
            <input type="text" placeholder="Reason" className="w-full mb-4 p-2 border rounded" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Update</button>
              <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => { setShowEdit(false); setEditAppointment(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <Link to="/admin" className="text-green-600 hover:underline">← Back to Dashboard</Link>
    </div>
  );
};

export default AdminAppointmentsPage;
