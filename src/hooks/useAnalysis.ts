import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../lib/AuthContext';

// --- Shared Types (to match Dashboard.tsx) ---

export type MatchItem = {
  skill: string;
  note?: string;
  gap_detail?: string;
  priority?: 'CRITICAL' | 'IMPORTANT' | 'NICE TO HAVE';
  learnability?: 'FAST' | 'MEDIUM' | 'SLOW';
  action?: string;
};

export type FitResponse = {
  job_title: string;
  overall_fit: 'EXCELLENCE' | 'STRONG' | 'MODERATE' | 'WEAK' | 'SEVERELY UNDERQUALIFIED';
  overall_summary: string;
  strong_matches: MatchItem[];
  partial_matches: MatchItem[];
  noise_skills: string[];
  readiness_score: number;
  bridge_steps: string[];
  analyst_note: string;
};

export interface HistoryEntry {
  id: string;
  createdAt: string;
  jobDescription: string;
  candidateProfile: string;
  response: FitResponse;
}

// --- CareerPath Specific Types ---

export interface Skill {
  name: string;
  score: number;
  category: string;
}

export interface Gap {
  name: string;
  priority: 'critical' | 'moderate' | 'low';
  recommendation: string;
  resources: { title: string; url: string }[];
  timeToProficiency: string;
  action?: string;
}

export interface Analysis {
  analysisId: string;
  jobTitle: string;
  company: string;
  readinessScore: number;
  skills: Skill[];
  gaps: Gap[];
  dateAnalyzed: string;
  rawResponse?: FitResponse; // Keep access to raw response for other features
}

// --- Mapper ---

function mapFitResponseToAnalysis(id: string, date: string, response: FitResponse): Analysis {
  return {
    analysisId: id,
    jobTitle: response.job_title,
    company: "Target Company", // Usually extracted or just a placeholder
    readinessScore: response.readiness_score,
    dateAnalyzed: date,
    rawResponse: response,
    skills: response.strong_matches.map(m => ({
      name: m.skill,
      score: 100, // Matches are considered 100% ready for that skill
      category: 'Match'
    })),
    gaps: response.partial_matches.map(m => ({
      name: m.skill,
      priority: (m.priority?.toLowerCase() as any) || 'moderate',
      recommendation: m.gap_detail || 'No specific recommendation provided.',
      action: m.action,
      timeToProficiency: m.learnability === 'FAST' ? '1-2 weeks' : m.learnability === 'SLOW' ? '2-3 months' : '4-6 weeks',
      resources: [
        { title: 'Search for courses on ' + m.skill, url: 'https://www.google.com/search?q=learn+' + encodeURIComponent(m.skill) }
      ]
    }))
  };
}

// --- Hooks ---

export function useLatestAnalysis() {
  const { user } = useAuth();
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const storageKey = useMemo(() => {
    const suffix = user?.email || 'guest';
    return `gapless.analysis.history.${suffix}`;
  }, [user?.email]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(storageKey);
      if (storedHistory) {
        const history: HistoryEntry[] = JSON.parse(storedHistory);
        if (history.length > 0) {
          const latest = history[0];
          setData(mapFitResponseToAnalysis(latest.id, latest.createdAt, latest.response));
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load analysis'));
      setLoading(false);
    }
  }, [storageKey]);

  return { data, loading, error };
}

export function useAnalysisHistory() {
  const { user } = useAuth();
  const [data, setData] = useState<Analysis[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const storageKey = useMemo(() => {
    const suffix = user?.email || 'guest';
    return `gapless.analysis.history.${suffix}`;
  }, [user?.email]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(storageKey);
      if (storedHistory) {
        const history: HistoryEntry[] = JSON.parse(storedHistory);
        setData(history.map(h => mapFitResponseToAnalysis(h.id, h.createdAt, h.response)));
      } else {
        setData([]);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load history'));
      setLoading(false);
    }
  }, [storageKey]);

  return { data, loading, error };
}
