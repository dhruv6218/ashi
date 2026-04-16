/*
# Core Foundation: Auth, Profiles, and Workspaces

## Query Description: 
This migration establishes the multi-tenant foundation for ASTRIX AI. It creates the profiles, workspaces, and workspace_members tables. It also sets up automated profile creation via triggers, atomic workspace creation via an RPC function, and strict Row Level Security (RLS) policies to ensure tenant isolation.

## Metadata:
- Schema-Category: Structural
- Impact-Level: High
- Requires-Backup: false
- Reversible: true

## Structure Details:
- public.profiles (linked to auth.users)
- public.workspaces
- public.workspace_members
- Helper functions for RLS and onboarding

## Security Implications:
- RLS Status: Enabled on all tables
- Policy Changes: Yes (New policies for tenant isolation)
- Auth Requirements: Requires authenticated users for all operations

## Performance Impact:
- Indexes: Added on foreign keys and lookup columns
- Triggers: Added for updated_at and auth.users sync
- Estimated Impact: Negligible (Foundation setup)
*/

-- ==============================================================================
-- 1. EXTENSIONS & GENERIC HELPERS
-- ==============================================================================

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generic function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WORKSPACES
CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WORKSPACE MEMBERS
CREATE TABLE public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workspace_id, user_id)
);

-- ==============================================================================
-- 3. INDEXES
-- ==============================================================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);

-- ==============================================================================
-- 4. TRIGGERS
-- ==============================================================================

-- Auto-update timestamps
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER set_workspaces_updated_at
    BEFORE UPDATE ON public.workspaces
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 5. RLS HELPER FUNCTIONS (SECURITY DEFINER)
-- ==============================================================================
-- These functions bypass RLS to prevent infinite recursion in policy definitions.

CREATE OR REPLACE FUNCTION public.get_user_workspace_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_id = p_workspace_id AND user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_id = p_workspace_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    );
$$;

-- ==============================================================================
-- 6. ONBOARDING RPC
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_workspace(
    p_name TEXT,
    p_timezone TEXT DEFAULT 'UTC'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workspace_id UUID;
    v_slug TEXT;
BEGIN
    -- Ensure user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Generate a simple slug (lowercase, alphanumeric, hyphens)
    v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);

    -- Insert Workspace
    INSERT INTO public.workspaces (name, slug, timezone, created_by)
    VALUES (p_name, v_slug, p_timezone, auth.uid())
    RETURNING id INTO v_workspace_id;

    -- Insert Owner Membership
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (v_workspace_id, auth.uid(), 'owner');

    RETURN v_workspace_id;
END;
$$;

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read and update their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Workspaces: Users can view workspaces they are members of
CREATE POLICY "Users can view their workspaces" 
    ON public.workspaces FOR SELECT 
    USING (id IN (SELECT public.get_user_workspace_ids()));

CREATE POLICY "Admins can update their workspaces" 
    ON public.workspaces FOR UPDATE 
    USING (public.is_workspace_admin(id));

-- Workspace Members: Users can view all members of workspaces they belong to
CREATE POLICY "Users can view members of their workspaces" 
    ON public.workspace_members FOR SELECT 
    USING (workspace_id IN (SELECT public.get_user_workspace_ids()));

CREATE POLICY "Admins can manage workspace members" 
    ON public.workspace_members FOR ALL 
    USING (public.is_workspace_admin(workspace_id));
