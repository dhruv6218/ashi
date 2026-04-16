/*
# Create Workspace Invites

## Query Description: 
This operation creates the workspace_invites table and associated RPCs to enable team collaboration. It does not affect existing data.

## Metadata:
- Schema-Category: Structural
- Impact-Level: Low
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Creates table `public.workspace_invites`
- Adds RLS policies for admins
- Creates RPC `get_invite_details`
- Creates RPC `accept_workspace_invite`

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Authenticated users only for accept, admins for manage

## Performance Impact:
- Indexes: Implicit on PK and UNIQUE constraint
- Triggers: None
- Estimated Impact: Negligible
*/

CREATE TABLE IF NOT EXISTS public.workspace_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    UNIQUE(workspace_id, email)
);

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Workspace admins can manage invites"
    ON public.workspace_invites
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workspace_invites.workspace_id
            AND workspace_members.user_id = auth.uid()
            AND workspace_members.role = 'admin'
        )
    );

-- RPC: get_invite_details
CREATE OR REPLACE FUNCTION public.get_invite_details(p_token TEXT)
RETURNS TABLE (
    workspace_name TEXT,
    inviter_name TEXT,
    email TEXT,
    role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.name AS workspace_name,
        p.full_name AS inviter_name,
        wi.email,
        wi.role
    FROM public.workspace_invites wi
    JOIN public.workspaces w ON w.id = wi.workspace_id
    JOIN public.profiles p ON p.id = wi.invited_by
    WHERE wi.token = p_token AND wi.expires_at > NOW();
END;
$$;

-- RPC: accept_workspace_invite
CREATE OR REPLACE FUNCTION public.accept_workspace_invite(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite RECORD;
    v_user_email TEXT;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

    SELECT * INTO v_invite FROM public.workspace_invites 
    WHERE token = p_token AND expires_at > NOW();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    IF lower(v_invite.email) != lower(v_user_email) THEN
        RAISE EXCEPTION 'Invitation email does not match authenticated user';
    END IF;

    -- Insert member
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (v_invite.workspace_id, v_user_id, v_invite.role)
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role;

    -- Delete invite
    DELETE FROM public.workspace_invites WHERE id = v_invite.id;

    -- Log audit
    INSERT INTO public.audit_logs (workspace_id, user_id, action_type, description, source)
    VALUES (v_invite.workspace_id, v_user_id, 'member_joined', 'User joined via invitation', 'system');

    RETURN v_invite.workspace_id;
END;
$$;
