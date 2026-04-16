/*
# Add RLS Policy for rate_limits table

## Query Description:
This migration addresses a security advisory by adding a read-only RLS policy to the `rate_limits` table. It allows authenticated users to view rate limit data for their own workspaces, ensuring the table is not completely locked out while maintaining strict security.

## Metadata:
- Schema-Category: Safe
- Impact-Level: Low
- Requires-Backup: false
- Reversible: true

## Structure Details:
- rate_limits (policies added)

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes (Added SELECT policy)
- Auth Requirements: Authenticated users only
*/

-- Allow workspace members to view rate limits for their workspaces
CREATE POLICY "Workspace members can view rate limits"
  ON rate_limits
  FOR SELECT
  TO authenticated
  USING (is_workspace_member(workspace_id));
