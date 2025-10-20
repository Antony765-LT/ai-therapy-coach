import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function EmotionDashboard({ user }) {
  const [analytics, setAnalytics] = useState({ emotions: {}, timeline: [] });

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5000/api/chat/analytics/${user.email}`)
      .then(r => r.json())
      .then(d => setAnalytics(d.analytics || { emotions: {}, timeline: [] }))
      .catch(err => console.error(err));
  }, [user]);

  const emotions = analytics.emotions || {};
  const labels = Object.keys(emotions);
  const counts = labels.map(l => emotions[l]);

  const timelineLabels = (analytics.timeline || []).map(t => t.day);
  const timelineCounts = (analytics.timeline || []).map(t => t.cnt);

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, background: "#fff" }}>
      <h3>Emotional Insights</h3>
      <div style={{ height: 180 }}>
        <Bar data={{ labels, datasets: [{ label: 'Count', data: counts }] }} />
      </div>
      <div style={{ height: 180, marginTop: 12 }}>
        <Line data={{ labels: timelineLabels, datasets: [{ label: 'Messages per day', data: timelineCounts }] }} />
      </div>
    </div>
  );
}
