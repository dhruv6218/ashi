/*
# Dodo Payments Billing Schema Update

## Query Description:
Adds provider-specific columns to `workspace_subscriptions` to support Dodo Payments integration. Safely adds columns without dropping existing data.

## Metadata:
- Schema-Category: Structural
- Impact-Level: Low
- Requires-Backup: false
- Reversible: true
*/

ALTER TABLE public.workspace_subscriptions
ADD COLUMN IF NOT EXISTS dodo_customer_id text,
ADD COLUMN IF NOT EXISTS dodo_subscription_id text,
ADD COLUMN IF NOT EXISTS billing_status text DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_workspace_subs_dodo_sub_id ON public.workspace_subscriptions(dodo_subscription_id);
