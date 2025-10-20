// AIMoodInsights.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const AIMoodInsights = ({ userEmail }) => {
  const [insights, setInsights] = useState({ summary: "", suggestion: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    axios
      .get(`http://localhost:5000/api/stats/ai-insights/${userEmail}`)
      .then((res) => {
        setInsights(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching AI insights:", err);
        setLoading(false);
      });
  }, [userEmail]);

  if (loading) return <p>Loading your AI insights...</p>;

  return (
    <div className="p-4 bg-white shadow-md rounded-xl mt-6">
      <h2 className="text-xl font-semibold text-teal-700 mb-2">
        AI Mood Insights
      </h2>
      <p className="text-gray-700 mb-2">
        <strong>Summary:</strong> {insights.summary}
      </p>
      <p className="text-gray-700">
        <strong>Suggestion:</strong> {insights.suggestion}
      </p>
    </div>
  );
};

export default AIMoodInsights;
