/*
# Implement Semantic RAG Matching Functions

## Query Description: 
This migration adds the necessary vector similarity search functions for the "Ask AI" feature. It also adds an embedding column to the decisions table to allow searching past decisions. All functions are secured with explicit search paths and workspace membership checks.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Adds `embedding` column to `public.decisions`
- Creates `match_signals` function
- Creates `match_problems` function
- Creates `match_decisions` function

## Security Implications:
- RLS Status: Enforced via explicit `is_workspace_member` checks inside SECURITY DEFINER functions.
- Policy Changes: None
- Auth Requirements: Requires valid authenticated user session.
- Search Path: Explicitly set to `public` to resolve security advisories.
*/

-- 1. Ensure decisions table can store embeddings
ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 2. Create matching function for Signals
CREATE OR REPLACE FUNCTION match_signals(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_workspace_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  source_type text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Explicit authorization check
  IF NOT is_workspace_member(p_workspace_id) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this workspace';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.raw_text as content,
    s.source_type,
    1 - (s.embedding <=> query_embedding) AS similarity
  FROM signals s
  WHERE s.workspace_id = p_workspace_id
    AND s.embedding IS NOT NULL
    AND 1 - (s.embedding <=> query_embedding) > match_threshold
  ORDER BY s.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 3. Create matching function for Problems
CREATE OR REPLACE FUNCTION match_problems(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_workspace_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Explicit authorization check
  IF NOT is_workspace_member(p_workspace_id) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this workspace';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM problems p
  WHERE p.workspace_id = p_workspace_id
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Create matching function for Decisions
CREATE OR REPLACE FUNCTION match_decisions(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_workspace_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  action text,
  rationale text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Explicit authorization check
  IF NOT is_workspace_member(p_workspace_id) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this workspace';
  END IF;

  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.action,
    d.rationale,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM decisions d
  WHERE d.workspace_id = p_workspace_id
    AND d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Create HNSW indexes for performance (optional but recommended for scale)
-- Note: We use vector_cosine_ops for cosine similarity (<=>)
CREATE INDEX IF NOT EXISTS signals_embedding_idx ON public.signals USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS problems_embedding_idx ON public.problems USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS decisions_embedding_idx ON public.decisions USING hnsw (embedding vector_cosine_ops);
