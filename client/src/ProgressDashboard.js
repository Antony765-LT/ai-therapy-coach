import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const ProgressDashboard = ({ user }) => {
  const [moodData, setMoodData] = useState([]);
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email) return;

    const fetchInsights = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/insights/dashboard/${user.email}`
        );
        const data = await res.json();
        if (data.success) {
          setMoodData(data.data || []);
          setInsights(data.insights || "");
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user]);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading your progress...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 🔙 Return Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full transition duration-300 shadow-md"
      >
        ← Return to Dashboard
      </button>

      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
        🌿 AI Progress Dashboard
      </h1>

      {/* 🧠 AI Summary Card */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-indigo-600 mb-3">
          AI Emotional Insights
        </h2>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
          {insights || "No insights available yet."}
        </p>
      </div>

      {/* 📈 Mood Chart */}
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-indigo-600 mb-3">
          Mood Intensity Over Time
        </h2>
        {moodData.length === 0 ? (
          <p className="text-gray-500">No mood data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="created_at"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                angle={-25}
                textAnchor="end"
              />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="#4f46e5"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;
