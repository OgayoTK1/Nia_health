
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api';

const AdminAuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getAuditLogs();
      setLogs(res.data || []);
    } catch (e) {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Simple CSV export
    const csv = logs.map(log => Object.values(log).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p>Review login attempts, patient record access, activity timestamps. Export logs for compliance.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleExport}>Export Logs (CSV)</button>
        </div>
        {loading ? (
          <p>Loading audit logs...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-blue-50">
                {logs[0] && Object.keys(logs[0]).map((key) => (
                  <th key={key} className="p-2">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} className="border-b">
                  {Object.values(log).map((val, i) => (
                    <td key={i} className="p-2">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAuditPage;
