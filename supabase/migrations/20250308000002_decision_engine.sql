/*
  # Decision Engine & Artifacts Schema
  
  1. New Tables
    - `opportunities`: Scored and ranked problems.
    - `decisions`: The paper trail of actions taken on opportunities.
    - `artifacts`: Generated PRDs and Decision Memos.
    - `launches`: Post-launch tracking and outcome verdicts.
    
  2. Security
    - Enable RLS on all tables.
    - Add policies using the `is_workspace_member` helper function.
    - Ensure `ON DELETE CASCADE` for workspace isolation.
*/

-- 1. Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    problem_id uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    opportunity_score integer NOT NULL DEFAULT 0,
    demand_score integer NOT NULL DEFAULT 0,
    pain_score integer NOT NULL DEFAULT 0,
    arr_score integer NOT NULL DEFAULT 0,
    trend_score integer NOT NULL DEFAULT 0,
    recommended_action text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, problem_id)
);

-- 2. Decisions Table
CREATE TABLE IF NOT EXISTS decisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
    problem_id uuid REFERENCES problems(id) ON DELETE SET NULL,
    title text NOT NULL,
    action text NOT NULL,
    rationale text NOT NULL,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Artifacts Table
CREATE TABLE IF NOT EXISTS artifacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    decision_id uuid NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    title text NOT NULL,
    type text NOT NULL, -- e.g., 'prd', 'decision_memo'
    content text NOT NULL,
    author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    external_url text,
    external_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Launches Table
CREATE TABLE IF NOT EXISTS launches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    decision_id uuid NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    title text NOT NULL,
    action text NOT NULL,
    jira_url text,
    launched_at timestamptz NOT NULL,
    expected_outcome text,
    before_count integer,
    after_count integer,
    pm_verdict text,
    notes text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_workspace_id ON opportunities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_decisions_workspace_id ON decisions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_workspace_id ON artifacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_launches_workspace_id ON launches(workspace_id);

-- 6. Updated_at Triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON decisions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON artifacts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON launches FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 7. Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE launches ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (Inheriting workspace isolation)
-- Opportunities
CREATE POLICY "Workspace members can view opportunities" ON opportunities FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can insert opportunities" ON opportunities FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can update opportunities" ON opportunities FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can delete opportunities" ON opportunities FOR DELETE USING (is_workspace_member(workspace_id));

-- Decisions
CREATE POLICY "Workspace members can view decisions" ON decisions FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can insert decisions" ON decisions FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can update decisions" ON decisions FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can delete decisions" ON decisions FOR DELETE USING (is_workspace_member(workspace_id));

-- Artifacts
CREATE POLICY "Workspace members can view artifacts" ON artifacts FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can insert artifacts" ON artifacts FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can update artifacts" ON artifacts FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can delete artifacts" ON artifacts FOR DELETE USING (is_workspace_member(workspace_id));

-- Launches
CREATE POLICY "Workspace members can view launches" ON launches FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can insert launches" ON launches FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can update launches" ON launches FOR UPDATE USING (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can delete launches" ON launches FOR DELETE USING (is_workspace_member(workspace_id));
