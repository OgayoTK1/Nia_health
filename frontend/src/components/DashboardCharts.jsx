import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const DashboardCharts = ({ analytics }) => {
  if (!analytics) return <div>Loading analytics...</div>;

  // Example: Referral Success Rate
  const referralData = {
    labels: analytics.referralLabels || [],
    datasets: [
      {
        label: 'Referrals',
        data: analytics.referralData || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Example: Appointment Volumes
  const appointmentData = {
    labels: analytics.appointmentLabels || [],
    datasets: [
      {
        label: 'Appointments',
        data: analytics.appointmentData || [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Example: User Growth
  const userGrowthData = {
    labels: analytics.userGrowthLabels || [],
    datasets: [
      {
        label: 'User Growth',
        data: analytics.userGrowthData || [],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-2">Referral Success Rate</h3>
        <Bar data={referralData} />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-2">Appointment Volumes</h3>
        <Line data={appointmentData} />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-2">User Growth</h3>
        <Pie data={userGrowthData} />
      </div>
    </div>
  );
};

export default DashboardCharts;
