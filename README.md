# gapless (Vite + Express + Groq)

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set environment variables in `.env` (see `.env.example`), including:
   - `GROQ_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run the frontend:
   `npm run dev:client`
4. Run the API (separate terminal):
   `npm run dev:api`

The frontend sends analyzer requests to `/api/analyze`, which is proxied to the Express API during development.
The backend endpoint requires a valid Supabase Bearer token and enforces rate limits server-side.
