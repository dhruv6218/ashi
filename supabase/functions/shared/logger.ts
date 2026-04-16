/**
 * Structured Logging Helper for Edge Functions
 * Formats logs as JSON for easy ingestion by tools like SigNoz, Datadog, etc.
 */

interface LogParams {
  endpoint: string;
  workspace_id?: string;
  user_id?: string;
  operation: string;
  message?: string;
  [key: string]: any;
}

interface ErrorLogParams extends LogParams {
  error_code?: string;
  error_message: string;
}

export function logInfo(params: LogParams) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    ...params
  }));
}

export function logError(params: ErrorLogParams) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    ...params
  }));
}
