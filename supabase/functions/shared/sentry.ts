import * as Sentry from "npm:@sentry/deno";

let initialized = false;

export function initSentry() {
  if (initialized) return;
  
  const dsn = Deno.env.get('SENTRY_DSN') || "https://5582383e64f071aaaebfb84b6eed112d@o4511218001248256.ingest.de.sentry.io/4511218010030160";
  
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    environment: Deno.env.get('ENVIRONMENT') || 'production',
  });
  
  initialized = true;
}

export function captureBackendError(error: any, context: { endpoint: string, workspace_id?: string, user_id?: string, operation?: string }) {
  if (!initialized) initSentry();
  
  Sentry.withScope((scope) => {
    if (context.workspace_id) scope.setTag("workspace_id", context.workspace_id);
    if (context.user_id) scope.setTag("user_id", context.user_id);
    if (context.endpoint) scope.setTag("endpoint", context.endpoint);
    if (context.operation) scope.setTag("operation", context.operation);
    
    Sentry.captureException(error);
  });
}
