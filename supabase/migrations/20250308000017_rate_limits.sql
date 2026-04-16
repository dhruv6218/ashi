-- Rate Limits Schema for AI and External API endpoints
-- Provides a simple sliding-window (minute level) implementation

CREATE TABLE IF NOT EXISTS public.rate_limits (
    workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
    endpoint text NOT NULL,
    window_start timestamp with time zone NOT NULL,
    request_count integer DEFAULT 1,
    PRIMARY KEY (workspace_id, endpoint, window_start)
);

-- Enable RLS (Internal use only)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Secure RPC to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_workspace_id uuid,
    p_endpoint text,
    p_limit integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_window_start timestamp with time zone;
    v_current_count integer;
BEGIN
    -- Calculate the start of the current minute
    v_window_start := date_trunc('minute', now());
    
    -- Cleanup old windows to prevent table bloat (keep last hour)
    DELETE FROM public.rate_limits 
    WHERE workspace_id = p_workspace_id 
      AND endpoint = p_endpoint 
      AND window_start < v_window_start - interval '1 hour';

    -- Upsert current window count
    INSERT INTO public.rate_limits (workspace_id, endpoint, window_start, request_count)
    VALUES (p_workspace_id, p_endpoint, v_window_start, 1)
    ON CONFLICT (workspace_id, endpoint, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1
    RETURNING request_count INTO v_current_count;

    -- Return false if limit exceeded
    IF v_current_count > p_limit THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;
