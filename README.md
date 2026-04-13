# BridgeJob

BridgeJob's AI career analyst helps candidates understand exactly where they stand before applying for a role — no fluff, no false encouragement.

## What it does

Given a **job description (JD)** and a **candidate's skills/experience**, the API:

- Extracts all required and preferred skills from the JD
- Compares them against the candidate's stated skills
- Classifies each skill as `STRONG MATCH`, `PARTIAL MATCH`, `GAP`, or `UNCLEAR`
- Provides priority levels, learnability estimates, and specific actions for every gap
- Ignores noise language ("team player", "fast learner", etc.)
- Returns an honest readiness score (0–100) and ranked bridge steps

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your OPENROUTER_API_KEY
```

### 3. Start the server

```bash
npm start
```

The API listens on `http://localhost:3000` by default (override with `PORT` env var).

## API

### `POST /analyze`

**Request body** (JSON):

| Field    | Type   | Required | Description                                    |
|----------|--------|----------|------------------------------------------------|
| `jd`     | string | ✅        | Full text of the job description               |
| `skills` | string | ✅        | Candidate's current skills and experience      |

**Example request:**

```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jd": "We are looking for a Senior Frontend Engineer with 5+ years of React experience...",
    "skills": "3 years of JavaScript, basic React, some Vue.js experience"
  }'
```

**Example response:**

```json
{
  "job_title": "Senior Frontend Engineer",
  "overall_fit": "WEAK",
  "overall_summary": "The candidate has foundational JavaScript skills but falls significantly short of the seniority and React depth this role demands. Without dedicated upskilling, this application is unlikely to progress.",
  "strong_matches": [
    { "skill": "JavaScript", "note": "Candidate lists JS as their primary language." }
  ],
  "partial_matches": [
    {
      "skill": "React",
      "gap_detail": "Candidate has basic React but the JD emphasizes advanced patterns (hooks, context, performance optimization).",
      "priority": "CRITICAL",
      "learnability": "MEDIUM",
      "action": "Complete the Scrimba Advanced React course and ship a full CRUD app using hooks and context API to GitHub."
    }
  ],
  "gaps": [
    {
      "skill": "TypeScript",
      "priority": "CRITICAL",
      "learnability": "MEDIUM",
      "action": "Work through Matt Pocock's Total TypeScript Beginners course, then refactor your largest JS project to TS."
    }
  ],
  "noise_skills": ["team player", "strong communicator"],
  "readiness_score": 28,
  "bridge_steps": [
    "Finish Scrimba Advanced React and ship a hooks/context project within 3 weeks.",
    "Complete Total TypeScript Beginners and add TS to an existing project.",
    "Build a production-grade React app (auth, routing, API calls) and document it."
  ],
  "analyst_note": "React is mentioned four times in the JD — treat it as the absolute dealbreaker requirement."
}
}
```

**Error responses:**

| Status | Meaning                                              |
|--------|------------------------------------------------------|
| 400    | Missing or empty `jd` or `skills` field              |
| 502    | OpenRouter API call failed or returned unparseable output |

## Project structure

```
bridgejob/
├── index.js          # Entry point — starts the HTTP server
├── src/
│   ├── app.js        # Express app and route definitions
│   ├── analyzer.js   # OpenRouter integration and skill analysis logic
│   └── prompt.js     # System and user prompt builders
├── tests/
│   ├── app.test.js       # Route-level tests (supertest)
│   ├── analyzer.test.js  # Analyzer unit tests (mocked OpenRouter)
│   └── prompt.test.js    # Prompt builder unit tests
├── .env.example      # Environment variable template
└── package.json
```

## Running tests

```bash
npm test
```
