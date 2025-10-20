CREATE DATABASE therapycoach;

\c therapycoach;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  summary TEXT,
  transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  phq9_score INT,
  gad7_score INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);


  CREATE TABLE IF NOT EXISTS user_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  package_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


  CREATE TABLE IF NOT EXISTS manual_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  transactionCode VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  method VARCHAR(100),
  amount DECIMAL(10, 2),
  package_name VARCHAR(100),
  duration VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);






