-- Add a unique constraint to accounts to allow safe upserting during CSV ingestion
-- This prevents duplicate accounts from being created if a user uploads the same CSV twice
-- or if signals reference the same new account multiple times.
ALTER TABLE public.accounts 
ADD CONSTRAINT accounts_workspace_id_name_key UNIQUE (workspace_id, name);

-- Add an index to speed up account lookups by name during signal ingestion
CREATE INDEX IF NOT EXISTS idx_accounts_workspace_name ON public.accounts(workspace_id, name);
