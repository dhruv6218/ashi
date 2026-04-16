import { create } from 'zustand';
import { MOCK_ARTIFACTS } from '../lib/mockData';

export interface Artifact {
  id: string;
  workspace_id: string;
  decision_id: string;
  title: string;
  type: string;
  content: string;
  author_id: string;
  external_url: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
  decisions?: { title: string };
  users?: { full_name: string };
}

interface ArtifactStore {
  artifacts: Artifact[];
  currentArtifact: Artifact | null;
  isLoading: boolean;
  error: string | null;
  fetchArtifacts: (workspaceId: string) => Promise<void>;
  fetchArtifactDetails: (id: string) => Promise<void>;
  createArtifact: (artifact: Partial<Artifact>) => Promise<Artifact | null>;
  updateArtifact: (id: string, updates: Partial<Artifact>) => Promise<void>;
  subscribeToArtifacts: (workspaceId: string) => () => void;
}

export const useArtifactStore = create<ArtifactStore>((set) => ({
  artifacts: MOCK_ARTIFACTS,
  currentArtifact: null,
  isLoading: false,
  error: null,

  fetchArtifacts: async (workspaceId) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set((state) => ({ isLoading: false }));
    }, 500);
  },

  fetchArtifactDetails: async (id) => {
    set({ isLoading: true, error: null });
    setTimeout(() => {
      set((state) => ({ 
        currentArtifact: state.artifacts.find(a => a.id === id) || null, 
        isLoading: false 
      }));
    }, 500);
  },

  createArtifact: async (artifact) => {
    const newArt = {
      ...artifact,
      id: `art-${Math.random()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: { full_name: 'Demo User' },
      decisions: { title: 'Generated Decision' }
    } as Artifact;
    
    set(state => ({ artifacts: [newArt, ...state.artifacts] }));
    return newArt;
  },

  updateArtifact: async (id, updates) => {
    set(state => ({
      artifacts: state.artifacts.map(a => a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a),
      currentArtifact: state.currentArtifact?.id === id ? { ...state.currentArtifact, ...updates, updated_at: new Date().toISOString() } : state.currentArtifact
    }));
  },

  subscribeToArtifacts: (workspaceId) => {
    return () => {};
  },
}));
