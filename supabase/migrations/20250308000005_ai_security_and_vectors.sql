-- Enable pgvector for future semantic search
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Add embedding columns to core tables (1536 dimensions for OpenAI text-embedding-3-small)
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE public.artifacts ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create API Usage Logs table for observability and rate limiting
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    function_name text NOT NULL,
    status text NOT NULL,
    duration_ms integer,
    tokens_used integer,
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on logs
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view logs for their workspace
CREATE POLICY "Admins can view api logs" ON public.api_usage_logs
    FOR SELECT USING (is_workspace_admin(workspace_id));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_usage_workspace ON public.api_usage_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_signals_problem_id ON public.signals(problem_id);
