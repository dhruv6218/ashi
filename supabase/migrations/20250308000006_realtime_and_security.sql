-- 1. FIX SECURITY ADVISORIES (Lock down search_path for all RPCs)
ALTER FUNCTION create_workspace(text, text) SET search_path = public;
ALTER FUNCTION get_user_workspace_ids() SET search_path = public;
ALTER FUNCTION is_workspace_member(uuid) SET search_path = public;
ALTER FUNCTION is_workspace_admin(uuid) SET search_path = public;
ALTER FUNCTION mock_ai_clustering(uuid) SET search_path = public;
ALTER FUNCTION compute_opportunity_scores(uuid) SET search_path = public;

-- 2. CREATE CHANGELOGS TABLE
CREATE TABLE IF NOT EXISTS changelogs (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    title text not null,
    description text not null,
    tag text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE changelogs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Workspace members can view changelogs" ON changelogs
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace admins can insert changelogs" ON changelogs
    FOR INSERT WITH CHECK (is_workspace_admin(workspace_id));

CREATE POLICY "Workspace admins can delete changelogs" ON changelogs
    FOR DELETE USING (is_workspace_admin(workspace_id));

-- 3. ENABLE SUPABASE REALTIME
-- This allows the frontend to listen for changes on these tables
ALTER PUBLICATION supabase_realtime ADD TABLE artifacts;
ALTER PUBLICATION supabase_realtime ADD TABLE problems;
ALTER PUBLICATION supabase_realtime ADD TABLE opportunities;
