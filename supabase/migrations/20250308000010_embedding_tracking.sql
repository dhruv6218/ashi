-- Migration: Add embedding tracking fields for idempotency and loop prevention

-- Signals
ALTER TABLE public.signals 
ADD COLUMN IF NOT EXISTS embedding_source_hash text,
ADD COLUMN IF NOT EXISTS embedding_updated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS embedding_error text;

-- Problems
ALTER TABLE public.problems 
ADD COLUMN IF NOT EXISTS embedding_source_hash text,
ADD COLUMN IF NOT EXISTS embedding_updated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS embedding_error text;

-- Decisions
ALTER TABLE public.decisions 
ADD COLUMN IF NOT EXISTS embedding_source_hash text,
ADD COLUMN IF NOT EXISTS embedding_updated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS embedding_error text;
