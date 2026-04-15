# API Analyze Rebuild Design (Vite + Express)

## Problem
The previous Next.js route-based API was removed during migration, and `/api/analyze` needs to be rebuilt in a Vite-compatible full-stack setup without reintroducing framework-specific patterns.

## Approved Architecture
- Single repo with Vite (React) frontend and Express backend.
- Development: Vite proxies `/api/*` to Express via `vite.config.ts`.
- Production: Express serves `dist/` static assets and returns `dist/index.html` for non-API routes.
- API route ordering: all `/api/*` routes are defined before the SPA catch-all route.

## Endpoint Contract
- Endpoint: `POST /api/analyze` (canonical endpoint).
- Response envelope is always JSON:
  - Success: `{ "success": true, "data": <analysis>, "error": null }`
  - Failure: `{ "success": false, "data": null, "error": { "code": string, "message": string, "details"?: any } }`
- No HTML responses from API paths under any failure mode.

## Validation and Middleware Strategy
- Validation is performed in Express middleware before calling business logic.
- Validation phases:
  1. **Shape validation (400)**: malformed JSON, missing required fields, wrong types.
  2. **Semantic validation (422)**: valid shape but unacceptable content (e.g., trimmed length constraints).
- `analyzeSkills()` is only called when both validations pass.

## Business Logic Boundary
- `analyzeSkills()` remains a pure business function with no HTTP/Express concerns.
- It receives validated domain input and returns domain output (or throws domain errors).
- It includes explicit timeout handling for upstream AI calls.

## Error Handling Policy
- Status mapping:
  - `400` = malformed request shape
  - `422` = semantic validation failure
  - `500` = timeout/internal/unexpected failure
- Central API error handling middleware normalizes all thrown errors into the response envelope.
- API routes always respond with `application/json`.

## Production Routing Rules
- Express serves `dist/` as static assets.
- Catch-all route serves `dist/index.html` for all non-API paths.
- Catch-all is defined strictly after all `/api/*` route handlers and API error middleware.

## Scope
### In Scope
- Rebuild `/api/analyze` in Express per contract above.
- Add/align middleware for request validation and normalized JSON errors.
- Align frontend call sites to canonical `/api/analyze` path.
- Ensure Vite proxy + production static serving behavior follows architecture.

### Out of Scope
- Reintroducing Next.js route handlers.
- Changing analysis schema semantics beyond envelope normalization.
- New features such as persistence via `save` flag (explicitly excluded).

## Risks and Mitigations
- **Risk:** Mixed old/new route assumptions in frontend/tests.
  - **Mitigation:** Update frontend/test references to canonical `/api/analyze`.
- **Risk:** API returning inconsistent error payloads.
  - **Mitigation:** Centralized responder + error middleware.
- **Risk:** API route overshadowed by SPA fallback.
  - **Mitigation:** enforce route order and test `/api/analyze` explicitly.

## Verification Targets
- Valid payload returns `200` with `{ success: true, data, error: null }`.
- Malformed/missing shape returns `400` envelope.
- Semantically invalid content returns `422` envelope.
- Timeout/internal failures return `500` envelope.
- Non-API routes in production return SPA HTML from `dist/index.html`.
