import React from 'react';

const AdminAuditPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <p className="mb-2">Review login attempts, patient record access, activity timestamps. Export logs for compliance.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Export Logs (CSV)</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        <p>Audit log entries will appear here.</p>
      </div>
    </div>
  );
};

export default AdminAuditPage;
