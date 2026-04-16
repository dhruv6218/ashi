import { create } from 'zustand';
import { MOCK_ACCOUNTS } from '../lib/mockData';

export interface Account {
  id: string;
  workspace_id: string;
  name: string;
  domain: string | null;
  arr: number;
  plan: string | null;
  health_score: string | null;
  created_at: string;
}

interface AccountStore {
  accounts: Account[];
  currentAccount: Account | null;
  isLoading: boolean;
  error: string | null;
  fetchAccounts: (workspaceId: string) => Promise<void>;
  fetchAccountDetails: (accountId: string) => Promise<void>;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,

  fetchAccounts: async (workspaceId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set({ accounts: MOCK_ACCOUNTS, isLoading: false });
    }, 500);
  },

  fetchAccountDetails: async (accountId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      const acc = MOCK_ACCOUNTS.find(a => a.id === accountId) || null;
      set({ currentAccount: acc, isLoading: false });
    }, 500);
  }
}));
