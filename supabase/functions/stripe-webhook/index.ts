import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, endpointSecret!)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '', 
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const workspaceId = session.metadata?.workspace_id || session.client_reference_id
      const tier = session.metadata?.tier || 'starter'

      if (!workspaceId) throw new Error('No workspace_id found in session metadata')

      // Define quotas based on the purchased tier
      let clustering_limit = 10;
      let ask_limit = 50;
      let artifact_limit = 20;

      if (tier === 'starter') {
        clustering_limit = 100;
        ask_limit = 500;
        artifact_limit = 100;
      } else if (tier === 'pro') {
        clustering_limit = 500;
        ask_limit = 2000;
        artifact_limit = 500;
      } else if (tier === 'enterprise') {
        clustering_limit = 10000;
        ask_limit = 10000;
        artifact_limit = 10000;
      }

      // Update the workspace subscription
      const { error: updateError } = await supabaseAdmin
        .from('workspace_subscriptions')
        .update({
          plan_type: tier,
          ai_clustering_limit: clustering_limit,
          ai_ask_limit: ask_limit,
          ai_artifact_limit: artifact_limit,
          billing_period_start: new Date().toISOString(),
          // Approximate next billing date; Stripe handles exact renewals via invoice.payment_succeeded
          billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq('workspace_id', workspaceId)

      if (updateError) throw updateError

      // Log the upgrade securely
      await supabaseAdmin.from('audit_logs').insert({
        workspace_id: workspaceId,
        user_id: '00000000-0000-0000-0000-000000000000', // System UUID representation
        action_type: 'subscription_upgraded',
        description: `Workspace upgraded to ${tier.toUpperCase()} plan via Stripe.`,
        source: 'system'
      })
    }

    // Future: Handle 'invoice.payment_succeeded' to reset quotas monthly
    // Future: Handle 'customer.subscription.deleted' to downgrade to free

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
