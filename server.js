// ==========================
// 🌿 AI THERAPY COACH SERVER
// ==========================

import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { jsPDF } from "jspdf";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import rateLimit from "express-rate-limit";


dotenv.config();

console.log("✅ Admin Email Loaded:", process.env.ADMIN_EMAIL);
console.log("✅ Admin Password Loaded:", process.env.ADMIN_PASSWORD);


// ✅ App initialization
const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));


// ✅ Database setup
const db = new Database("./therapycoach.db");


// ✅ OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("🧠 OpenAI Key Loaded:", process.env.OPENAI_API_KEY ? "✅ Yes" : "❌ No");

// ==========================
// 🧩 AUTH ROUTES
// ==========================

// 🧍 Register
app.post("/api/register", async (req, res) => {
  const { name = "Anonymous", email, password, phone = "N/A" } = req.body;

  if (!email || !password) {
    return res.json({ success: false, error: "Missing fields" });
  }

  try {
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.json({ success: false, error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    db.prepare(
      "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)"
    ).run(name, email, hashed, phone);

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});




// 🔐 Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ success: false, message: "Incorrect password" });

  res.json({
    success: true,
    user: { name: user.name, email: user.email },
  });
});

// ==========================
// 💬 CHAT ROUTES
// ==========================

// Start chat session
app.post("/api/chat/start-session", (req, res) => {
  const { user_email } = req.body;
  const result = db
    .prepare("INSERT INTO chat_sessions (user_email, created_at) VALUES (?, datetime('now'))")
    .run(user_email);
  res.json({ session_id: result.lastInsertRowid });
});

// Fetch all sessions
app.get("/api/chat/sessions/:email", (req, res) => {
  const { email } = req.params;
  const sessions = db
    .prepare("SELECT * FROM chat_sessions WHERE user_email = ? ORDER BY id DESC")
    .all(email);
  res.json({ sessions });
});

// Fetch chat history
app.get("/api/chat/history/:session_id", (req, res) => {
  const { session_id } = req.params;
  const history = db
    .prepare("SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC")
    .all(session_id);
  res.json({ history });
});

// Chat with AI
app.post("/api/chat", async (req, res) => {
  const { message, user_email, session_id } = req.body;

  try {
    db.prepare("INSERT INTO messages (session_id, sender, message, timestamp) VALUES (?, ?, ?, datetime('now'))")
      .run(session_id, "user", message);

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a supportive AI therapist offering calm and empathetic advice." },
        { role: "user", content: message },
      ],
    });

    const aiReply = aiResponse.choices[0].message.content || "I'm here for you.";
    const emotion = "neutral";
    const calming_tip = "Remember to take deep breaths and be kind to yourself.";

    db.prepare("INSERT INTO messages (session_id, sender, message, timestamp) VALUES (?, ?, ?, datetime('now'))")
      .run(session_id, "ai", aiReply);

    res.json({ reply: aiReply, emotion, calming_tip });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

// ==========================
// 🌈 MOOD LOGGING ROUTES
// ==========================

// Add mood
app.post("/api/mood", (req, res) => {
  const { user_email, mood, intensity } = req.body;
  db.prepare(
    "INSERT INTO mood_logs (user_email, mood, intensity, created_at) VALUES (?, ?, ?, datetime('now'))"
  ).run(user_email, mood, intensity);
  res.json({ success: true });
});

// Get moods
app.get("/api/mood/:email", (req, res) => {
  const { email } = req.params;
  const moods = db
    .prepare("SELECT * FROM mood_logs WHERE user_email = ? ORDER BY created_at DESC LIMIT 30")
    .all(email);
  res.json({ moods });
});

// ==========================
// 🪞 REFLECTION INSIGHTS
// ==========================
app.get("/api/reflection/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const reflections = db
      .prepare("SELECT reflection FROM reflections WHERE user_email = ? ORDER BY created_at DESC LIMIT 5")
      .all(email);

    const text = reflections.map(r => r.reflection).join("\n");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize reflections into 3 key insights about emotional wellbeing." },
        { role: "user", content: text },
      ],
    });

    res.json({ insights: response.choices[0].message.content });
  } catch (err) {
    console.error("Reflection error:", err);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

// ==========================
// 📊 STATISTICS ROUTES
// ==========================
app.get("/api/stats/monthly-users", (req, res) => {
  const rows = db
    .prepare(
      "SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM messages GROUP BY month ORDER BY month ASC"
    )
    .all();

  res.json({
    months: rows.map(r => r.month),
    users: rows.map(r => r.count),
  });
});

app.get("/api/stats/mood-distribution", (req, res) => {
  const rows = db
    .prepare("SELECT mood, COUNT(*) as count FROM mood_logs GROUP BY mood")
    .all();
  res.json({
    moods: rows.map(r => r.mood),
    counts: rows.map(r => r.count),
  });
});

app.get("/api/stats/feedback-trend", (req, res) => {
  res.json({
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    avg_ratings: [4.1, 4.3, 4.5, 4.6, 4.8, 5.0],
  });
});

// ==========================
// 📈 AI PROGRESS DASHBOARD
// ==========================
app.get("/api/insights/dashboard/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const moods = db
      .prepare("SELECT mood, intensity, created_at FROM mood_logs WHERE user_email = ? ORDER BY created_at ASC LIMIT 50")
      .all(email);

    if (!moods.length) return res.json({ success: false, message: "No mood data found." });

    const summaryText = moods.map(m => `${m.created_at}: ${m.mood} (${m.intensity})`).join("\n");

    const prompt = `
      Analyze this user's recent mood log patterns.
      Provide:
      1. Average emotional tone
      2. 2–3 insights about trends
      3. A motivational statement
      === Mood Data ===
      ${summaryText}
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an empathetic wellness analyst summarizing mood data." },
        { role: "user", content: prompt },
      ],
    });

    res.json({
      success: true,
      insights: aiResponse.choices[0].message.content,
      data: moods,
    });
  } catch (err) {
    console.error("Dashboard insights error:", err);
    res.status(500).json({ error: "Failed to generate dashboard insights" });
  }
});

// ==========================
// 🧾 AI PROGRESS REPORT (PDF)
// ==========================
app.get("/api/report/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const moodData = db
      .prepare("SELECT mood, intensity, created_at FROM mood_logs WHERE user_email = ? ORDER BY created_at DESC LIMIT 10")
      .all(email);

    const chatMessages = db
      .prepare("SELECT message FROM messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_email = ?) ORDER BY timestamp DESC LIMIT 50")
      .all(email);

    const moodSummaryText = moodData.map(m => `${m.mood} (Intensity: ${m.intensity}) on ${m.created_at}`).join("\n");
    const chatText = chatMessages.map(m => m.message).join("\n");

    const prompt = `
      Analyze the following therapy chat messages and mood logs.
      Write a concise wellness summary under 200 words.
      === Mood Logs ===
      ${moodSummaryText}
      === Chat Messages ===
      ${chatText}
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly mental health assistant." },
        { role: "user", content: prompt },
      ],
    });

    const aiSummary = aiResponse.choices[0].message.content || "No summary generated.";

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("AI Therapy Progress Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`User: ${email}`, 20, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 37);
    doc.line(20, 42, 190, 42);
    const summaryLines = doc.splitTextToSize(aiSummary, 170);
    doc.text(summaryLines, 20, 60);
    if (!fs.existsSync("./reports")) fs.mkdirSync("./reports");
    const filePath = `./reports/${email}_progress.pdf`;
    doc.save(filePath);
    res.download(filePath);
  } catch (err) {
    console.error("❌ Report generation failed:", err);
    res.status(500).json({ error: "Failed to generate AI summary report" });
  }
});

// 🧘‍♀️ AI-Guided Meditation Route
app.post("/api/guided-meditation", async (req, res) => {
  try {
    const { type } = req.body;
    const prompt = `Create a short guided meditation for ${type}.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ success: true, text: completion.choices[0].message.content });
  } catch (err) {
    console.error("Meditation generation failed:", err);
    res.status(500).json({ success: false, error: "Failed to generate meditation." });
  }
});

// ==========================
// 💳 PAYMENT + ADMIN ROUTES (Step 1)
// ==========================

// Create payment record
app.post("/api/payment", (req, res) => {
  const { name, email, method, amount, transaction_code } = req.body;

  try {
    db.prepare(`
      INSERT INTO payments (name, email, method, amount, transaction_code, approved, created_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `).run(name, email, method, amount, transaction_code);

    res.json({ success: true, message: "Payment recorded, awaiting approval." });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ success: false, message: "Failed to record payment." });
  }
});

// Admin login (hardcoded)
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email === adminEmail && password === adminPassword) {
    res.json({ success: true, token: "dummy-admin-token" });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});


// Get all pending payments
// ✅ Get all pending manual payments (for Admin Panel)
app.get("/api/payments/pending", (req, res) => {
  const adminToken = req.headers["x-admin-token"];
  if (!adminToken) return res.json({ success: false, error: "Unauthorized" });

  try {
    const rows = db
      .prepare("SELECT * FROM manual_payments WHERE status = 'pending' ORDER BY created_at DESC")
      .all();

    // ✅ Map DB field names to match frontend expectations
    const mapped = rows.map(r => ({
      id: r.id,
      user_email: r.email,
      method: r.method,
      amount: r.amount,
      phone: r.phone,
      tx_code: r.transactionCode,  // <── now matches frontend
      created_at: r.created_at,
      status: r.status,
    }));

    res.json({ success: true, payments: mapped });
  } catch (err) {
    console.error("❌ Error fetching pending payments:", err);
    res.json({ success: false, error: "Database error" });
  }
});



// Approve payment
app.post("/api/admin/approve", (req, res) => {
  const { transaction_code } = req.body;
  try {
    db.prepare("UPDATE payments SET approved = 1 WHERE transaction_code = ?").run(transaction_code);
    res.json({ success: true, message: "Payment approved successfully" });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ success: false, message: "Failed to approve payment" });
  }
});

// ✅ Check user subscription status
app.get("/api/subscription/status/:email", (req, res) => {
  try {
    const { email } = req.params;
    const userPayment = db.prepare(`
      SELECT * FROM payments 
      WHERE user_email = ? AND status = 'approved' 
      ORDER BY created_at DESC LIMIT 1
    `).get(email);

    if (!userPayment) {
      return res.json({ active: false, reason: "no_payment" });
    }

    // Check if expired
    const now = new Date();
    const expires = new Date(userPayment.expires_at);
    if (expires < now) {
      // mark as expired
      db.prepare("UPDATE payments SET status = 'expired' WHERE id = ?").run(userPayment.id);
      return res.json({ active: false, reason: "expired" });
    }

    res.json({ active: true, expires_at: userPayment.expires_at });
  } catch (err) {
    console.error("Error checking subscription:", err);
    res.status(500).json({ active: false, error: "Server error" });
  }
});

// ✅ Manual payment submission (pending approval)
// ✅ Manual Payment Endpoint
app.post("/api/manual-payment", (req, res) => {
  try {
    const { user_email, method, phone, tx_code, amount, package_name, duration } = req.body;

    if (!user_email || !tx_code || !amount) {
      return res.json({ success: false, error: "Missing required fields" });
    }

    const stmt = db.prepare(`
      INSERT INTO manual_payments (email, transactionCode, phone, method, amount, package_name, duration, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    stmt.run(user_email, tx_code, phone, method, amount, package_name, duration);

    res.json({ success: true, message: "Payment submitted successfully!" });
  } catch (err) {
    console.error("❌ Error saving manual payment:", err);
    res.json({ success: false, error: "Database error" });
  }
});


// ✅ Approve payment and activate user access
// ✅ Approve manual payment (Admin only)
// ✅ Approve manual payment (Admin only)
app.post("/api/payments/approve", (req, res) => {
  const { id } = req.body;
  const adminToken = req.headers["x-admin-token"];

  // ✅ Verify admin token
  if (adminToken !== "dummy-admin-token") {
    return res.json({ success: false, error: "Unauthorized" });
  }

  try {
    const payment = db.prepare("SELECT * FROM manual_payments WHERE id = ?").get(id);
    if (!payment) return res.json({ success: false, error: "Payment not found" });

    // ✅ Mark as approved
    db.prepare("UPDATE manual_payments SET status = 'approved' WHERE id = ?").run(id);

    // ✅ Find user ID
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(payment.email);
    if (!user) return res.json({ success: false, error: "User not found" });

    // ✅ Check for existing package
    const existing = db.prepare("SELECT * FROM user_packages WHERE user_id = ?").get(user.id);

    const duration = Number(payment.duration) || 24; // default 24 hours
    let startDate = new Date();
    let expiryDate = new Date();

    if (existing && new Date(existing.expiry_at) > startDate) {
      // Extend from existing expiry date
      startDate = new Date(existing.expiry_at);
    }

    expiryDate = new Date(startDate);
    expiryDate.setHours(expiryDate.getHours() + duration);

    // ✅ Update or insert new package
    if (existing) {
      db.prepare(`
        UPDATE user_packages
        SET package_name = ?, expiry_at = ?, status = 'active'
        WHERE user_id = ?
      `).run(payment.package_name, expiryDate.toISOString(), user.id);
    } else {
      db.prepare(`
        INSERT INTO user_packages (user_id, package_name, expiry_at, status)
        VALUES (?, ?, ?, 'active')
      `).run(user.id, payment.package_name, expiryDate.toISOString());
    }

    res.json({ success: true, message: "✅ Payment approved and package activated!" });
  } catch (err) {
    console.error("❌ Approve error:", err);
    res.json({ success: false, error: "Database error" });
  }
});






// ✅ Check if user has an active package
// ✅ Single correct check-package route
app.post("/api/check-package", (req, res) => {
  const { email } = req.body;

  if (!email) return res.json({ success: false, error: "Missing email" });

  try {
    // 🔍 Find user by email
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.json({ success: false, hasPackage: false, error: "User not found" });
    }

    // 🔍 Find their active package
    const pkg = db.prepare("SELECT * FROM user_packages WHERE user_id = ?").get(user.id);
    if (!pkg) {
      return res.json({ success: true, hasPackage: false });
    }

    // ✅ Check expiry
    const now = new Date();
    const expiry = new Date(pkg.expiry_at);

    if (expiry > now) {
      return res.json({
        success: true,
        hasPackage: true,
        package: pkg.package_name,
        expiry: pkg.expiry_at,
      });
    } else {
      return res.json({
        success: true,
        hasPackage: false,
        expired: true,
      });
    }
  } catch (err) {
    console.error("❌ Check-package error:", err);
    res.json({ success: false, error: "Database error" });
  }
});

// ✅ AUTO M-PESA PAYMENT
import axios from "axios";

const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE; // e.g. 174379
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const CALLBACK_URL = "https://yourdomain.com/api/mpesa-callback";

// ✅ Generate M-Pesa Access Token
async function getMpesaToken() {
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      auth: { username: MPESA_CONSUMER_KEY, password: MPESA_CONSUMER_SECRET },
    }
  );
  return res.data.access_token;
}

// ✅ Initiate STK Push
app.post("/api/mpesa/pay", async (req, res) => {
  const { phone, amount, email, package_name } = req.body;
  if (!phone || !amount || !email) return res.json({ success: false, error: "Missing info" });

  try {
    const token = await getMpesaToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:\.Z]/g, "")
      .slice(0, 14);
    const password = Buffer.from(MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).toString("base64");

    await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: CALLBACK_URL,
        AccountReference: "AI Therapy Coach",
        TransactionDesc: "Therapy Package Purchase",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({ success: true, message: "✅ Payment prompt sent to your phone" });
  } catch (err) {
    console.error("❌ M-Pesa Error:", err.response?.data || err.message);
    res.json({ success: false, error: "Failed to initiate payment" });
  }
});

// ✅ Handle M-Pesa callback (auto activate)
app.post("/api/mpesa-callback", express.json(), (req, res) => {
  const data = req.body;

  const resultCode = data?.Body?.stkCallback?.ResultCode;
  if (resultCode === 0) {
    const metadata = data.Body.stkCallback.CallbackMetadata.Item;
    const amount = metadata.find((i) => i.Name === "Amount").Value;
    const phone = metadata.find((i) => i.Name === "PhoneNumber").Value;

    // ✅ Activate user package (find user by phone)
    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
    if (user) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30); // 30 days default
      db.prepare(`
        INSERT INTO user_packages (user_id, package_name, expiry_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET package_name = excluded.package_name, expiry_at = excluded.expiry_at
      `).run(user.id, "Premium", expiry.toISOString());
    }
  }

  res.json({ success: true });
});




app.post("/api/paypal/verify", async (req, res) => {
  const { orderId, email, package_name } = req.body;
  try {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64");
    const verifyRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const data = await verifyRes.json();

    if (data.status === "COMPLETED") {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (user) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        db.prepare(`
          INSERT INTO user_packages (user_id, package_name, expiry_at)
          VALUES (?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET package_name = excluded.package_name, expiry_at = excluded.expiry_at
        `).run(user.id, package_name, expiry.toISOString());
      }
      return res.json({ success: true });
    }

    res.json({ success: false, error: "Payment not verified" });
  } catch (err) {
    console.error("❌ PayPal verify error:", err);
    res.json({ success: false, error: "Verification failed" });
  }
});

// --- at top of file (add imports) ---
 // npm i node-fetch@3

// --- helper utils (place near other helpers) ---
const getMpesaAccessToken = async () => {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const env = process.env.MPESA_ENV === "sandbox" ? "sandbox" : "live";

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const url =
    env === "sandbox"
      ? "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      : "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await res.json();
  return data.access_token;
};

// --- STK Push endpoint (Lipa na M-Pesa) ---
app.post("/api/mpesa/stkpush", async (req, res) => {
  /*
    Expected body:
    {
      phone: "2547XXXXXXXX",
      amount: 833,
      package_name: "daily",
      duration: 24,
      email: "user@example.com"
    }
  */
  try {
    const { phone, amount, package_name, duration, email } = req.body;
    if (!phone || !amount || !email || !package_name) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const env = process.env.MPESA_ENV === "sandbox" ? "sandbox" : "live";
    const token = await getMpesaAccessToken();

    // Build timestamp and password (Passkey + Shortcode + Timestamp base64)
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const url =
      env === "sandbox"
        ? "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        : "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const body = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Number(amount),
      PartyA: phone, // msisdn in format 2547...
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: `${process.env.CALLBACK_BASE_URL || "https://your-server.example.com"}/api/mpesa/callback`,
      AccountReference: package_name,
      TransactionDesc: `Payment for ${package_name} by ${email}`,
    };

    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await resp.json();

    // Response contains CheckoutRequestID that we should keep for tracking
    // Save a record to manual_payments or payments for tracking in DB
    db.prepare(
      `INSERT INTO payments (name, email, method, amount, transaction_code, approved, created_at, extra)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now'), ?)`
    ).run(
      null,
      email,
      "M-Pesa STKPush",
      amount,
      data.CheckoutRequestID || null,
      JSON.stringify(data)
    );

    return res.json({ success: true, data });
  } catch (err) {
    console.error("MPESA STK error:", err);
    return res.status(500).json({ success: false, error: "MPESA request failed" });
  }
});

// --- MPESA callback endpoint (Safaricom will POST here) ---
app.post("/api/mpesa/callback", async (req, res) => {
  // Safaricom expects a 200 with a JSON body quickly
  try {
    const callbackData = req.body;

    // The structure differs between sandbox/live; extract what you need:
    // For live: callbackData.Body.stkCallback.CallbackMetadata
    const result = callbackData?.Body?.stkCallback;
    if (!result) {
      console.warn("MPESA callback missing Body.stkCallback:", callbackData);
      return res.json({ success: true });
    }

    const checkoutId = result.CheckoutRequestID;
    const resultCode = result.ResultCode;
    const resultDesc = result.ResultDesc;

    // If success, extract transaction info and grant package
    if (resultCode === 0) {
      // Build a map of CallbackMetadata items
      const cm = {};
      (result?.CallbackMetadata?.Item || []).forEach((i) => {
        cm[i.Name] = i.Value;
      });

      const mpesaReceipt = cm?.MpesaReceiptNumber || cm?.TransactionID || null;
      const amount = cm?.Amount || null;
      const phone = cm?.PhoneNumber || cm?.MSISDN || null;
      const accountRef = cm?.AccountReference || null;

      // Find the earlier payment entry by transaction_code (CheckoutRequestID)
      // Note: earlier we saved the CheckoutRequestID in 'transaction_code' column
      const paymentRow = db.prepare("SELECT * FROM payments WHERE transaction_code = ?").get(checkoutId);

      // If found, update and approve
      if (paymentRow) {
        // compute expiry based on package_name or duration stored previously
        let package_name = accountRef || paymentRow.package_name || "unknown";
        // you might store duration in payments.extra; attempt to get it
        let duration = 24; // fallback 24h
        try {
          const extra = JSON.parse(paymentRow.extra || "{}");
          if (extra?.duration) duration = Number(extra.duration);
        } catch {}
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + Number(duration));

        db.prepare("UPDATE payments SET approved = 1, approved_at = datetime('now'), transaction_code = ?, amount = ?, name = ?, phone = ? WHERE id = ?")
          .run(mpesaReceipt, amount, mpesaReceipt, phone, paymentRow.id);

        // grant access in user_packages (INSERT OR REPLACE)
        db.prepare(`
          INSERT OR REPLACE INTO user_packages (user_email, package_name, expiry_at)
          VALUES (?, ?, ?)
        `).run(paymentRow.email, package_name, expiry.toISOString());
      } else {
        // else create an entry in payments so admin can track
        db.prepare(
          `INSERT INTO payments (name, email, method, amount, transaction_code, approved, created_at, extra)
           VALUES (?, ?, ?, ?, ?, 1, datetime('now'), ?)`
        ).run(null, null, "M-Pesa", amount, mpesaReceipt, JSON.stringify({ raw: callbackData }));
      }
    } else {
      // non-successful push (user cancelled or failed)
      console.warn("STK Push failed:", resultCode, resultDesc);
      // Optionally save record for manual review
      db.prepare(
        `INSERT INTO payments (name, email, method, amount, transaction_code, approved, created_at, extra)
         VALUES (?, ?, ?, ?, ?, 0, datetime('now'), ?)`
      ).run(null, null, "M-Pesa Failed", null, checkoutId, JSON.stringify(result));
    }

    // Respond quickly to Safaricom
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("MPESA callback handling error:", err);
    return res.json({ ResultCode: 1, ResultDesc: "Error" });
  }
});

// --- check STK push payment status ---
app.get("/api/mpesa/status", (req, res) => {
  const { checkoutId } = req.query;
  if (!checkoutId) return res.status(400).json({ success: false, error: "Missing checkoutId" });

  try {
    const row = db.prepare("SELECT approved, transaction_code, email FROM payments WHERE transaction_code = ? OR extra LIKE ?").get(checkoutId, `%${checkoutId}%`);
    if (!row) return res.json({ success: false, status: "not_found" });

    if (row.approved === 1) {
      return res.json({ success: true, status: "approved", transaction: row.transaction_code });
    } else {
      return res.json({ success: true, status: "pending" });
    }
  } catch (err) {
    console.error("Error checking mpesa status:", err);
    return res.status(500).json({ success: false, error: "DB error" });
  }
});


// --- PayPal create order (server) ---
app.post("/api/paypal/create-order", async (req, res) => {
  const { amount, currency = "USD", package_name, duration, email } = req.body;
  if (!amount || !email || !package_name) return res.status(400).json({ success: false, error: "Missing fields" });

  try {
    const env = process.env.PAYPAL_ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");

    // create order
    const orderRes = await fetch(`${env}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: currency, value: String(amount) }, reference_id: package_name }],
        application_context: { brand_name: "AI Therapy Coach", user_action: "PAY_NOW" },
      }),
    });
    const orderData = await orderRes.json();

    // Save minimal order record to DB to reconcile later
    db.prepare(
      `INSERT INTO payments (name, email, method, amount, transaction_code, approved, created_at, extra)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now'), ?)`
    ).run(null, email, "PayPal", amount, orderData.id || null, JSON.stringify(orderData));

    res.json({ success: true, order: orderData });
  } catch (err) {
    console.error("PayPal create order error:", err);
    res.status(500).json({ success: false, error: "PayPal create failed" });
  }
});

// --- PayPal capture order (server) ---
app.post("/api/paypal/capture-order", async (req, res) => {
  const { orderID, email, package_name, duration } = req.body;
  if (!orderID || !email) return res.status(400).json({ success: false, error: "Missing fields" });

  try {
    const env = process.env.PAYPAL_ENV === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");

    const captureRes = await fetch(`${env}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });
    const captureData = await captureRes.json();

    if (captureData.status === "COMPLETED" || captureData.status === "COMPLETED") {
      // record payment and grant package
      const amount = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || null;
      const txnId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

      // mark payment entry created earlier (if exists) or insert
      db.prepare(
        `INSERT INTO payments (name, email, method, amount, transaction_code, approved, created_at, extra)
         VALUES (?, ?, ?, ?, ?, 1, datetime('now'), ?)`
      ).run(null, email, "PayPal", amount, txnId, JSON.stringify(captureData));

      // compute expiry
      const dur = Number(duration) || 24;
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + dur);

      db.prepare(`
        INSERT OR REPLACE INTO user_packages (user_email, package_name, expiry_at)
        VALUES (?, ?, ?)
      `).run(email, package_name, expiry.toISOString());

      return res.json({ success: true, capture: captureData });
    } else {
      return res.status(400).json({ success: false, error: "Payment not completed", captureData });
    }
  } catch (err) {
    console.error("PayPal capture error:", err);
    res.status(500).json({ success: false, error: "PayPal capture failed" });
  }
});

// ✅ VERIFY PAYPAL PAYMENT
import fetch from "node-fetch"; // Add this at the top if not already imported

app.post("/api/paypal/verify", async (req, res) => {
  const { orderID, email, package_name, duration } = req.body;
  if (!orderID || !email) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    // 🔑 Step 1: Get PayPal Access Token
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 🧾 Step 2: Verify Order
    const verifyRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderID}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const order = await verifyRes.json();

    if (order.status === "COMPLETED") {
      // ✅ Save active package
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (duration || 30));

      db.prepare(`
        INSERT INTO user_packages (email, package_name, expiry_at)
        VALUES (?, ?, ?)
      `).run(email, package_name, expiry.toISOString());

      db.prepare(`
        INSERT INTO payments (email, method, amount, approved, transaction_code)
        VALUES (?, 'PayPal', ?, 1, ?)
      `).run(email, order.purchase_units?.[0]?.amount?.value || 0, orderID);

      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.json({ success: false, message: "Payment not completed", order });
    }
  } catch (err) {
    console.error("PayPal verification error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});

// ---------- Realtime WebSocket proxy (OpenAI) ----------
/*
  This proxy accepts a WebSocket from the browser and opens a WebSocket to
  OpenAI Realtime API. It forwards messages both ways.

  Requirements:
   - process.env.OPENAI_API_KEY must contain your OpenAI API key.
   - Browser connects to ws://localhost:5000/realtime (or wss on prod).
*/

import http from "http";
import { WebSocket as NodeWebSocket } from "ws";

// If your app is already using a raw http.Server via app.listen(PORT) you can
// reuse it. For simplicity, we will create a small server and hook express into it:

// If you already do app.listen at bottom, replace that with this block:
// (If you prefer to keep app.listen and not change, see note below.)
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Upgrade handler
server.on("upgrade", (request, socket, head) => {
  // Only handle our realtime path
  const { url } = request;
  if (!url || !url.startsWith("/realtime")) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// When browser connects, create a WebSocket to OpenAI Realtime and proxy
wss.on("connection", (clientWs, req) => {
  console.log("📡 Browser connected to /realtime");

  // OpenAI Realtime WS endpoint (replace region/path if needed by OpenAI docs)
  const OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"; 
  // NOTE: choose the exact realtime model string your account supports

  // Create WS to OpenAI with Authorization header
  const openaiWs = new NodeWebSocket(OPENAI_REALTIME_URL, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      // optional: "OpenAI-Beta": "realtime=v1"
    },
  });

  openaiWs.on("open", () => {
    console.log("🔐 Connected to OpenAI Realtime");
  });

  // forward messages from client -> openai
  clientWs.on("message", (msg) => {
    // msg expected to be a JSON string from client already
    try {
      openaiWs.send(msg);
    } catch (err) {
      console.error("Error sending to OpenAI:", err);
    }
  });

  // forward messages from openai -> client
  openaiWs.on("message", (msg) => {
    try {
      clientWs.send(msg);
    } catch (err) {
      console.error("Error sending to client:", err);
    }
  });

  // handle connection close / errors
  const cleanup = () => {
    if (openaiWs && openaiWs.readyState === NodeWebSocket.OPEN) openaiWs.close();
    if (clientWs && clientWs.readyState === NodeWebSocket.OPEN) clientWs.close();
  };

  clientWs.on("close", cleanup);
  clientWs.on("error", cleanup);
  openaiWs.on("close", cleanup);
  openaiWs.on("error", (err) => {
    console.error("OpenAI WS error:", err);
    cleanup();
  });
});


const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // max 60 requests per minute
});
app.use(limiter);












// ==========================
// 🚀 START SERVER
// ==========================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
