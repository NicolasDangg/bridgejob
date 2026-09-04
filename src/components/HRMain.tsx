import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowLeft,
  ArrowUp01,
  ArrowUpAZ,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  Clock3,
  Download,
  FileText,
  FileWarning,
  LoaderCircle,
  MapPin,
  Plus,
  Trash2,
  Users,
  XCircle,
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
import {
  EMPTY_WORKSPACE,
  createCandidateResults,
  normalizeWorkspace,
  serializeCandidatesCsv,
  sortCandidates,
  updateCandidateDecision,
  validateResumeFiles,
} from "./hrWorkflow.js";

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
type UploadPhase = "queued" | "processing" | "complete";
type CandidateSortKey = "name" | "score" | "evidence" | "gaps" | "decision";
type SortDirection = "asc" | "desc";

interface UploadStatus {
  batchId: string;
  targetJobId: string;
  targetJobTitle: string;
  files: string[];
  phase: UploadPhase;
}

function slugifyJobTitle(title: string): string {
  const slug = title
    .toLocaleLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "job"}-candidates.csv`;
}

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

function storageKeyFor(userId: string | undefined): string {
  return `${STORAGE_PREFIX}${userId || "guest"}`;
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
  const storageKey = storageKeyFor(user?.id);
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
  const detailsHeadingRef = useRef<HTMLHeadingElement>(null);
  const scorecardHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef<1 | 2>(1);
  const reduceMotion = useReducedMotion();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadTimersRef = useRef<number[]>([]);

  const isLoading = loadedStorageKey !== storageKey;
  const selectedJob = useMemo(
    () => workspace.jobs.find((job) => job.id === workspace.selectedJobId) ?? null,
    [workspace.jobs, workspace.selectedJobId],
  );

  useEffect(() => {
    uploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    uploadTimersRef.current = [];
    setUploadStatus(null);
    setUploadError(null);
    let storedWorkspace: Workspace = EMPTY_WORKSPACE_VALUE;
    setView("portfolio");
    setStep(1);
    setDraft(createEmptyDraft());
    setFieldErrors({});
    setCriteriaError(null);
    previousStepRef.current = 1;
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
  useEffect(() => () => {
    uploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    uploadTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (view !== "create" || previousStepRef.current === step) return;
    previousStepRef.current = step;
    if (step === 2) scorecardHeadingRef.current?.focus();
    if (step === 1) detailsHeadingRef.current?.focus();
  }, [step, view]);

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
    if (Object.keys(errors).length > 0) {
      const firstInvalidField = (["title", "department", "location", "description"] as JobField[]).find((field) => errors[field]);
      if (firstInvalidField === "title") titleRef.current?.focus();
      if (firstInvalidField === "department") departmentRef.current?.focus();
      if (firstInvalidField === "location") locationRef.current?.focus();
      if (firstInvalidField === "description") descriptionRef.current?.focus();
      return;
    }
    setCriteriaError(null);
    setStep(2);
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
      firstCriterionRef.current?.focus();
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
  const handleResumeUpload = (files: FileList | null) => {
    const validation = validateResumeFiles(files);
    if (!validation.valid) {
      setUploadError(
        validation.rejected.length > 0
          ? `Unsupported file type: ${validation.rejected.join(", ")}. Choose only .zip, .pdf, or .docx files and try again.`
          : "Choose at least one .zip, .pdf, or .docx file and try again.",
      );
      return;
    }
    if (uploadStatus?.phase === "queued" || uploadStatus?.phase === "processing") {
      setUploadError("Finish the current file batch before choosing another.");
      return;
    }
    uploadTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    uploadTimersRef.current = [];
    setUploadError(null);

    const targetJobId = workspace.selectedJobId;
    const targetJob = workspace.jobs.find((candidateJob) => candidateJob.id === targetJobId);
    if (!targetJob) return;
    const acceptedFiles = [...validation.accepted];
    const batchId = `batch-${Date.now()}-${getUuid()}`;
    setUploadStatus({
      batchId,
      targetJobId: targetJob.id,
      targetJobTitle: targetJob.title,
      files: acceptedFiles,
      phase: "queued",
    });

    const processingTimer = window.setTimeout(() => {
      setUploadStatus((current) => current?.batchId === batchId ? { ...current, phase: "processing" } : current);
    }, 350);
    const completeTimer = window.setTimeout(() => {
      setWorkspace((current) => {
        const currentTarget = current.jobs.find((candidateJob) => candidateJob.id === targetJob.id);
        if (!currentTarget) return current;
        const candidates = createCandidateResults(targetJob, acceptedFiles, batchId);
        if (candidates.length === 0) return current;
        return {
          ...current,
          jobs: current.jobs.map((candidateJob) => candidateJob.id === targetJob.id
            ? { ...candidateJob, candidates: [...candidateJob.candidates, ...candidates] }
            : candidateJob),
        };
      });
      setUploadStatus((current) => current?.batchId === batchId ? { ...current, phase: "complete" } : current);
    }, 1100);
    uploadTimersRef.current = [processingTimer, completeTimer];
  };

  const handleResumeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleResumeUpload(event.currentTarget.files);
    event.currentTarget.value = "";
  };

  const handleDecisionChange = (candidateId: string, decision: CandidateDecision) => {
    setWorkspace((current) => current.selectedJobId
      ? updateCandidateDecision(current, current.selectedJobId, candidateId, decision)
      : current);
  };


  const pageMotion = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };
  const pageHeader = (
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
  );

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
        {view === "create" ? (
          <>
            {pageHeader}
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
              detailsHeadingRef={detailsHeadingRef}
              scorecardHeadingRef={scorecardHeadingRef}
              onCancel={cancelCreating}
              onBack={() => setStep(1)}
              onContinue={continueToScorecard}
              onCreate={createJob}
              onFieldChange={updateDraftField}
              onCriterionChange={updateCriterion}
              onAddCriterion={addCriterion}
              onRemoveCriterion={removeCriterion}
            />
          </>
        ) : workspace.jobs.length === 0 ? (
          <>
            {pageHeader}
            <EmptyPortfolio />
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="min-w-0 lg:col-span-3">
              <JobRail
                jobs={workspace.jobs}
                selectedJobId={workspace.selectedJobId}
                onSelect={(jobId) => setWorkspace((current) => ({ ...current, selectedJobId: jobId }))}
              />
            </div>
            {selectedJob && (
              <div className="min-w-0 space-y-6 lg:col-span-9">
                {pageHeader}
                <SelectedJobWorkspace
                  key={selectedJob.id}
                  job={selectedJob}
                  uploadStatus={uploadStatus}
                  uploadError={uploadError}
                  onInputChange={handleResumeInputChange}
                  onDecisionChange={handleDecisionChange}
                />
              </div>
            )}
          </div>
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
      <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" role="list" aria-label="Active jobs">
        {jobs.map((job) => {
          const selected = job.id === selectedJobId;
          return (
            <div key={job.id} role="listitem" className="min-w-64 flex-1 lg:min-w-0">
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

function SelectedJobWorkspace({
  job,
  uploadStatus,
  uploadError,
  onInputChange,
  onDecisionChange,
}: {
  job: RecruitingJob;
  uploadStatus: UploadStatus | null;
  uploadError: string | null;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDecisionChange: (candidateId: string, decision: CandidateDecision) => void;
}) {
  const [sortState, setSortState] = useState<{ key: CandidateSortKey; direction: SortDirection }>({
    key: "score",
    direction: "desc",
  });
  const [expandedCandidateIds, setExpandedCandidateIds] = useState<Set<string>>(() => new Set());
  const sortedCandidates = useMemo(
    () => sortCandidates(job.candidates, sortState),
    [job.candidates, sortState],
  );
  const activeStats = useMemo(() => ({
    totalCandidates: job.candidates.length,
    highScoreCount: job.candidates.filter((candidate) => candidate.score >= 80).length,
    reviewedCount: job.candidates.filter((candidate) => candidate.decision !== "undecided").length,
    currentProcessingCount: uploadStatus?.targetJobId === job.id && uploadStatus.phase !== "complete" ? 1 : 0,
  }), [job.id, job.candidates, uploadStatus?.phase, uploadStatus?.targetJobId]);
  const isCurrentBatchTarget = uploadStatus?.targetJobId === job.id;
  const progress = uploadStatus?.phase === "complete" ? 100 : uploadStatus?.phase === "processing" ? 50 : 0;

  const changeSort = (key: CandidateSortKey) => {
    setSortState((current) => current.key === key
      ? { key, direction: current.direction === "desc" ? "asc" : "desc" }
      : { key, direction: key === "name" || key === "decision" ? "asc" : "desc" });
  };

  const toggleExpanded = (candidateId: string) => {
    setExpandedCandidateIds((current) => {
      const next = new Set(current);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  };

  const exportCsv = () => {
    if (sortedCandidates.length === 0) return;
    const blob = new Blob([serializeCandidatesCsv(sortedCandidates)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = slugifyJobTitle(job.title);
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const sortIcon = (key: CandidateSortKey) => {
    if (sortState.key !== key) return <ChevronsUpDown aria-hidden="true" className="size-4 text-slate-400" />;
    return sortState.direction === "asc"
      ? (key === "name" || key === "decision"
        ? <ArrowUpAZ aria-hidden="true" className="size-4 text-blue-600" />
        : <ArrowUp01 aria-hidden="true" className="size-4 text-blue-600" />)
      : (key === "name" || key === "decision"
        ? <ArrowDownAZ aria-hidden="true" className="size-4 text-blue-600" />
        : <ArrowDown01 aria-hidden="true" className="size-4 text-blue-600" />);
  };
  const sortHeader = (key: CandidateSortKey, label: string) => {
    const active = sortState.key === key;
    const defaultDirection = key === "name" || key === "decision" ? "ascending" : "descending";
    const nextDirection = active
      ? (sortState.direction === "desc" ? "ascending" : "descending")
      : defaultDirection;
    const directionLabel = active
      ? `currently ${sortState.direction === "desc" ? "descending" : "ascending"}`
      : "not currently sorted";
    return (
      <button
        type="button"
        onClick={() => changeSort(key)}
        aria-label={`Sort by ${label}; ${directionLabel}. Activate for ${nextDirection} order.`}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-md text-left font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <span>{label}</span>
        {sortIcon(key)}
      </button>
    );
  };

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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Users aria-hidden="true" className="size-5" />} label="Total candidates" value={activeStats.totalCandidates} />
            <StatCard icon={<Check aria-hidden="true" className="size-5" />} label="Score 80 or higher" value={activeStats.highScoreCount} />
            <StatCard icon={<CheckCircle2 aria-hidden="true" className="size-5" />} label="Reviewed decisions" value={activeStats.reviewedCount} />
            <StatCard icon={<LoaderCircle aria-hidden="true" className="size-5" />} label="Current processing" value={activeStats.currentProcessingCount} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Scorecard summary</h3>
            <p className="mt-1 text-sm text-slate-500">Criteria keep each review grounded in the role.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {job.scorecard.map((criterion) => (
                <div key={criterion.id} className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
                  <span className="min-w-0 break-words text-sm font-medium text-slate-800">{criterion.name}</span>
                  <Badge variant="outline" className="shrink-0 border-slate-200 text-slate-600">
                    {criterion.importance === "required" ? "Required" : "Preferred"} · {criterion.weight}/5
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">Add candidate files</CardTitle>
          <CardDescription>Local demo intake accepts ZIP, PDF, and DOCX files. Nothing is uploaded.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="resume-files" className="text-sm font-medium text-slate-700">Resume files</label>
            <Input
              id="resume-files"
              type="file"
              disabled={uploadStatus?.phase === "queued" || uploadStatus?.phase === "processing"}
              accept=".zip,.pdf,.docx"
              multiple
              onChange={onInputChange}
              aria-describedby="resume-files-help"
              className="h-auto min-h-11 py-2"
            />
            <p id="resume-files-help" className="text-sm text-slate-500">Choose one or more files. Supported types: .zip, .pdf, .docx.</p>
          </div>
          {uploadError && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <FileWarning aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
          <div role="status" aria-live="polite" aria-atomic="true" className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium">This is a local demo. File contents never leave the browser.</p>
            {!uploadStatus ? (
              <p className="mt-1 text-slate-500">Choose files above to queue local demo candidates.</p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {uploadStatus.phase === "queued" && <Clock3 aria-hidden="true" className="size-4 text-amber-600" />}
                  {uploadStatus.phase === "processing" && <LoaderCircle aria-hidden="true" className="size-4 text-blue-600" />}
                  {uploadStatus.phase === "complete" && <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" />}
                  <span className="font-medium">
                    {uploadStatus.phase === "queued" && "Queued"}
                    {uploadStatus.phase === "processing" && "Processing local demo data"}
                    {uploadStatus.phase === "complete" && "Complete"}
                  </span>
                  <span className="text-slate-500">for {uploadStatus.targetJobTitle}</span>
                </div>
                <progress value={progress} max={100} aria-label={`${progress}% complete`} className="h-2 w-full accent-blue-600" />
                <p className="tabular-nums text-slate-600">{progress}% complete · {uploadStatus.files.length} {uploadStatus.files.length === 1 ? "file" : "files"}</p>
                <ul className="grid gap-1 text-slate-600 sm:grid-cols-2">
                  {uploadStatus.files.map((file) => <li key={file} className="flex min-w-0 items-start gap-2 break-words"><FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span>{file}</span></li>)}
                </ul>
                {!isCurrentBatchTarget && <p className="text-slate-500">This batch stays assigned to its original target job.</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-900">Candidate results</CardTitle>
            <CardDescription>Local demo data only; files are not parsed or scored in the browser.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={exportCsv}
            disabled={sortedCandidates.length === 0}
            aria-label="Export candidates as CSV"
            className="w-full sm:w-auto"
          >
            <Download aria-hidden="true" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {sortedCandidates.length === 0 ? (
            <div className="px-6 pb-6 text-sm text-slate-600">
              No candidates yet. Add one or more resume files above to create local demo candidates.
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto border-t border-gray-100">
              <table className="w-full min-w-[760px] text-left text-sm">
                <caption className="sr-only">Candidate results for {job.title}</caption>
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" aria-sort={sortState.key === "name" ? (sortState.direction === "asc" ? "ascending" : "descending") : "none"} className="px-6 py-3">{sortHeader("name", "Candidate")}</th>
                    <th scope="col" aria-sort={sortState.key === "score" ? (sortState.direction === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3">{sortHeader("score", "Score")}</th>
                    <th scope="col" aria-sort={sortState.key === "evidence" ? (sortState.direction === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3">{sortHeader("evidence", "Evidence met")}</th>
                    <th scope="col" aria-sort={sortState.key === "gaps" ? (sortState.direction === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3">{sortHeader("gaps", "Missing + unclear")}</th>
                    <th scope="col" aria-sort={sortState.key === "decision" ? (sortState.direction === "asc" ? "ascending" : "descending") : "none"} className="px-4 py-3">{sortHeader("decision", "Decision")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedCandidates.map((candidate) => {
                    const evidenceCount = candidate.assessments.filter((assessment) => assessment.status === "met").length;
                    const gapsCount = candidate.assessments.filter((assessment) => assessment.status === "missing" || assessment.status === "unclear").length;
                    const expanded = expandedCandidateIds.has(candidate.id);
                    const evidenceId = `candidate-evidence-${candidate.id}`;
                    return (
                      <FragmentRow
                        key={candidate.id}
                        candidate={candidate}
                        evidenceCount={evidenceCount}
                        gapsCount={gapsCount}
                        expanded={expanded}
                        evidenceId={evidenceId}
                        onToggle={() => toggleExpanded(candidate.id)}
                        onDecisionChange={onDecisionChange}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card className="border-gray-200 bg-gray-50 shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="text-slate-500">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FragmentRow({
  candidate,
  evidenceCount,
  gapsCount,
  expanded,
  evidenceId,
  onToggle,
  onDecisionChange,
}: {
  candidate: Candidate;
  evidenceCount: number;
  gapsCount: number;
  expanded: boolean;
  evidenceId: string;
  onToggle: () => void;
  onDecisionChange: (candidateId: string, decision: CandidateDecision) => void;
}) {
  return (
    <>
      <tr className="align-top">
        <th scope="row" className="px-6 py-4 font-medium text-slate-900">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={evidenceId}
            onClick={onToggle}
            className="inline-flex min-h-10 max-w-full items-start gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <ChevronDown aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0 motion-safe:transition-transform motion-reduce:transition-none", expanded && "rotate-180")} />
            <span className="min-w-0 break-words">
              <span className="block">{candidate.name}</span>
              <span className="mt-1 block break-all text-xs font-normal text-slate-500">{candidate.sourceFile}</span>
            </span>
          </button>
        </th>
        <td className="px-4 py-4 font-semibold tabular-nums text-slate-900">{candidate.score}</td>
        <td className="px-4 py-4 tabular-nums text-slate-700"><span className="inline-flex items-center gap-1.5"><CheckCircle2 aria-hidden="true" className="size-4 text-emerald-600" />{evidenceCount}</span></td>
        <td className="px-4 py-4 tabular-nums text-slate-700"><span className="inline-flex items-center gap-1.5"><CircleAlert aria-hidden="true" className="size-4 text-amber-600" />{gapsCount}</span></td>
        <td className="px-4 py-4">
          <label htmlFor={`decision-${candidate.id}`} className="mb-1 block text-xs font-medium text-slate-500 sm:sr-only">Decision for {candidate.name}</label>
          <select
            id={`decision-${candidate.id}`}
            value={candidate.decision}
            onChange={(event) => onDecisionChange(candidate.id, event.currentTarget.value as CandidateDecision)}
            className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200 md:text-sm"
          >
            <option value="undecided">Undecided</option>
            <option value="advance">Advance</option>
            <option value="hold">Hold</option>
            <option value="reject">Reject</option>
          </select>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td id={evidenceId} colSpan={5} className="bg-slate-50 px-6 py-5">
            <h3 className="text-sm font-semibold text-slate-900">Assessment evidence for {candidate.name}</h3>
            <ul className="mt-3 space-y-3">
              {candidate.assessments.map((assessment) => (
                <li key={assessment.criterionId} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{assessment.criterionName}</span>
                    <Badge variant="outline" className="border-slate-200 text-slate-600">{assessment.importance === "required" ? "Required" : "Preferred"}</Badge>
                    <AssessmentStatus status={assessment.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600"><span className="font-medium text-slate-800">Contribution:</span> {assessment.contribution} points</p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700"><span className="font-medium text-slate-800">Evidence:</span> {assessment.evidence || "No evidence supplied in local demo data."}</p>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

function AssessmentStatus({ status }: { status: AssessmentStatus }) {
  if (status === "met") {
    return <Badge className="gap-1 bg-emerald-100 text-emerald-800"><CheckCircle2 aria-hidden="true" className="size-3.5" />Met</Badge>;
  }
  if (status === "unclear") {
    return <Badge className="gap-1 bg-amber-100 text-amber-800"><CircleAlert aria-hidden="true" className="size-3.5" />Unclear</Badge>;
  }
  return <Badge className="gap-1 bg-red-100 text-red-800"><XCircle aria-hidden="true" className="size-3.5" />Missing</Badge>;
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
  detailsHeadingRef,
  scorecardHeadingRef,
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
  detailsHeadingRef: RefObject<HTMLHeadingElement | null>;
  scorecardHeadingRef: RefObject<HTMLHeadingElement | null>;
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
              <h3 ref={detailsHeadingRef} tabIndex={-1} className="text-lg font-semibold text-slate-900">Role details</h3>
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
              <h3 ref={scorecardHeadingRef} tabIndex={-1} className="text-lg font-semibold text-slate-900">What matters for this role?</h3>
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
