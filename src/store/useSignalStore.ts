import { create } from 'zustand';
import { MOCK_SIGNALS } from '../lib/mockData';

export interface Signal {
  id: string;
  workspace_id: string;
  source_type: string;
  raw_text: string;
  normalized_text: string | null;
  sentiment_label: string | null;
  severity_label: string | null;
  category: string | null;
  product_area: string | null;
  created_at: string;
  account_id: string | null;
  accounts?: {
    name: string;
    arr: number;
    plan: string;
  };
}

interface SignalStore {
  signals: Signal[];
  isLoading: boolean;
  error: string | null;
  fetchSignals: (workspaceId: string) => Promise<void>;
}

export const useSignalStore = create<SignalStore>((set) => ({
  signals: MOCK_SIGNALS,
  isLoading: false,
  error: null,

  fetchSignals: async (workspaceId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  }
}));
