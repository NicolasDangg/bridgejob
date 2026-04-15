<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BridgeJob (Vite + Express + Groq)

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set `GROQ_API_KEY` in `.env` (see `.env.example`).
3. Run the frontend:
   `npm run dev`
4. Run the API (separate terminal):
   `npm run dev:api`

The frontend sends analyzer requests to `/api/analyze`, which is proxied to the Express API during development.
