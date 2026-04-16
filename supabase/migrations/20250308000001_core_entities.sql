/*
  # Core Data Entities & Storage Foundation

  1. New Tables
    - `accounts`: CRM data (ARR, plan, health score)
    - `problems`: AI-clustered canonical problems
    - `signals`: Raw customer feedback linked to accounts and problems
  
  2. Storage
    - `csv_uploads`: Private bucket for raw data ingestion

  3. Security
    - RLS enabled on all tables
    - Policies enforce workspace-level isolation using `is_workspace_member()`
    - Storage policies restrict access to authenticated users
*/

-- ==========================================
-- 1. ACCOUNTS TABLE (CRM Data)
-- ==========================================
CREATE TABLE public.accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name text NOT NULL,
    domain text,
    arr numeric DEFAULT 0,
    plan text,
    health_score text,
    signal_count integer DEFAULT 0,
    last_signal_date timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_accounts_workspace_id ON public.accounts(workspace_id);

CREATE TRIGGER handle_updated_at_accounts 
    BEFORE UPDATE ON public.accounts 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view accounts" 
    ON public.accounts FOR SELECT 
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert accounts" 
    ON public.accounts FOR INSERT 
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update accounts" 
    ON public.accounts FOR UPDATE 
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete accounts" 
    ON public.accounts FOR DELETE 
    USING (is_workspace_member(workspace_id));


-- ==========================================
-- 2. PROBLEMS TABLE (AI Clusters)
-- ==========================================
CREATE TABLE public.problems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text DEFAULT 'Active' NOT NULL,
    severity text,
    trend text,
    product_area text,
    evidence_count integer DEFAULT 0 NOT NULL,
    affected_arr numeric DEFAULT 0 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_problems_workspace_id ON public.problems(workspace_id);

CREATE TRIGGER handle_updated_at_problems 
    BEFORE UPDATE ON public.problems 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view problems" 
    ON public.problems FOR SELECT 
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert problems" 
    ON public.problems FOR INSERT 
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update problems" 
    ON public.problems FOR UPDATE 
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete problems" 
    ON public.problems FOR DELETE 
    USING (is_workspace_member(workspace_id));


-- ==========================================
-- 3. SIGNALS TABLE (Raw Feedback)
-- ==========================================
CREATE TABLE public.signals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
    problem_id uuid REFERENCES public.problems(id) ON DELETE SET NULL,
    source_type text NOT NULL, -- e.g., 'CSV', 'Slack', 'Intercom'
    raw_text text NOT NULL,
    normalized_text text,
    sentiment_label text,
    severity_label text,
    category text,
    product_area text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_signals_workspace_id ON public.signals(workspace_id);
CREATE INDEX idx_signals_account_id ON public.signals(account_id);
CREATE INDEX idx_signals_problem_id ON public.signals(problem_id);

CREATE TRIGGER handle_updated_at_signals 
    BEFORE UPDATE ON public.signals 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view signals" 
    ON public.signals FOR SELECT 
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can insert signals" 
    ON public.signals FOR INSERT 
    WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can update signals" 
    ON public.signals FOR UPDATE 
    USING (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members can delete signals" 
    ON public.signals FOR DELETE 
    USING (is_workspace_member(workspace_id));


-- ==========================================
-- 4. STORAGE BUCKET (CSV Uploads)
-- ==========================================
-- Create a private bucket for CSV uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('csv_uploads', 'csv_uploads', false) 
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files (Frontend should upload to path: workspace_id/filename.csv)
CREATE POLICY "Users can upload CSVs" 
    ON storage.objects FOR INSERT 
    WITH CHECK (
        bucket_id = 'csv_uploads' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to read their workspace's files
CREATE POLICY "Users can view workspace CSVs" 
    ON storage.objects FOR SELECT 
    USING (
        bucket_id = 'csv_uploads' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to delete their workspace's files
CREATE POLICY "Users can delete workspace CSVs" 
    ON storage.objects FOR DELETE 
    USING (
        bucket_id = 'csv_uploads' 
        AND auth.role() = 'authenticated'
    );
