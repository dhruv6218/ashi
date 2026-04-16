import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import { ToastProvider } from '../contexts/ToastContext';

// Import Pages
import { Home } from '../pages/Home';
import { Pricing } from '../pages/Pricing';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/app/Dashboard';
import { SignalExplorer } from '../pages/app/SignalExplorer';
import { OpportunitiesList } from '../pages/app/OpportunitiesList';
import { Settings } from '../pages/app/Settings';
import { ReviewsDue } from '../pages/app/ReviewsDue';

const renderWithProviders = (ui: React.ReactElement, route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>
          <WorkspaceProvider>
            {ui}
          </WorkspaceProvider>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('ASTRIX Core User Flows & Smoke Tests', () => {
  
  test('1. Public Routes render without crashing', () => {
    const { unmount: unmountHome } = renderWithProviders(<Home />, '/');
    expect(screen.getByText(/Stop/i)).toBeInTheDocument();
    unmountHome();

    const { unmount: unmountPricing } = renderWithProviders(<Pricing />, '/pricing');
    expect(screen.getByText(/Simple pricing/i)).toBeInTheDocument();
    unmountPricing();

    const { unmount: unmountLogin } = renderWithProviders(<Login />, '/login');
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    unmountLogin();

    const { unmount: unmountSignup } = renderWithProviders(<Signup />, '/signup');
    expect(screen.getByText(/Start building smarter/i)).toBeInTheDocument();
    unmountSignup();
  });

  test('2. App Dashboard loads and sidebar is visible', async () => {
    renderWithProviders(<Dashboard />, '/app');
    
    // Wait for mock data to load
    await waitFor(() => {
      expect(screen.getByText(/Your workspace overview/i)).toBeInTheDocument();
      expect(screen.getByText(/Top Opportunities/i)).toBeInTheDocument();
    });
  });

  test('3. Signals list renders populated state', async () => {
    renderWithProviders(<SignalExplorer />, '/app/signals');
    
    await waitFor(() => {
      expect(screen.getByText(/total signals ingested/i)).toBeInTheDocument();
      // Check if table headers exist
      expect(screen.getByText(/Preview Text/i)).toBeInTheDocument();
    });
  });

  test('4. Opportunities compare mode toggle works', async () => {
    renderWithProviders(<OpportunitiesList />, '/app/opportunities');
    
    await waitFor(() => {
      expect(screen.getByText(/Compare Mode/i)).toBeInTheDocument();
    });

    const compareBtn = screen.getByText(/Compare Mode/i);
    fireEvent.click(compareBtn);

    // After clicking, the button should change to "Cancel" and "Compare Selected"
    await waitFor(() => {
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
      expect(screen.getByText(/Compare Selected/i)).toBeInTheDocument();
    });
  });

  test('5. Settings tabs switch correctly', async () => {
    renderWithProviders(<Settings />, '/app/settings');
    
    await waitFor(() => {
      expect(screen.getByText(/Workspace Details/i)).toBeInTheDocument();
    });

    // Click Team Members tab
    const teamTab = screen.getByText(/Team Members/i);
    fireEvent.click(teamTab);

    await waitFor(() => {
      expect(screen.getByText(/Active Members/i)).toBeInTheDocument();
    });
    
    // Click Billing tab
    const billingTab = screen.getByText(/Billing/i);
    fireEvent.click(billingTab);

    await waitFor(() => {
      expect(screen.getByText(/Current Plan/i)).toBeInTheDocument();
    });
  });

  test('6. Reviews Due page renders without crashing', async () => {
    renderWithProviders(<ReviewsDue />, '/app/reviews-due');
    
    await waitFor(() => {
      expect(screen.getByText(/Accountability Checkpoints/i)).toBeInTheDocument();
    });
  });
});
