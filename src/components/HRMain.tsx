import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";
import { EMPTY_WORKSPACE, normalizeWorkspace } from "./hrWorkflow.js";

export type Importance = "required" | "preferred";
export type AssessmentStatus = "met" | "unclear" | "missing";
export type CandidateDecision = "undecided" | "advance" | "hold" | "reject";

export interface ScorecardCriterion {
  id: string;
  name: string;
  importance: Importance;
  weight: number;
}

export interface Assessment {
  criterionId: string;
  criterionName: string;
  importance: Importance;
  weight: number;
  status: AssessmentStatus;
  evidence: string;
  contribution: number;
}

export interface Candidate {
  id: string;
  name: string;
  sourceFile: string;
  score: number;
  decision: CandidateDecision;
  createdAt: string;
  assessments: Assessment[];
}

export interface RecruitingJob {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  createdAt: string;
  scorecard: ScorecardCriterion[];
  candidates: Candidate[];
}

export interface Workspace {
  version: number;
  selectedJobId: string | null;
  jobs: RecruitingJob[];
}

interface CriterionDraft {
  draftId: string;
  name: string;
  importance: Importance;
  weight: number;
}

interface JobDraft {
  title: string;
  department: string;
  location: string;
  description: string;
  criteria: CriterionDraft[];
}

type JobField = "title" | "department" | "location" | "description";
type JobFieldErrors = Partial<Record<JobField, string>>;
type View = "portfolio" | "create";

const STORAGE_PREFIX = "gapless.hr.workspace.";
const EMPTY_WORKSPACE_VALUE: Workspace = {
  version: EMPTY_WORKSPACE.version,
  selectedJobId: EMPTY_WORKSPACE.selectedJobId,
  jobs: [],
};

const createDraftCriterion = (draftId: string): CriterionDraft => ({
  draftId,
  name: "",
  importance: "required",
  weight: 3,
});

const createEmptyDraft = (): JobDraft => ({
  title: "",
  department: "",
  location: "",
  description: "",
  criteria: [createDraftCriterion("criterion-1")],
});

function storageKeyFor(email: string | undefined): string {
  return `${STORAGE_PREFIX}${email || "guest"}`;
}

function getUuid(): string {
  return globalThis.crypto.randomUUID();
}

function asWorkspace(value: unknown): Workspace {
  if (!value || typeof value !== "object") return EMPTY_WORKSPACE_VALUE;
  return normalizeWorkspace(value) as Workspace;
}

export default function HRMain() {
  const { user } = useAuth();
  const storageKey = storageKeyFor(user?.email ?? undefined);
  const [workspace, setWorkspace] = useState<Workspace>(EMPTY_WORKSPACE_VALUE);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);
  const [view, setView] = useState<View>("portfolio");
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<JobDraft>(createEmptyDraft);
  const [fieldErrors, setFieldErrors] = useState<JobFieldErrors>({});
  const [criteriaError, setCriteriaError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const departmentRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const firstCriterionRef = useRef<HTMLInputElement>(null);

  const isLoading = loadedStorageKey !== storageKey;
  const selectedJob = useMemo(
    () => workspace.jobs.find((job) => job.id === workspace.selectedJobId) ?? null,
    [workspace.jobs, workspace.selectedJobId],
  );

  useEffect(() => {
    let storedWorkspace: Workspace = EMPTY_WORKSPACE_VALUE;
    try {
      const serialized = window.localStorage.getItem(storageKey);
      if (serialized) storedWorkspace = asWorkspace(JSON.parse(serialized));
    } catch {
      storedWorkspace = EMPTY_WORKSPACE_VALUE;
    }
    setWorkspace(storedWorkspace);
    setLoadedStorageKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(normalizeWorkspace(workspace)));
    } catch {
      // Local persistence is best effort; the in-memory workspace remains usable.
    }
  }, [loadedStorageKey, storageKey, workspace]);

  useEffect(() => {
    if (view !== "create" || step !== 1) return;
    const firstInvalidField = (["title", "department", "location", "description"] as JobField[]).find((field) => fieldErrors[field]);
    if (firstInvalidField === "title") titleRef.current?.focus();
    if (firstInvalidField === "department") departmentRef.current?.focus();
    if (firstInvalidField === "location") locationRef.current?.focus();
    if (firstInvalidField === "description") descriptionRef.current?.focus();
  }, [fieldErrors, step, view]);

  useEffect(() => {
    if (view === "create" && step === 2 && criteriaError) firstCriterionRef.current?.focus();
  }, [criteriaError, step, view]);

  const beginCreating = () => {
    setDraft(createEmptyDraft());
    setFieldErrors({});
    setCriteriaError(null);
    setStep(1);
    setView("create");
  };

  const cancelCreating = () => {
    setDraft(createEmptyDraft());
    setFieldErrors({});
    setCriteriaError(null);
    setStep(1);
    setView("portfolio");
  };

  const updateDraftField = (field: JobField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const continueToScorecard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: JobFieldErrors = {};
    if (!draft.title.trim()) errors.title = "Add a job title to continue.";
    if (!draft.department.trim()) errors.department = "Add a department so the role is easy to find.";
    if (!draft.location.trim()) errors.location = "Add a location, or write remote if applicable.";
    if (!draft.description.trim()) errors.description = "Add a short description of the work and its context.";
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) {
      setCriteriaError(null);
      setStep(2);
    }
  };

  const updateCriterion = (draftId: string, field: keyof Omit<CriterionDraft, "draftId">, value: string) => {
    setDraft((current) => ({
      ...current,
      criteria: current.criteria.map((criterion) => {
        if (criterion.draftId !== draftId) return criterion;
        if (field === "importance") return { ...criterion, importance: value as Importance };
        if (field === "weight") return { ...criterion, weight: Number(value) };
        return { ...criterion, name: value };
      }),
    }));
    setCriteriaError(null);
  };

  const addCriterion = () => {
    setDraft((current) => ({
      ...current,
      criteria: [...current.criteria, createDraftCriterion(`criterion-${current.criteria.length + 1}-${Date.now()}`)],
    }));
  };

  const removeCriterion = (draftId: string) => {
    setDraft((current) => {
      if (current.criteria.length <= 1) return current;
      return { ...current, criteria: current.criteria.filter((criterion) => criterion.draftId !== draftId) };
    });
  };

  const createJob = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const criteria = draft.criteria
      .filter((criterion) => criterion.name.trim())
      .map((criterion) => ({
        id: getUuid(),
        name: criterion.name.trim(),
        importance: criterion.importance,
        weight: criterion.weight,
      }));

    if (criteria.length === 0) {
      setCriteriaError("Add at least one non-empty criterion before creating the role.");
      return;
    }

    const job: RecruitingJob = {
      id: getUuid(),
      title: draft.title.trim(),
      department: draft.department.trim(),
      location: draft.location.trim(),
      description: draft.description.trim(),
      createdAt: new Date().toISOString(),
      scorecard: criteria,
      candidates: [],
    };
    setWorkspace((current) => ({
      version: current.version,
      selectedJobId: job.id,
      jobs: [job, ...current.jobs],
    }));
    setView("portfolio");
    setStep(1);
    setDraft(createEmptyDraft());
    setFieldErrors({});
    setCriteriaError(null);
  };

  const pageMotion = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };

  if (isLoading) {
    return (
      <DashboardLayout activeLabel="HR Workspace">
        <div className="mx-auto max-w-6xl pb-16" aria-busy="true">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="flex min-h-52 items-center justify-center p-6">
              <p className="text-sm font-medium text-slate-500">Loading your workspace…</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeLabel="HR Workspace">
      <motion.div
        initial={false}
        animate={pageMotion}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
        className="mx-auto max-w-6xl space-y-6 pb-16"
      >
        <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recruiting workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Build a focused hiring process.</h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600">
              Define the role and the scorecard you will use to review candidates consistently.
            </p>
          </div>
          {view === "portfolio" && (
            <Button type="button" size="lg" className="w-full sm:w-auto" onClick={beginCreating}>
              <Plus aria-hidden="true" />
              Add new
            </Button>
          )}
        </header>

        {view === "create" ? (
          <CreateFlow
            draft={draft}
            step={step}
            fieldErrors={fieldErrors}
            criteriaError={criteriaError}
            titleRef={titleRef}
            departmentRef={departmentRef}
            locationRef={locationRef}
            descriptionRef={descriptionRef}
            firstCriterionRef={firstCriterionRef}
            onCancel={cancelCreating}
            onBack={() => setStep(1)}
            onContinue={continueToScorecard}
            onCreate={createJob}
            onFieldChange={updateDraftField}
            onCriterionChange={updateCriterion}
            onAddCriterion={addCriterion}
            onRemoveCriterion={removeCriterion}
          />
        ) : workspace.jobs.length === 0 ? (
          <EmptyPortfolio />
        ) : (
          <>
            <JobRail
              jobs={workspace.jobs}
              selectedJobId={workspace.selectedJobId}
              onSelect={(jobId) => setWorkspace((current) => ({ ...current, selectedJobId: jobId }))}
            />
            {selectedJob && <SelectedJobWorkspace job={selectedJob} />}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

function EmptyPortfolio() {
  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-slate-500">
          <BriefcaseBusiness aria-hidden="true" className="size-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">No roles yet</h2>
        <p className="mt-2 max-w-md text-base leading-relaxed text-slate-600">
          Start with one role and a practical scorecard. Your recruiting workspace will grow from there.
        </p>
        <p className="sr-only">Use Add new above to create your first role.</p>
      </CardContent>
    </Card>
  );
}

function JobRail({
  jobs,
  selectedJobId,
  onSelect,
}: {
  jobs: RecruitingJob[];
  selectedJobId: string | null;
  onSelect: (jobId: string) => void;
}) {
  return (
    <section aria-labelledby="active-jobs-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="active-jobs-heading" className="text-sm font-semibold text-slate-900">Active jobs</h2>
          <p className="text-sm text-slate-500">Choose a role to review its scorecard.</p>
        </div>
        <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
          {jobs.length} {jobs.length === 1 ? "role" : "roles"}
        </Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1" role="list" aria-label="Active jobs">
        {jobs.map((job) => {
          const selected = job.id === selectedJobId;
          return (
            <div key={job.id} role="listitem" className="min-w-64 flex-1">
              <button
                type="button"
                aria-current={selected ? "true" : undefined}
                aria-pressed={selected}
                onClick={() => onSelect(job.id)}
                className={cn(
                  "w-full rounded-xl border bg-white p-4 text-left shadow-sm outline-none transition-colors focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200",
                  selected ? "border-blue-500 ring-1 ring-blue-100" : "border-gray-200 hover:border-slate-300",
                )}
              >
                <span className="block truncate text-sm font-semibold text-slate-900">{job.title}</span>
                <span className="mt-1 block truncate text-sm text-slate-500">{job.department || "Department not set"}</span>
                <span className="mt-3 flex items-center gap-1.5 text-xs font-medium tabular-nums text-slate-600">
                  <Users aria-hidden="true" className="size-3.5" />
                  {job.candidates.length} {job.candidates.length === 1 ? "candidate" : "candidates"}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SelectedJobWorkspace({ job }: { job: RecruitingJob }) {
  return (
    <section aria-labelledby="selected-role-heading" className="space-y-6">
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="gap-4 border-b border-gray-100 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Selected role</p>
            <CardTitle id="selected-role-heading" className="text-2xl text-slate-900">{job.title}</CardTitle>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness aria-hidden="true" className="size-4" />{job.department || "Department not set"}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-4" />{job.location || "Location not set"}</span>
            </div>
          </div>
          <Badge variant="outline" className="w-fit border-slate-200 bg-slate-50 text-slate-600">Ready to review</Badge>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Role description</h3>
            <p className="mt-2 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-slate-600">{job.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-gray-200 bg-gray-50 shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <Users aria-hidden="true" className="size-5 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Candidates</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{job.candidates.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-gray-50 shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <Check aria-hidden="true" className="size-5 text-slate-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Scorecard criteria</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{job.scorecard.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Scorecard summary</CardTitle>
          <CardDescription>Use these criteria to keep every candidate review grounded in the role.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {job.scorecard.map((criterion) => (
            <div key={criterion.id} className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
              <span className="min-w-0 break-words text-sm font-medium text-slate-800">{criterion.name}</span>
              <Badge variant="outline" className="shrink-0 border-slate-200 text-slate-600">
                {criterion.importance === "required" ? "Required" : "Preferred"} · {criterion.weight}/5
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-gray-50 shadow-none">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-slate-700">Resume processing is added in the next plan task.</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">Candidate results will appear here once that workflow is available.</p>
        </CardContent>
      </Card>
    </section>
  );
}

function CreateFlow({
  draft,
  step,
  fieldErrors,
  criteriaError,
  titleRef,
  departmentRef,
  locationRef,
  descriptionRef,
  firstCriterionRef,
  onCancel,
  onBack,
  onContinue,
  onCreate,
  onFieldChange,
  onCriterionChange,
  onAddCriterion,
  onRemoveCriterion,
}: {
  draft: JobDraft;
  step: 1 | 2;
  fieldErrors: JobFieldErrors;
  criteriaError: string | null;
  titleRef: RefObject<HTMLInputElement | null>;
  departmentRef: RefObject<HTMLInputElement | null>;
  locationRef: RefObject<HTMLInputElement | null>;
  descriptionRef: RefObject<HTMLTextAreaElement | null>;
  firstCriterionRef: RefObject<HTMLInputElement | null>;
  onBack: () => void;
  onContinue: (event: FormEvent<HTMLFormElement>) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: JobField, value: string) => void;
  onCriterionChange: (draftId: string, field: keyof Omit<CriterionDraft, "draftId">, value: string) => void;
  onAddCriterion: () => void;
  onRemoveCriterion: (draftId: string) => void;
}) {
  return (
    <section aria-labelledby="create-job-heading" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step {step} of 2</p>
          <h2 id="create-job-heading" className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {step === 1 ? "Add a new role" : "Build the scorecard"}
          </h2>
        </div>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {step === 1 ? (
        <form className="space-y-6" onSubmit={onContinue} noValidate>
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Role details</CardTitle>
              <CardDescription>Give reviewers enough context to understand the opportunity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field label="Job title" id="job-title" error={fieldErrors.title}>
                <Input
                  ref={titleRef}
                  id="job-title"
                  name="title"
                  autoComplete="organization-title"
                  value={draft.title}
                  onChange={(event) => onFieldChange("title", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? "job-title-error" : undefined}
                  className="text-base sm:text-sm"
                />
              </Field>
              <Field label="Department" id="job-department" error={fieldErrors.department}>
                <Input
                  ref={departmentRef}
                  id="job-department"
                  name="department"
                  autoComplete="organization"
                  value={draft.department}
                  onChange={(event) => onFieldChange("department", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.department)}
                  aria-describedby={fieldErrors.department ? "job-department-error" : undefined}
                  className="text-base sm:text-sm"
                />
              </Field>
              <Field label="Location" id="job-location" error={fieldErrors.location}>
                <Input
                  ref={locationRef}
                  id="job-location"
                  name="location"
                  autoComplete="address-level2"
                  value={draft.location}
                  onChange={(event) => onFieldChange("location", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.location)}
                  aria-describedby={fieldErrors.location ? "job-location-error" : undefined}
                  className="text-base sm:text-sm"
                />
              </Field>
              <Field label="Description" id="job-description" error={fieldErrors.description} className="sm:col-span-2">
                <textarea
                  ref={descriptionRef}
                  id="job-description"
                  name="description"
                  rows={6}
                  value={draft.description}
                  onChange={(event) => onFieldChange("description", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={fieldErrors.description ? "job-description-error" : undefined}
                  className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 sm:text-sm"
                />
              </Field>
            </CardContent>
          </Card>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Continue to scorecard <ChevronRight aria-hidden="true" /></Button>
          </div>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={onCreate} noValidate>
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">What matters for this role?</CardTitle>
              <CardDescription>Set the criteria reviewers should use. You can mark each one required or preferred and weight it from 1 to 5.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="hidden gap-4 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 sm:grid sm:grid-cols-[minmax(0,1fr)_9rem_6rem_2.5rem]">
                <span>Criterion</span><span>Importance</span><span>Weight</span><span className="sr-only">Actions</span>
              </div>
              {draft.criteria.map((criterion, index) => (
                <div key={criterion.draftId} className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-[minmax(0,1fr)_9rem_6rem_2.5rem] sm:items-end sm:border-0 sm:p-0">
                  <div>
                    <label htmlFor={`criterion-name-${criterion.draftId}`} className="text-sm font-medium text-slate-700">Criterion {index + 1}</label>
                    <Input
                      ref={index === 0 ? firstCriterionRef : undefined}
                      id={`criterion-name-${criterion.draftId}`}
                      name={`criterion-${criterion.draftId}`}
                      value={criterion.name}
                      onChange={(event) => onCriterionChange(criterion.draftId, "name", event.target.value)}
                      aria-invalid={Boolean(criteriaError && draft.criteria.every((item) => !item.name.trim()))}
                      aria-describedby={criteriaError ? "criteria-error" : undefined}
                      className="mt-2 text-base sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`criterion-importance-${criterion.draftId}`} className="text-sm font-medium text-slate-700 sm:sr-only">Importance</label>
                    <select
                      id={`criterion-importance-${criterion.draftId}`}
                      name={`importance-${criterion.draftId}`}
                      value={criterion.importance}
                      onChange={(event) => onCriterionChange(criterion.draftId, "importance", event.target.value)}
                      className="mt-2 h-9 w-full rounded-md border border-input bg-white px-3 text-base text-slate-800 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 sm:text-sm"
                    >
                      <option value="required">Required</option>
                      <option value="preferred">Preferred</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`criterion-weight-${criterion.draftId}`} className="text-sm font-medium text-slate-700 sm:sr-only">Weight, 1 to 5</label>
                    <select
                      id={`criterion-weight-${criterion.draftId}`}
                      name={`weight-${criterion.draftId}`}
                      value={criterion.weight}
                      onChange={(event) => onCriterionChange(criterion.draftId, "weight", event.target.value)}
                      className="mt-2 h-9 w-full rounded-md border border-input bg-white px-3 text-base text-slate-800 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 sm:text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((weight) => <option key={weight} value={weight}>{weight}</option>)}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label={`Remove criterion ${index + 1}`}
                    disabled={draft.criteria.length === 1}
                    onClick={() => onRemoveCriterion(criterion.draftId)}
                    className="min-h-10 min-w-10 text-slate-500 hover:text-slate-900"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              ))}
              {criteriaError && <p id="criteria-error" role="alert" className="text-sm font-medium text-slate-700">{criteriaError}</p>}
              <Button type="button" variant="outline" onClick={onAddCriterion}>
                <Plus aria-hidden="true" />
                Add criterion
              </Button>
            </CardContent>
          </Card>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="ghost" onClick={onBack}>
              <ArrowLeft aria-hidden="true" /> Back to role details
            </Button>
            <Button type="submit">Create role <Check aria-hidden="true" /></Button>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  id,
  error,
  className,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="text-sm text-slate-600">{error}</p>}
    </div>
  );
}
