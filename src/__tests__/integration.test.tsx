import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { ToastProvider } from '../contexts/ToastContext';

// Import Pages
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/app/Dashboard';
import { SignalExplorer } from '../pages/app/SignalExplorer';
import { OpportunitiesList } from '../pages/app/OpportunitiesList';
import { Settings } from '../pages/app/Settings';
import { ReviewsDue } from '../pages/app/ReviewsDue';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    </AuthProvider>
  </ToastProvider>
);

describe('ASTRIX Runtime Integration Tests', () => {
  
  it('1. /login renders without crashing (No blank screen)', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AllProviders><Login /></AllProviders>
      </MemoryRouter>
    );
    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@company.com/i)).toBeInTheDocument();
  });

  it('2. /app loads and sidebar is visible', async () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <AllProviders><Dashboard /></AllProviders>
      </MemoryRouter>
    );
    // Wait for the 500ms Zustand mock data delay to resolve
    expect(await screen.findByText(/Your workspace overview/i, {}, { timeout: 2000 })).toBeInTheDocument();
    // Verify Sidebar items
    expect(screen.getByText('Signals')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
  });

  it('3. /app/signals list page renders populated state', async () => {
    render(
      <MemoryRouter initialEntries={['/app/signals']}>
        <AllProviders><SignalExplorer /></AllProviders>
      </MemoryRouter>
    );
    // Wait for data to load
    expect(await screen.findByText(/total signals ingested/i, {}, { timeout: 2000 })).toBeInTheDocument();
    // Verify table renders
    expect(screen.getByText(/Preview Text/i)).toBeInTheDocument();
  });

  it('4. Opportunities compare mode toggle works', async () => {
    render(
      <MemoryRouter initialEntries={['/app/opportunities']}>
        <AllProviders><OpportunitiesList /></AllProviders>
      </MemoryRouter>
    );
    
    // Wait for opportunities to load
    const compareBtn = await screen.findByText(/Compare Mode/i, {}, { timeout: 2000 });
    expect(compareBtn).toBeInTheDocument();

    // Click to enter compare mode
    await userEvent.click(compareBtn);
    
    // Verify UI changes to Compare Selected state
    expect(await screen.findByText(/Compare Selected/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  it('5. Settings tabs click and switch properly', async () => {
    render(
      <MemoryRouter initialEntries={['/app/settings']}>
        <AllProviders><Settings /></AllProviders>
      </MemoryRouter>
    );
    
    // Default tab is Workspace
    expect(await screen.findByText(/Workspace Details/i, {}, { timeout: 2000 })).toBeInTheDocument();
    
    // Switch to Billing
    const billingTab = screen.getByText('Billing');
    await userEvent.click(billingTab);
    
    // Verify Billing UI mounts
    expect(await screen.findByText(/Current Plan/i)).toBeInTheDocument();
  });

  it('6. Reviews Due page renders without crashing', async () => {
    render(
      <MemoryRouter initialEntries={['/app/reviews-due']}>
        <AllProviders><ReviewsDue /></AllProviders>
      </MemoryRouter>
    );
    
    expect(await screen.findByText(/Accountability Checkpoints/i, {}, { timeout: 2000 })).toBeInTheDocument();
  });
});
