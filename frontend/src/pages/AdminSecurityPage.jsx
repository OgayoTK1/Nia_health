
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';

const AdminSecurityPage = () => {
  const [security, setSecurity] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSecurity();
  }, []);

  const fetchSecurity = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with actual API call for security status
      // const res = await adminAPI.getSecurityStatus();
      // setSecurity(res.data || {});
      setSecurity({ twofa: 'Enabled', encryption: 'Healthy', breaches: 'None', roles: 'Admin, Health Worker, Patient' });
    } catch (e) {
      setError('Failed to load security status');
    } finally {
      setLoading(false);
    }
  };

  const handleView2FA = () => {
    alert('2FA is currently ' + security.twofa);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Security & Compliance Overview</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p>2FA status, encryption health, breach alerts, role-based access mappings.</p>
          <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700" onClick={handleView2FA}>View 2FA Status</button>
        </div>
        {loading ? (
          <p>Loading security status...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">Encryption Health</h3>
            <ul className="mb-2">
              <li>Encryption: <span className="font-mono">{security.encryption}</span></li>
              <li>Breach Alerts: <span className="font-mono">{security.breaches}</span></li>
              <li>Roles: <span className="font-mono">{security.roles}</span></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSecurityPage;
