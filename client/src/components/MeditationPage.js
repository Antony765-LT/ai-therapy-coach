import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * MeditationPage
 * - Simple, dependency-free audio player for calming sounds + guided meditations.
 * - Tries to recommend a category based on user's most recent mood via /api/mood/history/:email
 *
 * Usage: <MeditationPage user={user} />
 * If you keep user in localStorage, the component will attempt to read it.
 */

const SOUNDS = {
  Nature: [
    {
      id: "nature-rain",
      title: "Gentle Rain",
      src: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_7e6f0c2d67.mp3?filename=soft-rain-ambient-11211.mp3",
      length: "8:00",
    },
    {
      id: "nature-waves",
      title: "Ocean Waves",
      src: "https://cdn.pixabay.com/download/audio/2022/02/21/audio_b09c0e9619.mp3?filename=ocean-waves-11098.mp3",
      length: "10:00",
    },
    {
      id: "nature-forest",
      title: "Forest Ambience",
      src: "https://cdn.pixabay.com/download/audio/2022/03/07/audio_58d1d0f3e1.mp3?filename=forest-birds-11239.mp3",
      length: "12:00",
    },
  ],
  Instrumental: [
    {
      id: "instr-piano",
      title: "Calm Piano",
      src: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_03a1e1e0b4.mp3?filename=relaxing-piano-11171.mp3",
      length: "6:00",
    },
    {
      id: "instr-harp",
      title: "Soft Harp",
      src: "https://cdn.pixabay.com/download/audio/2022/03/30/audio_84f0b37b3b.mp3?filename=soft-harp-11283.mp3",
      length: "7:00",
    },
  ],
  Guided: [
    {
      id: "guided-breathing",
      title: "2-minute Breathing",
      src: "https://cdn.pixabay.com/download/audio/2022/12/02/audio_7d3b6f4fc7.mp3?filename=short-guided-breathing-14187.mp3",
      length: "2:00",
    },
    {
      id: "guided-body",
      title: "Body Scan (5 min)",
      src: "https://cdn.pixabay.com/download/audio/2022/10/28/audio_9f0d9a4ad7.mp3?filename=body-scan-13542.mp3",
      length: "5:00",
    },
  ],
};

const categoryOrder = Object.keys(SOUNDS);

const MeditationPage = ({ user }) => {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [category, setCategory] = useState(categoryOrder[0]);
  const [playlist, setPlaylist] = useState(SOUNDS[categoryOrder[0]]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [recommended, setRecommended] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  // Load playlist when category changes
  useEffect(() => {
    setPlaylist(SOUNDS[category] || []);
    setIndex(0);
  }, [category]);

  // Apply volume and loop to audio element
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.loop = loop;
  }, [volume, loop]);

  // Auto-play when track changes (if already playing)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    if (isPlaying) {
      // small delay to ensure src update applied
      setTimeout(() => a.play().catch(() => setIsPlaying(false)), 50);
    }
  }, [index, playlist]);

  // Try to fetch a recommended category based on user's last mood
  useEffect(() => {
    const stored = user || JSON.parse(localStorage.getItem("user") || "null");
    if (!stored?.email) return;

    const fetchRecommendation = async () => {
      setLoadingRecommendation(true);
      try {
        // You have mood history endpoints — we will use /api/mood/history/:email
        const res = await fetch(`http://localhost:5000/api/mood/history/${stored.email}`);
        if (!res.ok) throw new Error("No mood history");
        const data = await res.json();
        // expected: { moods: [{ mood: 'happy', date_logged: '...' }, ...] } or similar
        const logs = data.moods || data.history || [];
        if (logs.length === 0) {
          setRecommended(null);
          setLoadingRecommendation(false);
          return;
        }
        const last = logs[logs.length - 1] || logs[0];
        const mood = (last.mood || last.emotion || "").toLowerCase();

        // Map moods to categories
        const map = {
          sad: "Guided",
          anxious: "Guided",
          stressed: "Guided",
          angry: "Guided",
          neutral: "Nature",
          calm: "Instrumental",
          relaxed: "Instrumental",
          happy: "Nature",
          joyful: "Nature",
          tired: "Instrumental",
        };

        const rec = map[mood] || "Nature";
        setRecommended(rec);
        // Apply recommendation gently (don't override if user already switched)
        setCategory((curr) => (curr === categoryOrder[0] ? rec : curr));
      } catch (err) {
        // ignore silently
        setRecommended(null);
      } finally {
        setLoadingRecommendation(false);
      }
    };

    fetchRecommendation();
  }, [user]);

  const currentTrack = playlist[index];

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    setIndex((i) => (i + 1) % playlist.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    setIndex((i) => (i - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const onEnded = () => {
    if (!loop) {
      // advance to next track when not looping
      if (index < playlist.length - 1) {
        setIndex(index + 1);
      } else {
        setIsPlaying(false);
      }
    }
  };

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <button
          onClick={() => navigate("/dashboard")}
          style={pageStyles.returnBtn}
          aria-label="Return to Dashboard"
        >
          ← Return to Dashboard
        </button>

        <h1 style={pageStyles.title}>🌿 Calming Sounds & Guided Meditation</h1>
        <p style={pageStyles.subtitle}>
          Choose a category, press play, and breathe. Use loop for continuous background sound.
        </p>
      </div>

      <div style={pageStyles.controlsRow}>
        <div>
          <label style={pageStyles.label}>Category</label>
          <div style={pageStyles.categories}>
            {categoryOrder.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  ...pageStyles.catBtn,
                  ...(category === c ? pageStyles.catBtnActive : {}),
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
            Recommended:{" "}
            {loadingRecommendation ? "checking..." : recommended ? recommended : "—"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={playPrev} style={pageStyles.squareBtn} aria-label="Previous">
            ⏮
          </button>
          <button onClick={togglePlay} style={pageStyles.playBtn} aria-label="Play/Pause">
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={playNext} style={pageStyles.squareBtn} aria-label="Next">
            ⏭
          </button>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <label style={pageStyles.labelSmall}>Loop</label>
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
              aria-label="Loop toggle"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <label style={pageStyles.labelSmall}>Volume</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div style={pageStyles.playerArea}>
        {playlist.length === 0 ? (
          <div style={pageStyles.empty}>No tracks in this category.</div>
        ) : (
          <div style={pageStyles.trackCard}>
            <div style={pageStyles.trackInfo}>
              <div style={pageStyles.trackTitle}>{currentTrack.title}</div>
              <div style={pageStyles.trackMeta}>{currentTrack.length}</div>
            </div>
            <div style={pageStyles.playlist}>
              {playlist.map((t, idx) => (
                <div
                  key={t.id}
                  onClick={() => setIndex(idx)}
                  style={{
                    ...pageStyles.playlistItem,
                    ...(idx === index ? pageStyles.playlistItemActive : {}),
                  }}
                >
                  <div>{t.title}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>{t.length}</div>
                </div>
              ))}
            </div>

            <audio
              ref={audioRef}
              src={currentTrack.src}
              onEnded={onEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>

      <div style={pageStyles.footerNote}>
        Tip: try a 5-minute session with a guided track when feeling anxious.
      </div>
    </div>
  );
};

const pageStyles = {
  container: {
    maxWidth: 980,
    margin: "32px auto",
    padding: 20,
    fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  header: { marginBottom: 18 },
  returnBtn: {
    background: "#eef2ff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer",
    marginBottom: 12,
  },
  title: { fontSize: 24, margin: 0, color: "#3730a3" },
  subtitle: { color: "#555", marginTop: 8 },
  controlsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
    marginBottom: 18,
  },
  label: { fontSize: 12, color: "#444", marginBottom: 6 },
  labelSmall: { fontSize: 11, color: "#666", marginBottom: 4 },
  categories: { display: "flex", gap: 8, flexWrap: "wrap" },
  catBtn: {
    background: "#fff",
    border: "1px solid #e6e6f0",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  catBtnActive: { background: "#4f46e5", color: "#fff", borderColor: "#4f46e5" },
  squareBtn: {
    background: "#fff",
    border: "1px solid #ddd",
    padding: 8,
    borderRadius: 8,
    cursor: "pointer",
    minWidth: 44,
  },
  playBtn: {
    background: "#4f46e5",
    border: "none",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 16,
    minWidth: 56,
  },
  playerArea: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(20,20,50,0.06)",
  },
  empty: { color: "#777", padding: 20 },
  trackCard: {},
  trackInfo: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  trackTitle: { fontSize: 18, fontWeight: 600 },
  trackMeta: { color: "#888", fontSize: 13 },
  playlist: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  playlistItem: { padding: "10px", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid transparent" },
  playlistItemActive: { background: "#eef2ff", borderColor: "#e0e7ff" },
  footerNote: { marginTop: 14, color: "#555" },
};

export default MeditationPage;
