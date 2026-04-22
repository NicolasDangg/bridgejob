import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

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
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLatest = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: rows, error: err } = await supabase
          .from('analysis_history')
          .select('id, analysisresult, created_at')
          .eq('userid', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (err) throw err;

        if (rows && rows.length > 0) {
          const row = rows[0];
          let analysisResult = row.analysisresult;
          if (typeof analysisResult === 'string') {
            analysisResult = JSON.parse(analysisResult);
          }
          setData(mapFitResponseToAnalysis(row.id, row.created_at, analysisResult));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load analysis'));
      } finally {
        setLoading(false);
      }
    };

    loadLatest();
  }, [user?.id]);

  return { data, loading, error };
}

export function useAnalysisHistory() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Analysis[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: rows, error: err } = await supabase
          .from('analysis_history')
          .select('id, analysisresult, created_at')
          .eq('userid', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (err) throw err;

        if (rows) {
          const analyses = rows.map(row => {
            let analysisResult = row.analysisresult;
            if (typeof analysisResult === 'string') {
              analysisResult = JSON.parse(analysisResult);
            }
            return mapFitResponseToAnalysis(row.id, row.created_at, analysisResult);
          });
          setData(analyses);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load history'));
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user?.id]);

  return { data, loading, error };
}
