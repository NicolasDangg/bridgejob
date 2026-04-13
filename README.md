# BridgeJob

BridgeJob helps candidates see where they stand before they apply.

This branch keeps the OpenRouter-backed analysis logic from the migrate PR and adds a new Next.js frontend shell with a calm, professional, minimalist, light-themed, cozy UI.

## Stack

- Next.js App Router for the frontend shell
- OpenRouter for the analysis backend logic
- Supabase for saved analysis history
- Vercel for deployment and preview builds

## Local setup

1. Install dependencies.

   npm install

2. Copy the example environment file.

   cp .env.example .env.local

3. Set the required environment variables.

   OPENROUTER_API_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...

4. Start the app.

   npm run dev

## Vercel deployment

- Connect the migrate branch to Vercel.
- Keep the default Next.js build command.
- Add the same environment variables in Vercel project settings.
- Every PR preview can point at the same Supabase project.

## Supabase schema

Create a table named analyses:

   create table if not exists analyses (
     id uuid default gen_random_uuid() primary key,
     job_title text not null,
     overall_fit text not null,
     overall_summary text not null,
     readiness_score integer,
     job_description text not null,
     candidate_skills text not null,
     analysis jsonb not null,
     created_at timestamptz default now()
   );

Optional policies:

- allow authenticated inserts if you want to save from a logged-in app
- allow public reads if you want the history panel visible without login

## What changed in this branch

- Preserves the migrated OpenRouter analysis logic
- Adds a new App Router frontend
- Adds a Supabase browser client helper
- Adds a Next.js API route that reuses the existing analyzer
- Updates the UI to a softer editorial light theme

## Files that still contain the legacy Express app

The old Express files are still in the repository for reference and test coverage, but the Vercel app uses the Next.js route and frontend shell.
