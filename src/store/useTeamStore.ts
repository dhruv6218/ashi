import { create } from 'zustand';
import { MOCK_MEMBERS } from '../lib/mockData';

export interface TeamMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
  users?: { full_name: string; email?: string; avatar_url?: string };
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  token: string;
  created_at: string;
  expires_at: string;
}

interface TeamStore {
  members: TeamMember[];
  invites: WorkspaceInvite[];
  isLoading: boolean;
  fetchMembers: (workspaceId: string) => Promise<void>;
  fetchInvites: (workspaceId: string) => Promise<void>;
  inviteMember: (workspaceId: string, email: string, role: string) => Promise<WorkspaceInvite>;
  revokeInvite: (inviteId: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set) => ({
  members: MOCK_MEMBERS,
  invites: [],
  isLoading: false,

  fetchMembers: async (workspaceId) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ isLoading: false });
    }, 500);
  },

  fetchInvites: async (workspaceId) => {
    // Keep local state
  },

  inviteMember: async (workspaceId, email, role) => {
    const newInvite = {
      id: `inv-${Math.random()}`,
      workspace_id: workspaceId,
      email,
      role,
      token: `token-${Math.random()}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString()
    };
    set(state => ({ invites: [...state.invites, newInvite] }));
    return newInvite;
  },

  revokeInvite: async (inviteId) => {
    set(state => ({ invites: state.invites.filter(i => i.id !== inviteId) }));
  },

  removeMember: async (memberId) => {
    set(state => ({ members: state.members.filter(m => m.id !== memberId) }));
  }
}));
