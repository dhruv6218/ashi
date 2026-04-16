import { create } from 'zustand';
import { MOCK_INTEGRATIONS } from '../lib/mockData';

export interface WorkspaceIntegration {
  id: string;
  workspace_id: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  config: any;
  updated_at: string;
}

interface IntegrationStore {
  integrations: WorkspaceIntegration[];
  isLoading: boolean;
  fetchIntegrations: (workspaceId: string) => Promise<void>;
  connectJira: (workspaceId: string) => Promise<void>;
  disconnectJira: (workspaceId: string) => Promise<void>;
  updateConfig: (workspaceId: string, provider: string, config: any) => Promise<void>;
}

export const useIntegrationStore = create<IntegrationStore>((set) => ({
  integrations: MOCK_INTEGRATIONS,
  isLoading: false,

  fetchIntegrations: async (workspaceId) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  },

  connectJira: async (workspaceId) => {
    set(state => {
      const exists = state.integrations.find(i => i.provider === 'jira');
      if (exists) {
        return { integrations: state.integrations.map(i => i.provider === 'jira' ? { ...i, status: 'connected' } : i) };
      }
      return { integrations: [...state.integrations, { id: 'int-new', workspace_id: workspaceId, provider: 'jira', status: 'connected', config: {}, updated_at: new Date().toISOString() }] };
    });
  },

  disconnectJira: async (workspaceId) => {
    set(state => ({ integrations: state.integrations.filter(i => i.provider !== 'jira') }));
  },

  updateConfig: async (workspaceId, provider, config) => {
    set(state => ({
      integrations: state.integrations.map(i => i.provider === provider ? { ...i, config, updated_at: new Date().toISOString() } : i)
    }));
  }
}));
