import { create } from 'zustand';
import { Signal } from './useSignalStore';
import { MOCK_PROBLEMS, MOCK_SIGNALS, MOCK_ACCOUNTS } from '../lib/mockData';

export interface Problem {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  status: string;
  severity: string | null;
  trend: string | null;
  product_area: string | null;
  evidence_count: number;
  affected_arr: number;
  created_at: string;
}

export interface ProblemAccount {
  id: string;
  name: string;
  domain: string;
  arr: number;
  plan: string;
  health_score: string;
  signal_count: number;
  last_signal_date: string;
}

interface ProblemStore {
  problems: Problem[];
  currentProblem: Problem | null;
  problemSignals: Signal[];
  problemAccounts: ProblemAccount[];
  isLoading: boolean;
  error: string | null;
  fetchProblems: (workspaceId: string) => Promise<void>;
  fetchProblemDetails: (problemId: string) => Promise<void>;
}

export const useProblemStore = create<ProblemStore>((set) => ({
  problems: MOCK_PROBLEMS,
  currentProblem: null,
  problemSignals: [],
  problemAccounts: [],
  isLoading: false,
  error: null,

  fetchProblems: async (workspaceId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  },

  fetchProblemDetails: async (problemId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      const prob = MOCK_PROBLEMS.find(p => p.id === problemId) || null;
      
      // Mock associated signals based on problem index
      const sigs = problemId === 'prob-1' ? [MOCK_SIGNALS[0]] : problemId === 'prob-2' ? [MOCK_SIGNALS[1]] : [MOCK_SIGNALS[2]];
      
      // Mock associated accounts
      const accs = problemId === 'prob-1' ? [MOCK_ACCOUNTS[0]] : problemId === 'prob-2' ? [MOCK_ACCOUNTS[1]] : [MOCK_ACCOUNTS[2]];

      set({
        currentProblem: prob,
        problemSignals: sigs,
        problemAccounts: accs as any,
        isLoading: false,
      });
    }, 500);
  }
}));
