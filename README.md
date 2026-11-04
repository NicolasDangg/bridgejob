# gapless

**Know where you stand before you apply.**

gapless is an AI career tool. Paste a job description and your resume, and it shows you skill by skill how well you match the role, where the real gaps are, and what to do about them.

Live: [bridgejob.vercel.app](https://bridgejob.vercel.app)

---

## Features

- **Resume vs. job analysis.** Every required and preferred skill in the job description is marked as a *strong match*, *partial match*, *gap* or *unclear*. It looks at what you've actually done (ownership, scope, outcomes), not just matching keywords, so transferable experience gets credit.
- **Career path view.** An overview of the analysis, a gap breakdown, a skill-readiness score and a history that tracks your progress over time.
- **Skill learning.** Learning resources for the gaps found in your latest analysis.
- **Resume review and resume creator.** Feedback on an existing resume, or help building a new one.
- **Job search.** Openings at tech companies matched to your skills.
- **AI career coach.** A chat box for interview prep, resume questions and career advice. It stays on career topics.
- **Accounts and history.** Sign in with Supabase Auth. Past analyses are saved and can be revisited.

## Tech

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), Framer Motion, Recharts |
| Backend | Express (Node.js) and Vercel serverless functions (`api/`) |
| AI | Groq API running Llama 3.3 70B, prompted to return JSON that follows a fixed schema (`src/schema.json`) |
| Database / auth | Supabase (Postgres + Auth), with SQL migrations in `supabase/migrations` |
| Hosting | Vercel |

## Security

- Every `/api/analyze` request must carry a valid Supabase access token.
- Usage limits are checked on the server against the database through a rate-limit function in Postgres, so users can't claim a higher plan from the browser.
- The Supabase service-role key exists only on the server. The server refuses the key if it appears in a `VITE_` or `NEXT_PUBLIC_` variable.

## Run locally

Requires Node.js.

```bash
npm install
cp .env.example .env   # fill in GROQ_API_KEY and the Supabase values
npm run dev            # frontend on :3000 and API on :3001 together
```

Or run them separately with `npm run dev:client` and `npm run dev:api`. In development the frontend's `/api/analyze` calls are proxied to the Express API.

| Variable | Where | Purpose |
|---|---|---|
| `GROQ_API_KEY` | server | LLM calls |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | browser | Public Supabase client |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | server only | Admin access for usage checks. **Never prefix with `VITE_`** |

## Layout

```
src/
  components/       pages: dashboard, career path, resume review/creator, job search, coach chat
  prompt.js         analysis system prompt
  schema.json       JSON schema the model must follow
  analyzer.js       calls Groq and validates the response
  coachAnalyzer.js  career coach chat
api/                serverless endpoints (analyze) and tests
supabase/           database migrations (analysis history, usage events, rate limiting)
index.js            Express server for local development
```
