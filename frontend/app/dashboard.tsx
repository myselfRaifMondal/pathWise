// app/dashboard.tsx
'use client';
import { Bar } from 'react-chartjs-2';

// Example static data
const data = {
  labels: ['Applied', 'In Progress', 'Offered', 'Rejected'],
  datasets: [
    {
      label: 'Applications',
      data: [12, 7, 3, 4],
      backgroundColor: 'rgba(37, 99, 235, 0.5)',
    },
  ],
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl mb-6">Dashboard Analytics</h2>
      <Bar data={data} />
    </div>
  );
}
