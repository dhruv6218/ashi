import { create } from 'zustand';
import { MOCK_DECISIONS } from '../lib/mockData';

export interface Decision {
  id: string;
  workspace_id: string;
  title: string;
  action: string;
  rationale: string;
  author_id: string;
  created_at: string;
  users?: { full_name: string };
}

interface DecisionStore {
  decisions: Decision[];
  currentDecision: Decision | null;
  isLoading: boolean;
  error: string | null;
  fetchDecisions: (workspaceId: string) => Promise<void>;
  fetchDecisionDetails: (id: string) => Promise<void>;
  createDecision: (decision: Partial<Decision>) => Promise<Decision | null>;
}

export const useDecisionStore = create<DecisionStore>((set) => ({
  decisions: MOCK_DECISIONS,
  currentDecision: null,
  isLoading: false,
  error: null,

  fetchDecisions: async (workspaceId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  },

  fetchDecisionDetails: async (id) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set(state => ({ 
        currentDecision: state.decisions.find(d => d.id === id) || null, 
        isLoading: false 
      }));
    }, 500);
  },

  createDecision: async (decision) => {
    const newDec = {
      ...decision,
      id: `dec-${Math.random()}`,
      created_at: new Date().toISOString(),
      users: { full_name: 'Demo User' }
    } as Decision;
    
    set(state => ({ decisions: [newDec, ...state.decisions] }));
    return newDec;
  },
}));
