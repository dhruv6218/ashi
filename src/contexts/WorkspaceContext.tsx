import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_WORKSPACE } from '../lib/mockData';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  logo_url: string | null;
}

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoadingWorkspace: boolean;
  setActiveWorkspace: (ws: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  activeWorkspace: null,
  workspaces: [],
  isLoadingWorkspace: true,
  setActiveWorkspace: () => {},
  refreshWorkspaces: async () => {},
});

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsLoadingWorkspace(false);
      return;
    }

    setIsLoadingWorkspace(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const fetchedWorkspaces = [MOCK_WORKSPACE];
    setWorkspaces(fetchedWorkspaces);
    setActiveWorkspace(fetchedWorkspaces[0]);
    localStorage.setItem('astrix_workspace_id', fetchedWorkspaces[0].id);

    setIsLoadingWorkspace(false);
  };

  const handleSetActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    localStorage.setItem('astrix_workspace_id', ws.id);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  return (
    <WorkspaceContext.Provider value={{
      activeWorkspace,
      workspaces,
      isLoadingWorkspace,
      setActiveWorkspace: handleSetActiveWorkspace,
      refreshWorkspaces: fetchWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
