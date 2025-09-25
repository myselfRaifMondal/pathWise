"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const data = {
    labels: ["Applied", "In Progress", "Offered", "Rejected"],
    datasets: [
      {
        label: "Applications",
        data: [12, 7, 3, 4],
        backgroundColor: "rgba(37, 99, 235, 0.5)",
      },
    ],
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">
        Dashboard Analytics
      </h2>
      <Bar data={data} />
    </div>
  );
}
