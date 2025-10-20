// UserChart.js
import React, { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const UserChart = () => {
  const [messagesData, setMessagesData] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgRes, moodRes, feedbackRes] = await Promise.all([
          axios.get("http://localhost:5000/api/stats/monthly-users"),
          axios.get("http://localhost:5000/api/stats/mood-distribution"),
          axios.get("http://localhost:5000/api/stats/feedback-trend"),
        ]);

        setMessagesData({
          labels: msgRes.data.months,
          datasets: [
            {
              label: "Messages per Month",
              data: msgRes.data.users,
              backgroundColor: "rgba(75,192,192,0.2)",
              borderColor: "rgba(75,192,192,1)",
              tension: 0.3,
            },
          ],
        });

        setMoodData({
          labels: moodRes.data.moods,
          datasets: [
            {
              label: "Mood Distribution",
              data: moodRes.data.counts,
              backgroundColor: [
                "rgba(255,99,132,0.6)",
                "rgba(54,162,235,0.6)",
                "rgba(255,206,86,0.6)",
                "rgba(75,192,192,0.6)",
                "rgba(153,102,255,0.6)",
              ],
            },
          ],
        });

        setFeedbackData({
          labels: feedbackRes.data.months,
          datasets: [
            {
              label: "Average Feedback",
              data: feedbackRes.data.avg_ratings,
              backgroundColor: "rgba(255,159,64,0.2)",
              borderColor: "rgba(255,159,64,1)",
              tension: 0.3,
            },
          ],
        });
      } catch (err) {
        console.error("Chart fetch error:", err);
        setError("Failed to load chart data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "" },
    },
  };

  if (loading) return <p style={styles.loading}>⏳ Loading charts...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.chartBox}>
        <h3>Messages per Month</h3>
        {messagesData && messagesData.labels?.length > 0 ? (
          <Line data={messagesData} options={chartOptions} />
        ) : (
          <p style={styles.empty}>No message data available yet.</p>
        )}
      </div>

      <div style={styles.chartBox}>
        <h3>Mood Distribution</h3>
        {moodData && moodData.labels?.length > 0 ? (
          <Pie data={moodData} options={chartOptions} />
        ) : (
          <p style={styles.empty}>No mood data available yet.</p>
        )}
      </div>

      <div style={styles.chartBox}>
        <h3>Average Feedback</h3>
        {feedbackData && feedbackData.labels?.length > 0 ? (
          <Line data={feedbackData} options={chartOptions} />
        ) : (
          <p style={styles.empty}>No feedback data available yet.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "90%",
    margin: "20px auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  chartBox: {
    flex: "1 1 300px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  loading: { textAlign: "center", color: "#007bff", marginTop: "30px" },
  error: { textAlign: "center", color: "red", marginTop: "30px" },
  empty: { color: "#777", textAlign: "center", fontStyle: "italic" },
};

export default UserChart;



