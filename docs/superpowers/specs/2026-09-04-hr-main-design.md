# HR Main workflow design

## Goal

Add a recruiter-focused manual bulk screening workspace at `/hr`. Recruiters create a job and scorecard, select ZIP/PDF/DOCX resume files, observe simulated asynchronous processing, review sortable evidence-rich candidate results, record decisions, and export CSV. This iteration is a functional front-end workflow; it does not claim to parse or score resume contents on a server.

## Product boundaries

### Included

- First-run empty state with a prominent **Add new** action.
- Two-step job creation: job details, then a manual scorecard builder.
- Local, user-scoped persistence for jobs, generated candidate records, and human decisions.
- Browser file selection for `.zip`, `.pdf`, and `.docx` files.
- Visible queued, processing, and completed states.
- Deterministic demo candidate results derived from file metadata, clearly presented as the local workflow state.
- Sortable candidate table.
- Per-criterion met, missing, and unclear assessments with evidence text.
- Human decisions: Undecided, Advance, Hold, and Reject.
- CSV export of the active job's currently sorted candidates and evidence summaries.
- Protected `/hr` route and shared sidebar entry.
- Sign-in and sign-up completion routes default to `/hr`.

### Excluded

- ATS or calendar integrations.
- Server-side uploads, document parsing, OCR, ZIP extraction, queues, persistence, or model calls.
- Automated scorecard generation.
- Cross-device synchronization or collaborative editing.
- Changes to the existing `/dashboard` candidate analysis workflow.

## Information architecture

`HRMain.tsx` uses the existing `DashboardLayout` and presents three mutually exclusive main states:

1. **Empty portfolio**: explains the manual workflow and offers **Add new**.
2. **Create job**: a focused two-step flow inside the page.
3. **Job workspace**: a stable active-job rail plus the selected job's stats, upload area, processing state, and candidate table.

The active-job rail remains visible when jobs exist. Each selection shows the role title and candidate count. Selecting a job immediately replaces the main workspace without changing routes. **Add new** remains available at the top of the rail and page header.

## Job creation flow

### Step 1: job details

Required fields:

- Job title
- Department
- Location
- Job description

Submitting an incomplete step shows inline errors and focuses the first invalid field. The recruiter can cancel without mutating saved jobs.

### Step 2: scorecard

The recruiter manually adds criteria. Each row contains:

- Criterion name
- Required or preferred classification
- Weight from 1 to 5

At least one non-empty criterion is required. Criteria can be edited and removed, but the final row cannot be removed. **Create job** persists the new job, selects it, and opens its workspace immediately.

## Resume intake and asynchronous states

The file input accepts `.zip`, `.pdf`, and `.docx`, including multi-selection for PDF/DOCX batches. Validation rejects unsupported types and reports them inline without starting processing.

A valid batch moves through:

1. **Queued**: files accepted and listed.
2. **Processing**: progress advances for the visible batch.
3. **Complete**: deterministic candidate records are appended to the active job and persisted.

PDF/DOCX inputs produce one candidate record per selected file. A ZIP produces a small deterministic demo batch associated with the archive filename because this iteration does not inspect archive contents. Upload status copy must make the simulation boundary clear. Component unmount clears outstanding timers. Raw `File` objects and file contents are never persisted or transmitted.

## Candidate results

The table columns are:

- Candidate
- Score
- Evidence
- Missing / unclear
- Decision

Candidate, score, evidence count, missing/unclear count, and decision are sortable. The initial order is score descending. Status uses text and icons, not color alone.

Each row expands to a criterion breakdown. Every criterion includes:

- Criterion name and required/preferred classification
- Met, missing, or unclear status
- Short evidence or explanation
- Weighted contribution to the total score

Generated records are deterministic for a given job, scorecard, and filename so sorting and tests remain stable. Human decisions persist independently from sort order.

## CSV export

**Export CSV** downloads one row per active-job candidate in the current sorted order. Columns include candidate name, source file, score, evidence count, missing criteria, unclear criteria, decision, and flattened evidence details. Values use correct CSV quoting for commas, quotes, and line breaks. Export is disabled when the active job has no candidates.

## Components and modules

### `src/components/HRMain.tsx`

Owns page state and renders the three main states. It composes existing project primitives:

- `DashboardLayout`
- `Button`
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Badge`
- `Input`
- `cn`
- Lucide icons
- restrained Framer Motion transitions

Native buttons, labels, inputs, file inputs, tables, and selects provide keyboard behavior and accessible names.

### `src/components/hrWorkflow.js`

A small pure module owns behavior that should not depend on React:

- workspace normalization and initial state
- file-type validation
- deterministic candidate generation
- candidate sorting
- human-decision updates
- CSV serialization

The module has no browser storage or DOM dependency, making the contract directly testable.

## Persistence and data flow

`HRMain.tsx` reads and writes one versioned localStorage record under:

`gapless.hr.workspace.<user email or guest>`

The record contains jobs, scorecards, candidate result records, decisions, selected job ID, and a schema version. Invalid or unavailable stored data falls back to the empty state without crashing. Derived stats are calculated from current candidate records rather than stored separately.

Flow:

1. Load and normalize local state.
2. Render empty, create, or workspace state.
3. Persist after job creation, processing completion, job selection, and decision changes.
4. Keep transient form values, selected `File` objects, errors, and timer progress out of persistence.

## Routing and navigation

- Add protected route `/hr` rendering `HRMain`.
- Add `/hr` to the app shell's dashboard-path detection.
- Add **HR Workspace** to the shared left sidebar and route it to `/hr`.
- Keep `/dashboard` and the existing Overview/Readiness/History behavior unchanged.
- Change sign-in, sign-up, and email-auth completion destinations from `/dashboard` to `/hr`.
- Keep unrelated marketing links labeled Dashboard pointed at `/dashboard`.

Git reference names cannot contain spaces. The requested branch is normalized from `HR Rebuild` to `hr-rebuild`.

## Error handling and accessibility

- Validate on submit or upload rather than disabling actions before interaction.
- Bind every form label to its input.
- Mark invalid controls with `aria-invalid` and associate inline messages through `aria-describedby`.
- Focus the first invalid job-creation control.
- Announce routine upload progress through a stable `role="status"` region.
- Use `role="alert"` for upload and form errors.
- Keep all interactions on native controls and preserve visible focus styles.
- Use text/icons alongside color for statuses.
- Respect reduced-motion preferences by using restrained opacity transitions when reduced motion is requested.
- Reflow the job rail above the workspace on narrow screens; avoid horizontal page overflow while allowing the result table itself to scroll.

## Verification

### Automated behavior checks

Node tests for `hrWorkflow.js` cover:

- accepted and rejected file types
- deterministic candidate generation
- score-descending and alternate sorting
- decision updates independent of current sort
- CSV quoting and row order

Each behavior test is written and observed failing before its implementation.

### Build check

Run the project's production Vite build and resolve TypeScript or bundling failures.

### Browser smoke test

Using the real app surface:

1. Reach `/hr` through the protected application shell.
2. Confirm the first-run empty state.
3. Create a job through both steps and confirm it opens automatically.
4. Upload supported files and observe queued, processing, and complete states.
5. Sort the candidate table and expand criterion evidence.
6. Record a human decision and confirm it survives navigation between jobs.
7. Trigger CSV export and confirm a download is created.
8. Use the sidebar to move between HR Workspace and the existing dashboard.
9. Check the flow at desktop and narrow viewport widths.
