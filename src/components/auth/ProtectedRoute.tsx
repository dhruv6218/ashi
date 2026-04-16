import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { workspaces, isLoadingWorkspace } = useWorkspace();
  const location = useLocation();

  if (authLoading || (user && isLoadingWorkspace)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Security Fix: Prevent users without a workspace from accessing the main app
  const isAppRoute = location.pathname.startsWith('/app');
  if (isAppRoute && workspaces.length === 0) {
    return <Navigate to="/onboarding/step-1" replace />;
  }

  // UX Fix: If user has a workspace and tries to access onboarding, send them to the app
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  if (isOnboardingRoute && workspaces.length > 0) {
     return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
