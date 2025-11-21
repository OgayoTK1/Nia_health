import React from 'react';

const AdminSecurityPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Security & Compliance Overview</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <p className="mb-2">2FA status, encryption health, breach alerts, role-based access mappings.</p>
        <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">View 2FA Status</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h3 className="font-semibold mb-2">Encryption Health</h3>
        <p>Encryption status and breach alerts will appear here.</p>
      </div>
    </div>
  );
};

export default AdminSecurityPage;
