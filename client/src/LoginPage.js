import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("❌ Enter email and password");
      return;
    }

    try {
      setMessage("🔍 Checking credentials...");
      const loginRes = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (!loginData.success) {
        setMessage("❌ Invalid email or password");
        return;
      }

      // ✅ Save logged-in user
      localStorage.setItem("user", JSON.stringify(loginData.user));
      setMessage("✅ Login successful! Checking your subscription...");

      // 🔍 Check active package
      const packageRes = await fetch("http://localhost:5000/api/check-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const packageData = await packageRes.json();

      if (packageData.success && packageData.hasPackage) {
        setMessage("✅ Active package found! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage("⚠️ No active package. Redirecting to packages...");
        setTimeout(() => navigate("/packages"), 1500);
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("❌ Server error, try again later.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <div style={styles.container}>
          <h2 style={{ color: "white" }}>Login</h2>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Login
            </button>
          </form>
          {message && <p style={{ color: "white", marginTop: 10 }}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundImage: `url("/images/login-bg.jpg")`, // 👈 put your image in /public/images/login-bg.jpg
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    maxWidth: 400,
    padding: 30,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(8px)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 20,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "none",
    outline: "none",
  },
  button: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default LoginPage;
 