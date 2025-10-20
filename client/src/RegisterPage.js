import React, { useState } from "react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("⏳ Registering...");

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Registered successfully! You can now log in.");
      } else {
        setMessage(`❌ ${data.error || "Registration failed"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Try again later.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.card}>
          <h2 style={{ marginBottom: "1rem" }}>Create an Account</h2>
          <form onSubmit={handleRegister} style={styles.form}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
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
              Register
            </button>
          </form>
          {message && <p style={styles.message}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

// 💅 Inline CSS styles
const styles = { 
  container: {
    height: "100vh",
    width: "100%",
    backgroundImage: "url('/images/background-register.jpg')", // 🖼️ your image path
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // dark overlay
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "30px 40px",
    borderRadius: "12px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
  },
};

export default RegisterPage;

