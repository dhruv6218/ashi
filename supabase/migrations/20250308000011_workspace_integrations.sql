-- Migration: Workspace Integrations
-- Description: Adds a table to store integration configurations (like Jira) per workspace.

CREATE TABLE IF NOT EXISTS workspace_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected',
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(workspace_id, provider)
);

-- Enable RLS
ALTER TABLE workspace_integrations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Workspace members can view integrations" ON workspace_integrations
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace admins can manage integrations" ON workspace_integrations
  FOR ALL USING (is_workspace_admin(workspace_id));

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at_workspace_integrations
  BEFORE UPDATE ON workspace_integrations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
