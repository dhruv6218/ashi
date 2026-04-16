import { create } from 'zustand';
import { MOCK_AUDIT_LOGS } from '../lib/mockData';

export interface AuditLog {
  id: string;
  workspace_id: string;
  user_id: string;
  action_type: string;
  description: string;
  created_at: string;
  users?: { full_name: string };
}

interface AuditStore {
  logs: AuditLog[];
  isLoading: boolean;
  fetchLogs: (workspaceId: string) => Promise<void>;
  logAction: (workspaceId: string, userId: string, actionType: string, description: string) => Promise<void>;
}

export const useAuditStore = create<AuditStore>((set) => ({
  logs: MOCK_AUDIT_LOGS,
  isLoading: false,

  fetchLogs: async (workspaceId) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  },

  logAction: async (workspaceId, userId, actionType, description) => {
    const newLog = {
      id: `al-${Math.random()}`,
      workspace_id: workspaceId,
      user_id: userId,
      action_type: actionType,
      description: description,
      created_at: new Date().toISOString(),
      users: { full_name: 'Demo User' }
    };
    set(state => ({ logs: [newLog, ...state.logs] }));
  }
}));
