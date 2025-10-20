import React from "react";
import { Link } from "react-router-dom";

export default function IndexPage() {
  const styles = {
    container: {
      backgroundImage: `url("/bg.jpg")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      textShadow: "1px 1px 4px rgba(0,0,0,0.8)",
      fontFamily: "Arial, sans-serif",
    },
    button: {
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "12px 25px",
      margin: "10px",
      cursor: "pointer",
      fontSize: "16px",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 0,
    },
    content: {
      position: "relative",
      zIndex: 1,
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <h1>Welcome to AI Therapy Coach 🌿</h1>
        <p>Relax your mind, find peace, and track your wellness journey.</p>
        <div>
          <Link to="/login">
            <button style={styles.button}>Login</button>
          </Link>
          <Link to="/register">
            <button style={styles.button}>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

