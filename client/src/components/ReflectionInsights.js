import React, { useState } from "react";

const ReflectionInsights = ({ userEmail }) => {
  const [reflection, setReflection] = useState("");
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeReflection = async () => {
    if (!reflection.trim()) return;
    setLoading(true);
    setInsight(null);

    try {
      const res = await fetch("http://localhost:5000/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userEmail, reflection }),
      });

      const data = await res.json();
      setInsight(data);
    } catch (err) {
      console.error("Error analyzing reflection:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🪞 Daily Reflection</h3>
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Write about your day, your emotions, or something that stood out..."
        style={styles.textarea}
      />
      <button onClick={analyzeReflection} style={styles.button} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Reflection"}
      </button>

      {insight && (
        <div style={styles.result}>
          <h4>🧠 AI Insight</h4>
          <p><strong>Mood:</strong> {insight.emotion}</p>
          <p><strong>Sentiment:</strong> {insight.sentiment}</p>
          <p><strong>Advice:</strong> {insight.tip}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "25px",
  },
  title: { marginBottom: "10px", color: "#333" },
  textarea: {
    width: "100%",
    height: "100px",
    borderRadius: "10px",
    padding: "10px",
    border: "1px solid #ccc",
    fontSize: "1em",
    resize: "none",
  },
  button: {
    marginTop: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 15px",
    cursor: "pointer",
  },
  result: {
    marginTop: "15px",
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "10px",
  },
};

export default ReflectionInsights;
