import React from 'react';

const AdminSettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <p className="mb-2">Backup management, API configs, scaling settings, sync intervals.</p>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Manage Backups</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h3 className="font-semibold mb-2">API Configuration</h3>
        <p>API keys and integration settings will appear here.</p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
