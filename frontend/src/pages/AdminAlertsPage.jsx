import React from 'react';

const AdminAlertsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Alerts & Communication Management</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <p className="mb-2">Create, schedule, and monitor health alerts. Choose SMS/Email, review delivery status, manage templates.</p>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create New Alert</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h3 className="font-semibold mb-2">Recent Alerts</h3>
        <p>Alert history and delivery status will appear here.</p>
      </div>
    </div>
  );
};

export default AdminAlertsPage;
