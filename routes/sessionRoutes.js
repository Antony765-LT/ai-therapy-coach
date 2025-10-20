import express from 'express';
import pool from '../db.js';
const router = express.Router();

// Create a new therapy session
router.post('/create', async (req, res) => {
  try {
    const { user_id, summary, transcript } = req.body;
    const result = await pool.query(
      'INSERT INTO sessions (user_id, summary, transcript) VALUES ($1, $2, $3) RETURNING *',
      [user_id, summary, transcript]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
