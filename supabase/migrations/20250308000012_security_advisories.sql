/*
# Address Security Advisories

## Query Description: 
This migration hardens the database against search path hijacking by explicitly setting the `search_path` to `public` for all custom functions and triggers. It also revokes the `CREATE` privilege on the `public` schema from the `PUBLIC` role to secure extensions installed in the public schema.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Alters all custom functions to include `SET search_path = public`
- Revokes CREATE on schema public from PUBLIC

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: None
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible
*/

-- 1. Fix: Function Search Path Mutable
-- Set explicit search_path for all custom functions to prevent search path hijacking
ALTER FUNCTION public.create_workspace(text, text) SET search_path = public;
ALTER FUNCTION public.get_user_workspace_ids() SET search_path = public;
ALTER FUNCTION public.is_workspace_member(uuid) SET search_path = public;
ALTER FUNCTION public.is_workspace_admin(uuid) SET search_path = public;
ALTER FUNCTION public.mock_ai_clustering(uuid) SET search_path = public;
ALTER FUNCTION public.compute_opportunity_scores(uuid) SET search_path = public;
ALTER FUNCTION public.consume_ai_quota(uuid, text) SET search_path = public;
ALTER FUNCTION public.match_signals(vector, double precision, integer, uuid) SET search_path = public;
ALTER FUNCTION public.match_problems(vector, double precision, integer, uuid) SET search_path = public;
ALTER FUNCTION public.match_decisions(vector, double precision, integer, uuid) SET search_path = public;

-- Set explicit search_path for trigger functions
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_workspace_subscription() SET search_path = public;

-- 2. Fix: Extension in Public
-- Prevent untrusted users from creating objects in the public schema, 
-- securing the extensions (like pgvector) that reside there.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
