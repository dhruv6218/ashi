/*
# Revoke CREATE privilege on public schema from PUBLIC

## Query Description: 
This operation removes the default PostgreSQL behavior that allows any user to create new objects (tables, functions, etc.) in the public schema. This secures extensions installed in the public schema and prevents unauthorized DDL operations from untrusted roles.

## Metadata:
- Schema-Category: Safe
- Impact-Level: Low
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Schema: public

## Security Implications:
- RLS Status: N/A
- Policy Changes: N/A
- Auth Requirements: N/A

## Performance Impact:
- Indexes: N/A
- Triggers: N/A
- Estimated Impact: None
*/

-- Revoke CREATE privilege on the public schema from the PUBLIC role
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
