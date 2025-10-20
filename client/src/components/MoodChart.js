import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MoodChart = ({ userEmail }) => {
  const [moodData, setMoodData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [moodFilter, setMoodFilter] = useState("all");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // 📦 Fetch mood data
  useEffect(() => {
    if (!userEmail) return;
    fetch(`http://localhost:5000/api/mood/history/${userEmail}`)
      .then((res) => res.json())
      .then((data) => {
        setMoodData(data.history || []);
        setFilteredData(data.history || []);
      })
      .catch((err) => console.error("Failed to fetch mood data:", err));
  }, [userEmail]);

  // 🎛 Filter moods
  const handleFilterChange = (mood) => {
    setMoodFilter(mood);
    if (mood === "all") setFilteredData(moodData);
    else setFilteredData(moodData.filter((m) => m.emotion === mood));
  };

  // 🧠 Get AI mood summary
  const getMoodSummary = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/mood/insights/${userEmail}`);
      const data = await res.json();
      setSummary(data.summary || "No summary available yet.");
    } catch (err) {
      console.error("Error fetching mood summary:", err);
      setSummary("⚠️ Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: filteredData.map((m) => m.date),
    datasets: [
      {
        label: "Mood Intensity",
        data: filteredData.map((m) => m.intensity),
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54,162,235,0.2)",
        tension: 0.4,
        pointRadius: 5,
      },
    ],
  };

  return (
    <div style={styles.container}>
      <h3>🧭 Mood Analytics</h3>

      {/* Filter Controls */}
      <div style={styles.filters}>
        <label>Filter:</label>
        <select
          style={styles.select}
          value={moodFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="all">All Moods</option>
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="angry">Angry</option>
          <option value="anxious">Anxious</option>
          <option value="calm">Calm</option>
          <option value="stressed">Stressed</option>
        </select>

        <button onClick={getMoodSummary} style={styles.button}>
          🧠 Generate AI Summary
        </button>
      </div>

      {/* Chart */}
      {filteredData.length > 0 ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: "Mood Intensity Over Time" },
            },
          }}
        />
      ) : (
        <p style={{ color: "#888", textAlign: "center" }}>No mood data yet.</p>
      )}

      {/* Summary */}
      <div style={styles.summaryBox}>
        {loading ? (
          <p>🔄 Generating AI insights...</p>
        ) : summary ? (
          <p>{summary}</p>
        ) : (
          <p style={{ color: "#888" }}>No summary generated yet.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  filters: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "8px 14px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  summaryBox: {
    marginTop: "20px",
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    fontStyle: "italic",
  },
};

export default MoodChart;
