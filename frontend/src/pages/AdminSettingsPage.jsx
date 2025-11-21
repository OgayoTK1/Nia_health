
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      // Replace with actual API call for settings
      // const res = await adminAPI.getSettings();
      // setSettings(res.data || {});
      setSettings({ sendgrid: 'SG.xxxxx', twilio: 'ACxxxx', backups: 'Daily', scaling: 'Regional' });
    } catch (e) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => {
    // Implement backup management logic here
    alert('Backup started!');
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p>Backup management, API configs, scaling settings, sync intervals.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleBackup}>Manage Backups</button>
        </div>
        {loading ? (
          <p>Loading settings...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div>
            <h3 className="font-semibold mb-2">API Configuration</h3>
            <ul className="mb-2">
              <li>SendGrid Key: <span className="font-mono">{settings.sendgrid}</span></li>
              <li>Twilio SID: <span className="font-mono">{settings.twilio}</span></li>
              <li>Backups: <span className="font-mono">{settings.backups}</span></li>
              <li>Scaling: <span className="font-mono">{settings.scaling}</span></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
