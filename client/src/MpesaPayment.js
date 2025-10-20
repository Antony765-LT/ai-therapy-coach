// src/MpesaPayment.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MpesaPayment() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [checkoutId, setCheckoutId] = useState(null);
  const [polling, setPolling] = useState(false);
  const navigate = useNavigate();
  const selectedPackage = JSON.parse(localStorage.getItem("selectedPackage"));
  const user = JSON.parse(localStorage.getItem("user"));

  const startPolling = (id) => {
    setPolling(true);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`http://localhost:5000/api/mpesa/status?checkoutId=${id}`);
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(interval);
          setMessage("✅ Payment received! Redirecting...");
          setPolling(false);
          setTimeout(() => navigate("/dashboard"), 2500);
        } else if (attempts >= 18) {
          clearInterval(interval);
          setPolling(false);
          setMessage("⏱ Payment not confirmed yet. You can log in later once payment completes.");
        } else {
          setMessage("⌛ Waiting for payment confirmation...");
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setPolling(false);
        setMessage("⚠️ Error checking payment status.");
      }
    }, 10000);
  };

  const handlePay = async () => {
    if (!phone) {
      setMessage("Enter phone (254...)");
      return;
    }
    setMessage("Sending STK Push to your phone...");
    try {
      const res = await fetch("http://localhost:5000/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: selectedPackage.price,
          package_name: selectedPackage.name,
          duration: selectedPackage.duration,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const id = data.data?.CheckoutRequestID;
        setCheckoutId(id);
        setMessage("✅ STK Push sent. Complete it on your phone...");
        startPolling(id);
      } else {
        setMessage("❌ " + (data.error || "STK push failed"));
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Network/server error.");
    }
  };

  const handleBack = () => {
    navigate("/packages");
  };

  return (
    <div style={{ maxWidth: 480, margin: "30px auto", textAlign: "center" }}>
      <h2>Pay with Lipa na M-Pesa</h2>
      <p>
        Package: <b>{selectedPackage?.name} — Ksh {selectedPackage?.price?.toLocaleString()}</b>
      </p>

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your phone number e.g. +2547XXXXXXXX"
        style={{ padding: 8, width: "100%", marginBottom: 12 }}
        disabled={polling}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <button
          onClick={handleBack}
          disabled={polling}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <button
          onClick={handlePay}
          disabled={polling}
          style={{
            flex: 1,
            padding: "10px 16px",
            background: polling ? "#ccc" : "#0a7c3f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: polling ? "not-allowed" : "pointer",
          }}
        >
          {polling ? "Processing..." : "Pay Now"}
        </button>
      </div>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
