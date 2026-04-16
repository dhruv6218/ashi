import { create } from 'zustand';
import { MOCK_OPPORTUNITIES } from '../lib/mockData';

export interface Opportunity {
  id: string;
  workspace_id: string;
  problem_id: string;
  opportunity_score: number;
  demand_score: number;
  pain_score: number;
  arr_score: number;
  trend_score: number;
  recommended_action: string | null;
  problems?: {
    id: string;
    title: string;
    evidence_count: number;
    affected_arr: number;
  };
}

interface OpportunityStore {
  opportunities: Opportunity[];
  currentOpportunity: Opportunity | null;
  isLoading: boolean;
  error: string | null;
  fetchOpportunities: (workspaceId: string) => Promise<void>;
  fetchOpportunityDetails: (opportunityId: string) => Promise<void>;
}

export const useOpportunityStore = create<OpportunityStore>((set) => ({
  opportunities: MOCK_OPPORTUNITIES,
  currentOpportunity: null,
  isLoading: false,
  error: null,

  fetchOpportunities: async (workspaceId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  },

  fetchOpportunityDetails: async (opportunityId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set(state => ({ 
        currentOpportunity: state.opportunities.find(o => o.id === opportunityId) || null, 
        isLoading: false 
      }));
    }, 500);
  },
}));
