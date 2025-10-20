import React, { useState } from "react";

const MoodLogger = ({ userEmail, onLog }) => {
  const [mood, setMood] = useState("");

  const moods = [
    "Happy 😊",
    "Calm 😌",
    "Sad 😔",
    "Angry 😠",
    "Anxious 😰",
    "Excited 🤩",
    "Tired 🥱",
    "Lonely 😢",
  ];

  const logMood = async () => {
    if (!mood) return alert("Please select your mood first!");

    const moodText = mood.split(" ")[0]; // e.g. "Happy 😊" → "Happy"

    await fetch("http://localhost:5000/api/mood/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: userEmail, mood: moodText }),
    });

    alert("✅ Mood logged successfully!");
    setMood("");
    onLog(); // Refresh parent chart
  };

  return (
    <div style={styles.container}>
      <h3>Log Your Mood for Today</h3>
      <select
        style={styles.select}
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      >
        <option value="">-- Select Mood --</option>
        {moods.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <button style={styles.button} onClick={logMood}>
        Save Mood
      </button>
    </div>
  );
};

const styles = {
  container: {
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
    marginBottom: "20px",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginRight: "10px",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default MoodLogger;
