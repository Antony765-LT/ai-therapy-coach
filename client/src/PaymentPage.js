// src/PaymentPage.jsx
import React, { useState } from "react";

const PaymentPage = ({ user }) => {
  const [method, setMethod] = useState("mpesa");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [txCode, setTxCode] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const submitConfirmation = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      setMessage("Please log in to submit payments.");
      return;
    }
    if (!amount) {
      setMessage("Enter amount");
      return;
    }

    try {
      setMessage("Submitting...");
      const res = await fetch("http://localhost:5000/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.email,
          method,
          amount: parseFloat(amount),
          phone,
          tx_code: txCode,
          note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Submitted! Awaiting admin approval.");
        setAmount("");
        setPhone("");
        setTxCode("");
        setNote("");
      } else {
        setMessage(data.error || "Failed to submit");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Choose a subscription method</h1>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Payment Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="p-2 rounded border">
          <option value="mpesa">Lipa na M-Pesa(instant)</option>
          <option value="paypal">PayPal (instant)</option>
          <option value="phone">Pay to Kenyan phone (MPESA/p2p)</option>
        </select>
      </div>

      {method === "mpesa" && (
        <div className="mb-4 bg-gray-50 p-4 rounded">
          <p className="mb-2 font-medium">Lipa na M-Pesa (Manual flow)</p>
          <ol className="list-decimal ml-5 text-sm mb-2">
            <li>Open your M-Pesa app or STK.</li>
            <li>Send amount to this phone: <strong>+254 YOUR_PHONE_NUMBER</strong></li>
            <li>Once done, copy the transaction code (e.g. ABC123XYZ) and paste below.</li>
          </ol>
        </div>
      )}

      {method === "phone" && (
        <div className="mb-4 bg-gray-50 p-4 rounded">
          <p className="mb-2 font-medium">Direct phone transfer</p>
          <p className="text-sm">Send to <strong>+254 716852843</strong> then Write down your transaction code  code below.</p>
        </div>
      )}

      {method === "paypal" && (
        <div className="mb-4 bg-gray-50 p-4 rounded">
          <p className="mb-2 font-medium">PayPal</p>
          <p className="text-sm mb-2">Click the PayPal button below (opens PayPal flow).</p>

          {/* PayPal buttons (requires adding script to index.html or load dynamically).
              Replace YOUR_PAYPAL_CLIENT_ID with your PayPal client id (sandbox for testing). */}
          <div id="paypal-button-container" style={{ marginTop: 10 }} />
          <small className="text-gray-500">Note: PayPal requires client integration. If you want, we can wire server-side capture too.</small>
        </div>
      )}

      {/* Generic confirmation form (works for mpesa/phone/paypal after capture) */}
      <form onSubmit={submitConfirmation} className="space-y-3 mt-4">
        <div>
          <label className="block text-sm">Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="p-2 border rounded w-full" />
        </div>

        <div>
          <label className="block text-sm">Phone (sender)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="p-2 border rounded w-full" placeholder="+2547..." />
        </div>

        <div>
          <label className="block text-sm">Transaction code </label>
          <input value={txCode} onChange={(e) => setTxCode(e.target.value)} className="p-2 border rounded w-full" />
        </div>

        

        <div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Submit Payment Confirmation</button>
        </div>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};

export default PaymentPage;
