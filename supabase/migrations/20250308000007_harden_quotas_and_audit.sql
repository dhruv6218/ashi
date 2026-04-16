/*
# Harden Quota, Billing, and Audit Systems

## Query Description: 
This migration hardens the multi-tenant billing and quota infrastructure. It introduces granular AI limits, robust billing period rollovers, and a secure audit logging mechanism that prevents client spoofing. Existing workspaces are safely backfilled with default Free tier limits.

## Metadata:
- Schema-Category: Structural
- Impact-Level: High
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Creates/Updates `workspace_subscriptions` with granular limits (`ai_clustering_limit`, `ai_ask_limit`, etc.)
- Creates/Updates `audit_logs` with a `source` column for trusted logging.
- Replaces `consume_ai_quota` with a secure, race-condition-proof version.
- Adds idempotent triggers for workspace provisioning.

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (Restricts client inserts on audit_logs)
- Auth Requirements: Requires authenticated workspace members

## Performance Impact:
- Indexes: Added on `workspace_subscriptions.workspace_id`
- Triggers: Replaced `on_workspace_created_subscription`
- Estimated Impact: Minimal. `FOR UPDATE` lock during quota consumption is scoped to a single row and executes instantly.
*/

-- 1. Harden Workspace Subscriptions
CREATE TABLE IF NOT EXISTS public.workspace_subscriptions (
    workspace_id uuid PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    plan_type text NOT NULL DEFAULT 'free',
    billing_period_start timestamp with time zone NOT NULL DEFAULT now(),
    billing_period_end timestamp with time zone NOT NULL DEFAULT (now() + interval '1 month'),
    
    -- Legacy/Fallback limit
    ai_requests_limit integer NOT NULL DEFAULT 50,
    ai_requests_used integer NOT NULL DEFAULT 0,
    
    -- Granular Limits
    ai_clustering_limit integer NOT NULL DEFAULT 10,
    ai_clustering_used integer NOT NULL DEFAULT 0,
    ai_ask_limit integer NOT NULL DEFAULT 50,
    ai_ask_used integer NOT NULL DEFAULT 0,
    ai_artifact_limit integer NOT NULL DEFAULT 20,
    ai_artifact_used integer NOT NULL DEFAULT 0,
    
    total_tokens_used bigint NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Safely add columns if table already existed from a previous undocumented migration
DO $$ 
BEGIN
    ALTER TABLE public.workspace_subscriptions ADD COLUMN IF NOT EXISTS ai_clustering_limit integer NOT NULL DEFAULT 10;
    ALTER TABLE public.workspace_subscriptions ADD COLUMN IF NOT EXISTS ai_clustering_used integer NOT NULL DEFAULT 0;
    ALTER TABLE public.workspace_subscriptions ADD COLUMN IF NOT EXISTS ai_ask_limit integer NOT NULL DEFAULT 50;
    ALTER TABLE public.workspace_subscriptions ADD COLUMN IF NOT EXISTS ai_ask_used integer NOT NULL DEFAULT 0;
    ALTER TABLE public.workspace_subscriptions ADD COLUMN IF NOT EXISTS ai_artifact_limit integer NOT NULL DEFAULT 20;
    ALTER TABLE public.workspace_subscriptions ADD COLUMN IF NOT EXISTS ai_artifact_used integer NOT NULL DEFAULT 0;
    ALTER TABLE public.workspace_subscriptions ADD COLUMN IF NOT EXISTS total_tokens_used bigint NOT NULL DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE public.workspace_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view subscriptions" ON public.workspace_subscriptions;
CREATE POLICY "Workspace members can view subscriptions" 
    ON public.workspace_subscriptions FOR SELECT 
    USING (is_workspace_member(workspace_id));

-- Backfill existing workspaces idempotently
INSERT INTO public.workspace_subscriptions (workspace_id)
SELECT id FROM public.workspaces
ON CONFLICT (workspace_id) DO NOTHING;

-- 2. Idempotent Provisioning Trigger
CREATE OR REPLACE FUNCTION public.handle_new_workspace_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.workspace_subscriptions (workspace_id)
    VALUES (NEW.id)
    ON CONFLICT (workspace_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_workspace_created_subscription ON public.workspaces;
CREATE TRIGGER on_workspace_created_subscription
    AFTER INSERT ON public.workspaces
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_workspace_subscription();


-- 3. Harden Audit Logs (Untamperable Server-Side Logging)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    action_type text NOT NULL,
    description text NOT NULL,
    source text DEFAULT 'client' CHECK (source IN ('client', 'system', 'edge_function')),
    created_at timestamp with time zone DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS source text DEFAULT 'client' CHECK (source IN ('client', 'system', 'edge_function'));
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view audit logs" ON public.audit_logs;
CREATE POLICY "Workspace members can view audit logs" 
    ON public.audit_logs FOR SELECT 
    USING (is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Workspace members can insert client audit logs" ON public.audit_logs;
CREATE POLICY "Workspace members can insert client audit logs" 
    ON public.audit_logs FOR INSERT 
    WITH CHECK (is_workspace_member(workspace_id) AND source = 'client');
-- Note: Service Role (Edge Functions) bypasses RLS, allowing it to insert source='edge_function' securely.


-- 4. Secure Quota Consumption Logic
CREATE OR REPLACE FUNCTION public.consume_ai_quota(p_workspace_id uuid, p_feature_type text DEFAULT 'general')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_sub record;
    v_periods_passed integer;
BEGIN
    -- 1. Explicit Authorization Check (Prevents guessing workspace IDs)
    IF NOT public.is_workspace_member(p_workspace_id) THEN
        RAISE EXCEPTION 'Unauthorized: User is not a member of this workspace';
    END IF;

    -- 2. Lock the subscription row to prevent race conditions (Double-spending)
    SELECT * INTO v_sub
    FROM public.workspace_subscriptions
    WHERE workspace_id = p_workspace_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- 3. Robust Billing Period Reset
    -- Handles cases where a workspace is inactive for multiple months
    IF now() >= v_sub.billing_period_end THEN
        v_periods_passed := EXTRACT(MONTH FROM age(now(), v_sub.billing_period_end)) + 
                            (EXTRACT(YEAR FROM age(now(), v_sub.billing_period_end)) * 12) + 1;
        
        UPDATE public.workspace_subscriptions
        SET 
            ai_requests_used = 0,
            ai_clustering_used = 0,
            ai_ask_used = 0,
            ai_artifact_used = 0,
            billing_period_start = billing_period_end + (interval '1 month' * (v_periods_passed - 1)),
            billing_period_end = billing_period_end + (interval '1 month' * v_periods_passed),
            updated_at = now()
        WHERE workspace_id = p_workspace_id
        RETURNING * INTO v_sub;
    END IF;

    -- 4. Check and Consume Granular Quota
    IF p_feature_type = 'clustering' THEN
        IF v_sub.ai_clustering_used >= v_sub.ai_clustering_limit THEN RETURN false; END IF;
        UPDATE public.workspace_subscriptions SET ai_clustering_used = ai_clustering_used + 1 WHERE workspace_id = p_workspace_id;
    ELSIF p_feature_type = 'ask' THEN
        IF v_sub.ai_ask_used >= v_sub.ai_ask_limit THEN RETURN false; END IF;
        UPDATE public.workspace_subscriptions SET ai_ask_used = ai_ask_used + 1 WHERE workspace_id = p_workspace_id;
    ELSIF p_feature_type = 'artifact' THEN
        IF v_sub.ai_artifact_used >= v_sub.ai_artifact_limit THEN RETURN false; END IF;
        UPDATE public.workspace_subscriptions SET ai_artifact_used = ai_artifact_used + 1 WHERE workspace_id = p_workspace_id;
    ELSE
        -- Fallback
        IF v_sub.ai_requests_used >= v_sub.ai_requests_limit THEN RETURN false; END IF;
        UPDATE public.workspace_subscriptions SET ai_requests_used = ai_requests_used + 1 WHERE workspace_id = p_workspace_id;
    END IF;

    RETURN true;
END;
$$;
