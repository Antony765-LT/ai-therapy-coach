
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ManualPayment = () => {
  const [txCode, setTxCode] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const selectedPackage = JSON.parse(localStorage.getItem("selectedPackage"));
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txCode || !phone) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/manual-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user?.email,
          tx_code: txCode,
          phone,
          method: "Pay Direct to Phone",
          amount: selectedPackage?.price,
          package_name: selectedPackage?.name,
          duration: selectedPackage?.duration,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Payment submitted! Await admin approval.");
        localStorage.setItem(
          "pendingPayment",
          JSON.stringify({
            package: selectedPackage,
            status: "pending",
            submittedAt: new Date().toISOString(),
          })
        );
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage("❌ " + (data.error || "Submission failed."));
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Network error. Try again.");
    }
  };

  const handleBack = () => {
    navigate("/packages");
  };

  return (
    <div style={styles.container}>
      <h2>Manual Payment</h2>
      <h5>Pay to this Number: +254 716852843</h5>
      {selectedPackage ? (
        <p>
          You selected: <b>{selectedPackage.name}</b> — Ksh{" "}
          {selectedPackage.price.toLocaleString()}
        </p>
      ) : (
        <p>No package selected.</p>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter Transaction Code"
          value={txCode}
          onChange={(e) => setTxCode(e.target.value)}
          style={styles.input}
        />
        <input
          type="tel"
          placeholder="Enter your Phone Number (e.g. 07XXXXXXXX)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />

        <div style={styles.buttonContainer}>
          <button type="button" style={styles.backButton} onClick={handleBack}>
            ← Back
          </button>
          <button type="submit" style={styles.payButton}>
            Submit Payment
          </button>
        </div>
      </form>

      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "auto",
    marginTop: 50,
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 20,
  },
  input: {
    padding: "10px",
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10,
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  payButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
};

export default ManualPayment;
