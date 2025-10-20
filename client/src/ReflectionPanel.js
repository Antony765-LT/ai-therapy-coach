import React, { useState } from "react";

export default function ReflectionPanel({ sessionId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!sessionId) return alert("Select a session first.");
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/summary/${sessionId}`, { method: "POST" });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, background: "#fff", marginTop: 12 }}>
      <h4>Reflection</h4>
      <button onClick={generate} disabled={loading} style={{ padding: 8, borderRadius: 6, background: "#4b7bec", color: "#fff" }}>
        {loading ? "Thinking..." : "Generate Session Summary"}
      </button>

      {summary && (
        <div style={{ marginTop: 12 }}>
          <h5>Summary</h5>
          <p>{summary.summary}</p>
          <h5>Actions</h5>
          <ul>{(summary.actions || []).map((a,i) => <li key={i}>{a}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
