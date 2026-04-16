import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Reverse mapping to identify plan from Dodo product_id
const PRODUCT_TO_PLAN: Record<string, { tier: string, interval: string }> = {
  'pdt_0NbFfMOQIsJF9X0LrtkH9': { tier: 'starter', interval: 'monthly' },
  'pdt_0NbC7p1x3vArb3CYIqAT6': { tier: 'starter', interval: 'annual' },
  'pdt_0NbC3RvgiyFoZ6wJ7LLqP': { tier: 'pro', interval: 'monthly' },
  'pdt_0NbC5NQsoxq2IeqmoeDmB': { tier: 'pro', interval: 'annual' },
  'pdt_0NcBuLfSXkF4hSJFs0AbV': { tier: 'enterprise', interval: 'monthly' },
  'pdt_0NbFhELrTC3P4kNf8On24': { tier: 'enterprise', interval: 'annual' },
};

serve(async (req) => {
  const signature = req.headers.get('webhook-signature')
  const bodyText = await req.text()
  
  // Note: Implement Dodo's specific signature verification here in production
  // const endpointSecret = Deno.env.get('DODO_WEBHOOK_SECRET')

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '', 
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const event = JSON.parse(bodyText);
    const data = event.data;

    // Extract core identifiers
    const workspaceId = data?.metadata?.workspace_id;
    if (!workspaceId) throw new Error('No workspace_id found in webhook metadata');

    const subscriptionId = data?.subscription_id || data?.id;
    const customerId = data?.customer_id;
    const productId = data?.product_id || (data?.items && data.items[0]?.product_id);

    // Determine the plan tier from the product ID, fallback to metadata
    const mappedPlan = productId ? PRODUCT_TO_PLAN[productId] : null;
    const tier = mappedPlan?.tier || data?.metadata?.tier || 'starter';

    // Event Groupings
    const activeEvents = [
      'payment.succeeded', 
      'subscription.active', 
      'subscription.updated', 
      'subscription.renewed', 
      'subscription.plan_changed'
    ];
    
    const inactiveEvents = [
      'payment.failed', 
      'subscription.cancelled', 
      'subscription.expired', 
      'subscription.on_hold'
    ];

    if (activeEvents.includes(event.type)) {
      // IDEMPOTENCY CHECK: Prevent duplicate processing if Dodo retries the webhook
      const { data: existingSub } = await supabaseAdmin
        .from('workspace_subscriptions')
        .select('dodo_subscription_id, billing_status')
        .eq('workspace_id', workspaceId)
        .single();

      if (event.type === 'subscription.active' && existingSub?.dodo_subscription_id === subscriptionId && existingSub?.billing_status === 'active') {
        console.log(`Webhook ignored: Subscription ${subscriptionId} is already active.`);
        return new Response(JSON.stringify({ received: true, message: 'Already processed' }), { status: 200 });
      }

      // Define quotas based on the purchased tier
      let clustering_limit = 10;
      let ask_limit = 50;
      let artifact_limit = 20;

      if (tier === 'starter') {
        clustering_limit = 100; ask_limit = 500; artifact_limit = 100;
      } else if (tier === 'pro') {
        clustering_limit = 500; ask_limit = 2000; artifact_limit = 500;
      } else if (tier === 'enterprise') {
        clustering_limit = 10000; ask_limit = 10000; artifact_limit = 10000;
      }

      await supabaseAdmin
        .from('workspace_subscriptions')
        .update({
          plan_type: tier,
          ai_clustering_limit: clustering_limit,
          ai_ask_limit: ask_limit,
          ai_artifact_limit: artifact_limit,
          dodo_customer_id: customerId,
          dodo_subscription_id: subscriptionId,
          billing_status: 'active',
          billing_period_start: new Date().toISOString(),
          // Approximate next billing date; Dodo handles exact renewals via subscription.renewed
          billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq('workspace_id', workspaceId)

      await supabaseAdmin.from('audit_logs').insert({
        workspace_id: workspaceId,
        user_id: '00000000-0000-0000-0000-000000000000',
        action_type: 'subscription_upgraded',
        description: `Workspace upgraded to ${tier.toUpperCase()} plan via Dodo Payments.`,
        source: 'system'
      })

    } else if (inactiveEvents.includes(event.type)) {
      // Downgrade to free tier limits
      await supabaseAdmin
        .from('workspace_subscriptions')
        .update({
          plan_type: 'free',
          ai_clustering_limit: 10,
          ai_ask_limit: 50,
          ai_artifact_limit: 20,
          billing_status: event.type === 'payment.failed' ? 'past_due' : 'cancelled'
        })
        .eq('workspace_id', workspaceId)

      await supabaseAdmin.from('audit_logs').insert({
        workspace_id: workspaceId,
        user_id: '00000000-0000-0000-0000-000000000000',
        action_type: 'subscription_downgraded',
        description: `Workspace downgraded to FREE plan due to billing event: ${event.type}.`,
        source: 'system'
      })
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
