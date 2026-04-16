import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { ToastProvider } from '../contexts/ToastContext';
import { Signup } from '../pages/Signup';
import { Pricing } from '../pages/Pricing';
import { SignalDetail } from '../pages/app/SignalDetail';
import { AppLayout } from '../layouts/AppLayout';
import React from 'react';

// Wrapper to provide necessary contexts
const TestWrapper = ({ children, initialRoute = '/' }: { children: React.ReactNode, initialRoute?: string }) => {
  return (
    <ToastProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            {children}
          </MemoryRouter>
        </WorkspaceProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

describe('Expanded Integration Tests', () => {
  it('1. /signup renders demo state and form correctly', async () => {
    render(
      <TestWrapper initialRoute="/signup?demo=true">
        <Routes><Route path="/signup" element={<Signup />} /></Routes>
      </TestWrapper>
    );
    
    // Check for demo banner
    expect(await screen.findByText(/Welcome to your interactive demo!/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();
  });

  it('2. /pricing renders exact tiers without annual toggle', async () => {
    render(
      <TestWrapper initialRoute="/pricing">
        <Routes><Route path="/pricing" element={<Pricing />} /></Routes>
      </TestWrapper>
    );
    
    expect(await screen.findByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$29')).toBeInTheDocument();
    expect(screen.getByText('$79')).toBeInTheDocument();
    // Ensure no annual toggle exists
    expect(screen.queryByText(/Billed Annually/i)).not.toBeInTheDocument();
  });

  it('3. /app/signals/:id fetches and renders valid signal data', async () => {
    render(
      <TestWrapper initialRoute="/app/signals/sig-1">
        <Routes><Route path="/app/signals/:id" element={<SignalDetail />} /></Routes>
      </TestWrapper>
    );
    
    // Wait for the simulated 500ms fetch to complete
    expect(await screen.findByText(/We cannot renew our contract next quarter/i, undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByText(/CloudScale Inc/i)).toBeInTheDocument();
  });

  it('4. /app/signals/:id gracefully handles invalid ID', async () => {
    render(
      <TestWrapper initialRoute="/app/signals/invalid-id">
        <Routes><Route path="/app/signals/:id" element={<SignalDetail />} /></Routes>
      </TestWrapper>
    );
    
    // Wait for the simulated fetch to complete and return null
    expect(await screen.findByText(/Signal does not exist or you don't have access/i, undefined, { timeout: 1500 })).toBeInTheDocument();
  });

  it('5. Global CSV Upload Modal mounts and unmounts via events', async () => {
    render(
      <TestWrapper initialRoute="/app">
        <Routes><Route path="/app" element={<AppLayout title="Test"><div/></AppLayout>} /></Routes>
      </TestWrapper>
    );
    
    // Modal should be hidden initially
    expect(screen.queryByText(/Import Data/i)).not.toBeInTheDocument();
    
    // Dispatch event to open
    window.dispatchEvent(new CustomEvent('open-upload-modal'));
    
    // Modal should now be visible
    expect(await screen.findByText(/Import Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Select CSV File/i)).toBeInTheDocument();
    
    // Dispatch event to close
    window.dispatchEvent(new CustomEvent('close-modals'));
    
    await waitFor(() => {
      expect(screen.queryByText(/Import Data/i)).not.toBeInTheDocument();
    });
  });
});
