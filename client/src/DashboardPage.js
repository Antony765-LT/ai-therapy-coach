import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import MoodChart from "./components/MoodChart";
import MoodLogger from "./components/MoodLogger";
import ReflectionInsights from "./components/ReflectionInsights";
import VoiceChat from "./VoiceChat";

// Register ChartJS components
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

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("charts");

  const [monthlyUsers, setMonthlyUsers] = useState({ labels: [], datasets: [] });
  const [moodDistribution, setMoodDistribution] = useState({ labels: [], datasets: [] });
  const [feedbackTrend, setFeedbackTrend] = useState({ labels: [], datasets: [] });

  // ✅ Load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) navigate("/login");
    else setUser(storedUser);
  }, [navigate]);

  // 🧠 Load sessions
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5000/api/chat/sessions/${user.email}`)
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch((err) => console.error("Failed to load chat sessions:", err));
  }, [user]);

  // 💬 Load messages
  const loadMessages = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/history/${sessionId}`);
      const data = await res.json();
      setMessages(data.history || []);
      setCurrentSession(sessionId);
      setView("chat");
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  // 🆕 Start new session
  const startNewSession = async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/chat/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user.email }),
      });
      const data = await res.json();
      setCurrentSession(data.session_id);
      setMessages([]);
      setView("chat");

      const updatedSessions = await fetch(`http://localhost:5000/api/chat/sessions/${user.email}`);
      const newSessions = await updatedSessions.json();
      setSessions(newSessions.sessions || []);
    } catch (err) {
      console.error("Failed to start new session:", err);
    }
  };

  

  // 📨 Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;

    const userMessage = { sender: "user", message: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          user_email: user.email,
          session_id: currentSession,
        }),
      });
      const data = await res.json();
      const aiMessage = {
        sender: "ai",
        message: data.reply,
        emotion: data.emotion || "neutral",
        tip: data.calming_tip || "",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", message: "⚠️ Failed to get AI response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 💖 Mood emojis
  const getMoodEmoji = (emotion) => {
    const moodMap = {
      happy: "😊",
      joyful: "😄",
      calm: "😌",
      relaxed: "🌿",
      neutral: "😌",
      sad: "😔",
      angry: "😠",
      anxious: "😰",
      stressed: "😣",
      tired: "🥱",
      excited: "🤩",
      lonely: "😢",
      hopeful: "🌈",
      confused: "😕",
    };
    return moodMap[emotion?.toLowerCase()] || "🤖";
  };

  // 📊 Load charts
  useEffect(() => {
    fetch("http://localhost:5000/api/stats/monthly-users")
      .then((res) => res.json())
      .then((data) => {
        const labels = data.months || [];
        const values = data.users || [];
        setMonthlyUsers({
          labels,
          datasets: labels.length
            ? [
                {
                  label: "Messages per Month",
                  data: values,
                  fill: true,
                  backgroundColor: "rgba(75,192,192,0.2)",
                  borderColor: "rgba(75,192,192,1)",
                  tension: 0.3,
                },
              ]
            : [],
        });
      });

    fetch("http://localhost:5000/api/stats/mood-distribution")
      .then((res) => res.json())
      .then((data) => {
        const labels = data.moods || [];
        const values = data.counts || [];
        setMoodDistribution({
          labels,
          datasets: labels.length
            ? [
                {
                  label: "Moods",
                  data: values,
                  backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                  ],
                },
              ]
            : [],
        });
      });

    fetch("http://localhost:5000/api/stats/feedback-trend")
      .then((res) => res.json())
      .then((data) => {
        const labels = data.months || [];
        const values = data.avg_ratings || [];
        setFeedbackTrend({
          labels,
          datasets: labels.length
            ? [
                {
                  label: "Average Rating",
                  data: values,
                  fill: true,
                  backgroundColor: "rgba(255,159,64,0.2)",
                  borderColor: "rgba(255,159,64,1)",
                  tension: 0.3,
                },
              ]
            : [],
        });
      });
  }, []);

  if (!user) return null;

  // ✅ Navigate to Buy New Package
  const handleBuyNewPackage = () => {
    navigate("/packages");
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>🧠 Therapy Sessions</h2>
        <button style={styles.newSessionBtn} onClick={startNewSession}>
          ➕ Start New Session
        </button>

        <div style={styles.sessionList}>
          {sessions.length === 0 && <p style={{ color: "#999" }}>No past sessions yet</p>}
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => loadMessages(s.id)}
              style={{
                ...styles.sessionItem,
                backgroundColor: currentSession === s.id ? "#007bff" : "#f1f1f1",
                color: currentSession === s.id ? "#fff" : "#000",
              }}
            >
              {s.title || `Session #${s.id}`}
            </div>
          ))}
        </div>

        {/* 🧭 Navigation */}
        <Link to="/progress-dashboard" style={styles.dashboardLink}>
          📊 View AI Progress Dashboard
        </Link>

        <Link to="/calming-sounds" style={styles.dashboardLink}>
          🎵 Calming Sounds
        </Link>

        <Link to="/breathing-exercise" style={styles.dashboardLink}>
          🌬️ Guided Breathing Exercise
        </Link>

        <Link to="/guided-meditation" style={styles.dashboardLink}>
          🧘 Guided Meditation
        </Link>

        <Link to="/daily-affirmations" style={styles.dashboardLink}>
          🌞 Daily Affirmations
        </Link>

        <Link to="/mindful-games" style={styles.dashboardLink}>
          🎮 Mindful Games
        </Link>

        <button
          onClick={() => navigate("/game-focus")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700 transition"
        >
          🎯 Focus Dot
        </button>

        <Link to="/colorflow" style={styles.dashboardLink}>
          🎨 ColorFlow Game
        </Link>

        {/* 🛒 New "Buy New Package" Tab */}
        <Link to="/mpesa-payment" style={styles.dashboardLink}>
  💰 Lipa na M-Pesa
</Link>

<Link to="/paypal-payment" style={styles.dashboardLink}>
  💳 Pay with PayPal
</Link>


        <button
          style={styles.toggleBtn}
          onClick={() => setView(view === "charts" ? "chat" : "charts")}
        >
          {view === "charts" ? "💬 Chat View" : "📈 Charts View"}
        </button>
      </div>

      {/* Main Area */}
      <div style={styles.mainArea}>
        <h2 style={styles.title}>Welcome, {user.name || user.email}!</h2>

        {/* 📄 Download Progress Report */}
        <button
          onClick={() => window.open(`http://localhost:5000/api/report/${user.email}`)}
          style={styles.reportBtn}
        >
          📄 Download Progress Report
        </button>

        {/* 📥 Download Chat Transcript */}
        {currentSession && (
          <button
            onClick={async () => {
              const res = await fetch(`http://localhost:5000/api/chat/export/${currentSession}`);
              const data = await res.json();
              if (data.pdf) {
                const link = document.createElement("a");
                link.href = data.pdf;
                link.download = `therapy_chat_${currentSession}.pdf`;
                link.click();
              } else {
                alert("❌ Failed to generate PDF.");
              }
            }}
            style={styles.downloadBtn}
          >
            📥 Download Chat as PDF
          </button>
        )}

        {/* Charts View */}
        {view === "charts" && (
          <div style={styles.chartsContainer}>
            <MoodLogger userEmail={user.email} onLog={() => window.location.reload()} />
            <ReflectionInsights userEmail={user.email} />

            {monthlyUsers.labels.length > 0 && (
              <div style={styles.chart}>
                <h4>Monthly Messages</h4>
                <Line data={monthlyUsers} />
              </div>
            )}

            {moodDistribution.labels.length > 0 && (
              <div style={styles.chart}>
                <h4>Mood Distribution</h4>
                <Pie data={moodDistribution} />
              </div>
            )}

            {feedbackTrend.labels.length > 0 && (
              <div style={styles.chart}>
                <h4>Feedback Trend</h4>
                <Bar
                  data={feedbackTrend}
                  options={{ scales: { y: { beginAtZero: true, max: 5 } } }}
                />
              </div>
            )}

            <div style={styles.chart}>
              <h4>Mood Summary (Weekly)</h4>
              <MoodChart />
            </div>
          </div>
        )}

        {/* Chat View */}
        {view === "chat" && (
          <>
            <div style={styles.chatBox}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.message,
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    backgroundColor: msg.sender === "user" ? "#007bff" : "#e5e5ea",
                    color: msg.sender === "user" ? "#fff" : "#000",
                  }}
                >
                  {msg.message}
                  {msg.sender === "ai" && msg.emotion && (
                    <div style={styles.emotion}>
                      <em>Detected Mood:</em> {getMoodEmoji(msg.emotion)}{" "}
                      <span style={styles.mood}>{msg.emotion}</span>
                      {msg.tip && <div style={styles.tip}>💡 {msg.tip}</div>}
                    </div>
                  )}
                </div>
              ))}
              {loading && <div style={styles.loading}>AI is typing...</div>}
            </div>

            {currentSession && (
              <form onSubmit={sendMessage} style={styles.inputForm}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  style={styles.input}
                />
                <button type="submit" style={styles.sendButton}>
                  Send
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// 💅 Styles
const styles = {
  container: { display: "flex", minHeight: "100vh", backgroundColor: "#f5f6fa" },
  sidebar: {
    width: "25%",
    backgroundColor: "#fff",
    padding: "20px",
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
  },
  sidebarTitle: { marginBottom: "15px", color: "#333" },
  newSessionBtn: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  buyButton: {
    padding: "10px",
    backgroundColor: "#ff9800",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
  dashboardLink: {
    textDecoration: "none",
    backgroundColor: "#6c63ff",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
    marginTop: "10px",
    fontWeight: "bold",
  },
  sessionList: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sessionItem: {
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
  },
  toggleBtn: {
    marginTop: "20px",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
  reportBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6c63ff",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "20px",
    alignSelf: "flex-start",
  },
  downloadBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#00b894",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "20px",
    alignSelf: "flex-start",
  },
  mainArea: {
    flex: 1,
    padding: "30px",
    display: "flex",
    flexDirection: "column",
  },
  title: { marginBottom: "10px" },
  chartsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  chart: {
    flex: 1,
    minWidth: "300px",
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    backgroundColor: "#fafafa",
  },
  message: {
    padding: "10px 15px",
    borderRadius: "20px",
    maxWidth: "70%",
  },
  emotion: { fontSize: "0.85em", marginTop: "5px", color: "#333" },
  mood: { fontWeight: "bold", marginLeft: "4px" },
  tip: {
    color: "#2e7d32",
    background: "#f0fff0",
    padding: "5px",
    borderRadius: "6px",
    marginTop: "6px",
    fontSize: "0.85em",
  },
  inputForm: { display: "flex", gap: "10px" },
  input: {
    flex: 1,
    padding: "10px 15px",
    borderRadius: "20px",
    border: "1px solid #ccc",
  },
  sendButton: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  loading: { fontStyle: "italic", color: "#888" },
};

export default DashboardPage;
