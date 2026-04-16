/*
# Revoke CREATE privilege on public schema
Secures the public schema to mitigate risks associated with extensions installed in public.

## Query Description: 
This operation enhances database security by preventing unprivileged users (the PUBLIC role) from creating new objects (tables, functions, etc.) in the public schema. This directly addresses the "Extension in Public" security advisory without breaking existing extension functionality.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Schema: public
- Role: PUBLIC

## Security Implications:
- RLS Status: N/A
- Policy Changes: N/A
- Auth Requirements: N/A

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Zero performance impact. Purely an authorization change.
*/

-- Revoke the ability for any authenticated/anon user to create new tables/functions in the public schema
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
