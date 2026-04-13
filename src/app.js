'use strict';

const express = require('express');
const { analyzeSkills } = require('./analyzer');

const MIN_JD_LENGTH = 50;
const MIN_SKILLS_LENGTH = 20;

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

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

  if (jd.trim().length < MIN_JD_LENGTH) {
    return res
      .status(400)
      .json({ error: `\`jd\` must be at least ${MIN_JD_LENGTH} characters long.` });
  }

  if (skills.trim().length < MIN_SKILLS_LENGTH) {
    return res
      .status(400)
      .json({ error: `\`skills\` must be at least ${MIN_SKILLS_LENGTH} characters long.` });
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
