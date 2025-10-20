// src/PayPalPayment.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Load PayPal client ID safely
const clientId =
  import.meta?.env?.VITE_PAYPAL_CLIENT_ID ||
  "AfV8_JnnJ_1yMW1bvwqDpXlPyPsWQWOa-9Rj68t78mAYifM9DPMl-BcMB00YJd6QMJvafffzVlGGMFeU";

console.log("✅ PayPal Client ID being used:", clientId);

export default function PayPalPayment() {
  const paypalRef = useRef();
  const navigate = useNavigate();
  const selectedPackage = JSON.parse(localStorage.getItem("selectedPackage"));
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!clientId) {
      console.error("❌ PayPal Client ID is missing! Check your .env file.");
      alert("PayPal is not configured properly.");
      return;
    }

    // ✅ Load the PayPal SDK script
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.addEventListener("load", renderPayPalButtons);
      script.addEventListener("error", () => {
        console.error("❌ Failed to load PayPal SDK script.");
        alert("Could not load PayPal. Try again later.");
      });
      script.addEventListener("error", () => {
  console.error("⚠️ PayPal SDK failed to load properly.");
  alert("PayPal may be slow to respond. Please refresh or try again.");
});
window.addEventListener("error", (event) => {
  if (event.message === "Script error.") {
    // Ignore cross-origin SDK errors from PayPal
    event.preventDefault();
    console.warn("⚠️ Ignored cross-origin PayPal SDK error.");
  }
});

      document.body.appendChild(script);
    } else {
      renderPayPalButtons();
    }

    async function renderPayPalButtons() {
      if (!window.paypal) return;

      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: selectedPackage?.name || "AI Therapy Package",
                  amount: {
                    currency_code: "USD",
                    value: selectedPackage?.price_usd || "5.00",
                  },
                },
              ],
            });
          },

          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            console.log("✅ Payment completed:", order);

            // ✅ Verify payment on backend
            const verifyRes = await fetch("http://localhost:5000/api/paypal/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderID: order.id,
                email: user?.email,
                package_name: selectedPackage?.name,
                duration: selectedPackage?.duration,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("✅ Payment successful! Redirecting...");
              navigate("/login");
            } else {
              alert("⚠️ Payment not verified: " + (verifyData.message || "Unknown error"));
            }
          },

          onError: (err) => {
            console.error("❌ PayPal error:", err);
            alert("Payment failed. Please try again later.");
          },
        })
        .render(paypalRef.current);
    }
  }, [clientId]);

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", textAlign: "center" }}>
      <h2>Pay with PayPal</h2>
      <p>
        Package: <b>{selectedPackage?.name}</b> — $
        {selectedPackage?.price_usd || "5.00"} USD
      </p>
      <div ref={paypalRef} style={{ marginTop: 20 }}></div>
    </div>
  );
}



