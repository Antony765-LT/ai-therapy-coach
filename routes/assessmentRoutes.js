import express from 'express';
import pool from '../db.js';
const router = express.Router();

// PHQ-9 (Depression) + GAD-7 (Anxiety) Assessment Route
router.post('/submit', async (req, res) => {
  try {
    const { user_id, phq9_answers, gad7_answers } = req.body;

    // Calculate scores
    const phq9_score = phq9_answers.reduce((a, b) => a + b, 0);
    const gad7_score = gad7_answers.reduce((a, b) => a + b, 0);

    // Store results in DB
    const result = await pool.query(
      `INSERT INTO assessments (user_id, phq9_score, gad7_score) 
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, phq9_score, gad7_score]
    );

    // Interpret results
    let phq9_level = '';
    if (phq9_score <= 4) phq9_level = 'Minimal depression';
    else if (phq9_score <= 9) phq9_level = 'Mild depression';
    else if (phq9_score <= 14) phq9_level = 'Moderate depression';
    else if (phq9_score <= 19) phq9_level = 'Moderately severe depression';
    else phq9_level = 'Severe depression';

    let gad7_level = '';
    if (gad7_score <= 4) gad7_level = 'Minimal anxiety';
    else if (gad7_score <= 9) gad7_level = 'Mild anxiety';
    else if (gad7_score <= 14) gad7_level = 'Moderate anxiety';
    else gad7_level = 'Severe anxiety';

    res.json({
      success: true,
      data: result.rows[0],
      interpretations: { phq9_level, gad7_level }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
