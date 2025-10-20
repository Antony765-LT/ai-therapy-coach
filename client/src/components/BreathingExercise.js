import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const BreathingExercise = () => {
  const [phase, setPhase] = useState("Ready");
  const [running, setRunning] = useState(false);
  const [bgSoundOn, setBgSoundOn] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!running) return;

    const cycle = [
      { label: "Inhale", duration: 4000 },
      { label: "Hold", duration: 3000 },
      { label: "Exhale", duration: 4000 },
      
    ];

    let i = 0;
    setPhase(cycle[i].label);

    const interval = setInterval(() => {
      i = (i + 1) % cycle.length;
      setPhase(cycle[i].label);
    }, cycle[i].duration);

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (bgSoundOn) audioRef.current?.play();
    else audioRef.current?.pause();
  }, [bgSoundOn]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌬️ Guided Breathing Exercise</h1>

      <div style={styles.circleContainer}>
        <div
          style={{
            ...styles.circle,
            transform:
              phase === "Inhale"
                ? "scale(1.3)"
                : phase === "Hold"
                ? "scale(1.1)"
                : "scale(0.9)",
            background:
              phase === "Exhale" 
                ? "linear-gradient(145deg, #8ec5fc, #e0c3fc)"
                : "linear-gradient(145deg, #a8edea, #fed6e3)",
          }}
        ></div>
      </div>

      <h2 style={styles.phaseText}>{phase}</h2>

      <div style={styles.controls}>
        {!running ? (
          <button style={styles.startBtn} onClick={() => setRunning(true)}>
            ▶️ Start
          </button>
        ) : (
          <button style={styles.stopBtn} onClick={() => setRunning(false)}>
            ⏹ Stop
          </button>
        )}

        <button
          style={styles.soundBtn}
          onClick={() => setBgSoundOn((prev) => !prev)}
        >
          {bgSoundOn ? "🔇 Mute Sound" : "🎵 Play Sound"}
        </button>
      </div>

      <Link to="/dashboard" style={styles.returnBtn}>
        ← Return to Dashboard
      </Link>

      {/* Background Sound */}
      <audio
        ref={audioRef}
        loop
        src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_9a8b7d0f5b.mp3?filename=relaxing-music-117475.mp3"
      />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #e0f7fa, #f1f8e9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "2rem",
    color: "#00796b",
    marginBottom: "30px",
  },
  circleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "30px",
  },
  circle: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    transition: "all 2s ease-in-out",
    boxShadow: "0 0 30px rgba(0,0,0,0.1)",
  },
  phaseText: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#004d40",
    marginBottom: "20px",
  },
  controls: {
    display: "flex",
    gap: "10px",
    marginBottom: "30px",
  },
  startBtn: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#4caf50",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  stopBtn: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#f44336",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  soundBtn: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#2196f3",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  returnBtn: {
    textDecoration: "none",
    backgroundColor: "#6c63ff",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
};

export default BreathingExercise;
