/*
# Move Extensions to Dedicated Schema
Moves extensions from the public schema to a dedicated extensions schema to resolve the "Extension in Public" security warning.

## Query Description:
This operation creates an `extensions` schema and relocates `uuid-ossp` and `vector` to it. It also updates the search path for Supabase roles so that functions relying on these extensions continue to work seamlessly.

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Medium"
- Requires-Backup: true
- Reversible: true

## Structure Details:
- Creates `extensions` schema
- Alters extension `uuid-ossp`
- Alters extension `vector`

## Security Implications:
- RLS Status: N/A
- Policy Changes: N/A
- Auth Requirements: Admin only

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: None
*/

-- Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move the extensions out of the public schema
ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- Update the search path for standard Supabase roles to ensure they can still find the extension functions
ALTER ROLE postgres SET search_path TO "$user", public, extensions;
ALTER ROLE anon SET search_path TO "$user", public, extensions;
ALTER ROLE authenticated SET search_path TO "$user", public, extensions;
ALTER ROLE service_role SET search_path TO "$user", public, extensions;
