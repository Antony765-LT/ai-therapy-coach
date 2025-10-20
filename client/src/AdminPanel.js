// src/AdminPanel.jsx
import React, { useState, useEffect } from "react";

const AdminPanel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [payments, setPayments] = useState([]);
  const [msg, setMsg] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token);
        setToken(data.token);
        setMsg("Logged in");
      } else {
        setMsg("Login failed");
      }
    } catch (err) {
      setMsg("Network error");
    }
  };

  const fetchPending = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/payments/pending", {
        headers: { "x-admin-token": token },
      });
      const data = await res.json();
      if (data.success) setPayments(data.payments || []);
      else setMsg(data.error || "Failed to fetch");
    } catch (err) {
      setMsg("Network error");
    }
  };

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  const approve = async (id) => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
      } else {
        setMsg(data.error || "Approve failed");
      }
    } catch (err) {
      setMsg("Network error");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
    setPayments([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!token ? (
        <form onSubmit={login} className="space-y-3">
          <h2 className="text-xl font-bold">Admin Login</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="p-2 border rounded w-full" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" className="p-2 border rounded w-full" />
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">Login</button>
          {msg && <p className="mt-2">{msg}</p>}
        </form>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pending Payments</h2>
            <div>
              <button onClick={fetchPending} className="px-3 py-1 bg-green-500 text-white rounded mr-2">Refresh</button>
              <button onClick={logout} className="px-3 py-1 bg-gray-500 text-white rounded">Logout</button>
            </div>
          </div>

          {payments.length === 0 ? <p>No pending payments.</p> : (
            <table className="w-full border">
              <thead>
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Method</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Tx Code</th>
                  <th className="p-2 border">When</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="p-2 border text-center">{p.id}</td>
                    <td className="p-2 border">{p.user_email}</td>
                    <td className="p-2 border">{p.method}</td>
                    <td className="p-2 border">{p.amount}</td>
                    <td className="p-2 border">{p.phone}</td>
                    <td className="p-2 border">{p.tx_code}</td>
                    <td className="p-2 border">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="p-2 border text-center">
                      <button onClick={() => approve(p.id)} className="px-2 py-1 bg-blue-600 text-white rounded">Approve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {msg && <p className="mt-3">{msg}</p>}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
