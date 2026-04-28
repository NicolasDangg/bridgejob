# gapless (Vite + Express + Groq)

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set environment variables in `.env` (see `.env.example`), including:
   - `GROQ_API_KEY`
   - `VITE_SUPABASE_URL` (public URL, safe for client-side)
   - `VITE_SUPABASE_ANON_KEY` (public anon key, safe for client-side)
   - Backend-only (server-side only):
     - `SUPABASE_URL` (server URL, kept private)
     - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **CRITICAL: Never use VITE_ prefix or expose to client**)
3. Run the frontend:
   `npm run dev:client`
4. Run the API (separate terminal):
   `npm run dev:api`

The frontend sends analyzer requests to `/api/analyze`, which is proxied to the Express API during development.
The backend endpoint requires a valid Supabase Bearer token and enforces rate limits server-side.

### Security Notes

- **Service Role Key**: The `SUPABASE_SERVICE_ROLE_KEY` must **only** be available on the backend server. It is checked at startup to prevent accidental exposure via `VITE_` or `NEXT_PUBLIC_` prefixes.
- **Rate Limits**: User plans are validated server-side against the database to prevent attackers from claiming higher tier privileges.
- **Authentication**: All `/api/analyze` requests must include a valid Supabase Bearer token in the `Authorization` header.
