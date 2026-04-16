import { create } from 'zustand';
import { MOCK_LAUNCHES } from '../lib/mockData';

export interface Launch {
  id: string;
  workspace_id: string;
  decision_id: string;
  jira_url: string | null;
  launched_at: string;
  created_by: string;
  created_at: string;
  title: string;
  action: string;
  status: 'active' | 'pending_review' | 'complete';
  expected_outcome?: string;
  before_count?: number;
  after_count?: number;
  pm_verdict?: string;
  notes?: string;
}

interface LaunchStore {
  launches: Launch[];
  isLoading: boolean;
  error: string | null;
  fetchLaunches: (workspaceId: string) => Promise<void>;
  createLaunch: (launch: Partial<Launch>) => Promise<Launch | null>;
  updateLaunch: (id: string, updates: Partial<Launch>) => Promise<void>;
}

export const useLaunchStore = create<LaunchStore>((set) => ({
  launches: MOCK_LAUNCHES,
  isLoading: false,
  error: null,

  fetchLaunches: async (workspaceId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  },

  createLaunch: async (launch) => {
    const newLaunch = {
      ...launch,
      id: `launch-${Math.random()}`,
      created_at: new Date().toISOString(),
      status: 'active'
    } as Launch;
    
    set(state => ({ launches: [newLaunch, ...state.launches] }));
    return newLaunch;
  },

  updateLaunch: async (id, updates) => {
    set(state => ({
      launches: state.launches.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  },
}));
