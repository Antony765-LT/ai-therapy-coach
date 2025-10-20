import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import ProgressDashboard from "./ProgressDashboard";
import MeditationPage from "./components/MeditationPage";
import CalmingSounds from "./components/CalmingSounds";
import BreathingExercise from "./components/BreathingExercise";
import GuidedMeditation from "./components/GuidedMeditation";
import DailyAffirmations from "./DailyAffirmations";
import MindfulGames from "./MindfulGames";
import GameMemory from "./GameMemory";
import GameFocusDot from "./GameFocusDot";
import ColorFlowGame from "./components/ColorFlowGame";
import PaymentPage from "./PaymentPage";
import AdminPanel from "./AdminPanel";
import ManualPayment from "./ManualPayment";
import PackagesPage from "./PackagesPage";
import MpesaPayment from "./MpesaPayment";
import PayPalPayment from "./PayPalPayment";
import IndexPage from "./IndexPage"; // ✅ new import

const currentUser = JSON.parse(localStorage.getItem("user")) || null;

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  React.useEffect(() => {
    // ✅ Only redirect to login if not on the home/index page
    if (
      !user &&
      window.location.pathname !== "/" &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register" &&
      window.location.pathname !== "/admin"
    ) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>AI Therapy Coach</h1>

      {/* Navigation bar */}
      {!user ? (
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/">
            <button style={{ ...styles.button, backgroundColor: "#28a745" }}>Home</button>
          </Link>
          <Link to="/register">
            <button style={styles.button}>Register</button>
          </Link>
          <Link to="/login">
            <button style={styles.button}>Login</button>
          </Link>
          <Link to="/admin">
            <button style={{ ...styles.button, backgroundColor: "#6f42c1" }}>Admin</button>
          </Link>
        </nav>
      ) : (
        <nav style={{ marginBottom: "20px" }}>
          <button style={styles.button} onClick={handleLogout}>
            Logout
          </button>
        </nav>
      )}

      <Routes>
        {/* ✅ New Index route */}
        <Route path="/" element={<IndexPage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/progress-dashboard" element={<ProgressDashboard user={user} />} />
        <Route path="/meditation" element={<MeditationPage user={user} />} />
        <Route path="/calming-sounds" element={<CalmingSounds />} />
        <Route path="/breathing-exercise" element={<BreathingExercise />} />
        <Route path="/guided-meditation" element={<GuidedMeditation />} />
        <Route path="/daily-affirmations" element={<DailyAffirmations />} />
        <Route path="/mindful-games" element={<MindfulGames />} />
        <Route path="/game-memory" element={<GameMemory />} />
        <Route path="/game-focus" element={<GameFocusDot />} />
        <Route path="/colorflow" element={<ColorFlowGame />} />
        <Route path="/payments" element={<PaymentPage user={currentUser} />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/manual-payment" element={<ManualPayment />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/mpesa-payment" element={<MpesaPayment />} />
        <Route path="/paypal-payment" element={<PayPalPayment />} />

        {/* Fallback route */}
        <Route path="*" element={<h2>Page not found</h2>} />
      </Routes>
    </div>
  );
}

const styles = {
  button: {
    margin: "0 10px",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
};

export default App;

