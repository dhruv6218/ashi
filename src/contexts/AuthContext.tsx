import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_USER } from '../lib/mockData';

interface AuthContextType {
  session: any;
  user: any;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, needsConfirmation: false }),
  signInWithGoogle: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mocked session
    const isLogged = localStorage.getItem('astrix_mock_logged_in');
    if (isLogged) {
      setUser(MOCK_USER);
      setSession({ access_token: 'mock_token' });
    }
    setIsLoading(false);
  }, []);

  const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 800));

  const signIn = async (email: string, password: string) => {
    await simulateDelay();
    setUser(MOCK_USER);
    setSession({ access_token: 'mock_token' });
    localStorage.setItem('astrix_mock_logged_in', 'true');
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    await simulateDelay();
    setUser({ ...MOCK_USER, email, user_metadata: { full_name: name } });
    setSession({ access_token: 'mock_token' });
    localStorage.setItem('astrix_mock_logged_in', 'true');
    return { error: null, needsConfirmation: false };
  };

  const signInWithGoogle = async () => {
    await simulateDelay();
    setUser(MOCK_USER);
    setSession({ access_token: 'mock_token' });
    localStorage.setItem('astrix_mock_logged_in', 'true');
  };

  const signOut = async () => {
    await simulateDelay();
    setUser(null);
    setSession(null);
    localStorage.removeItem('astrix_mock_logged_in');
    localStorage.removeItem('astrix_workspace_id');
  };

  const resetPassword = async (email: string) => {
    await simulateDelay();
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    await simulateDelay();
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut, signIn, signUp, signInWithGoogle, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
