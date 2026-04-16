import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { corsHeaders } from '../shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { workspace_id, tier, is_annual, price } = await req.json()
    
    if (!workspace_id || !tier || !price) {
      throw new Error('Missing required parameters')
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173'

    // Create a dynamic Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Astrix ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: `Astrix AI Decision Engine - ${is_annual ? 'Annual' : 'Monthly'} Subscription`,
            },
            unit_amount: price * 100, // Stripe expects amounts in cents
            recurring: {
              interval: is_annual ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/app/settings?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      client_reference_id: workspace_id,
      subscription_data: {
        metadata: {
          workspace_id,
          tier
        }
      },
      metadata: {
        workspace_id,
        tier
      }
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return new Response(
      JSON.stringify({ error: { message: error.message } }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
