'use strict';

const express = require('express');
const { analyzeSkills } = require('./analyzer');

const app = express();
app.use(express.json());

/**
 * POST /analyze
 *
 * Body:
 *   { "jd": "<job description text>", "skills": "<candidate skills text>" }
 *
 * Returns a structured JSON analysis of the candidate's fit for the role.
 */
app.post('/analyze', async (req, res) => {
  const { jd, skills } = req.body;

  if (!jd || typeof jd !== 'string' || jd.trim() === '') {
    return res.status(400).json({ error: '`jd` is required and must be a non-empty string.' });
  }

  if (!skills || typeof skills !== 'string' || skills.trim() === '') {
    return res.status(400).json({ error: '`skills` is required and must be a non-empty string.' });
  }

  try {
    const result = await analyzeSkills(jd.trim(), skills.trim());
    return res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    return res.status(502).json({ error: 'Failed to analyze skills.', detail: err.message });
  }
});

module.exports = app;
