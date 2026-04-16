import * as Sentry from "@sentry/react";
import posthog from 'posthog-js';

// Initialize Sentry for Error Tracking
Sentry.init({
  dsn: "https://5582383e64f071aaaebfb84b6eed112d@o4511218001248256.ingest.de.sentry.io/4511218010030160",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE || 'development',
});

// Initialize PostHog for Product Analytics
posthog.init('phc_zaS8gmhDXfSfnorbqaadhL8UfvN6LCnhSeUPuY2qyrwT', {
  api_host: 'https://app.posthog.com',
  autocapture: false, // We want explicit, high-signal events only
  capture_pageview: false, // Handled manually if needed, keeping it lean
});

export { posthog, Sentry };
