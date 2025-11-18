import { useState } from 'react';
import { referralAPI } from '../api';

const ReferralForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    patient_id: '',
    clinic_id: '',
    hospital_name: '',
    hospital_location: '',
    reason: '',
    diagnosis: '',
    urgency: '',
    referral_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await referralAPI.create(form);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white p-6 rounded shadow w-full max-w-lg" onSubmit={handleSubmit} aria-labelledby="referral-form-title">
        <h2 id="referral-form-title" className="text-xl font-bold mb-4">Create Referral</h2>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="patient_id" className="block text-sm text-gray-700 mb-1">Patient ID</label>
            <input id="patient_id" name="patient_id" type="number" min="1" placeholder="e.g., 12" value={form.patient_id} onChange={handleChange} className="input mb-2 w-full" required />
          </div>

          <div>
            <label htmlFor="clinic_id" className="block text-sm text-gray-700 mb-1">Clinic ID</label>
            <input id="clinic_id" name="clinic_id" type="number" min="1" placeholder="e.g., 3" value={form.clinic_id} onChange={handleChange} className="input mb-2 w-full" required />
          </div>

          <div>
            <label htmlFor="hospital_name" className="block text-sm text-gray-700 mb-1">Hospital Name</label>
            <input id="hospital_name" name="hospital_name" placeholder="Hospital Name" value={form.hospital_name} onChange={handleChange} className="input mb-2 w-full" required />
          </div>

          <div>
            <label htmlFor="hospital_location" className="block text-sm text-gray-700 mb-1">Hospital Location (optional)</label>
            <input id="hospital_location" name="hospital_location" placeholder="City, Area" value={form.hospital_location} onChange={handleChange} className="input mb-2 w-full" />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm text-gray-700 mb-1">Reason for Referral</label>
            <textarea id="reason" name="reason" placeholder="Provide at least 10 characters..." value={form.reason} onChange={handleChange} className="input mb-2 w-full" minLength={10} required />
          </div>

          <div>
            <label htmlFor="diagnosis" className="block text-sm text-gray-700 mb-1">Diagnosis (optional)</label>
            <input id="diagnosis" name="diagnosis" placeholder="Diagnosis" value={form.diagnosis} onChange={handleChange} className="input mb-2 w-full" />
          </div>

          <div>
            <label htmlFor="urgency" className="block text-sm text-gray-700 mb-1">Urgency</label>
            <select id="urgency" name="urgency" value={form.urgency} onChange={handleChange} className="input mb-2 w-full" required>
              <option value="">Select urgency</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label htmlFor="referral_date" className="block text-sm text-gray-700 mb-1">Referral Date</label>
            <input id="referral_date" name="referral_date" type="date" value={form.referral_date} onChange={handleChange} className="input mb-2 w-full" required />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm text-gray-700 mb-1">Notes (optional)</label>
            <textarea id="notes" name="notes" placeholder="Additional notes" value={form.notes} onChange={handleChange} className="input mb-2 w-full" />
          </div>
        </div>

        {error && <div className="text-red-600 mb-2" role="alert">{error}</div>}
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary" disabled={loading}>Submit</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ReferralForm;
