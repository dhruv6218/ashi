import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../shared/cors.ts'

const DODO_API_KEY = Deno.env.get('DODO_API_KEY') || '';
const DODO_API_URL = 'https://live.dodopayments.com/api/v1';

// Dodo Product IDs Mapping
const PRODUCT_IDS: Record<string, string> = {
  'starter_monthly': 'pdt_0NbFfMOQIsJF9X0LrtkH9',
  'starter_annual': 'pdt_0NbC7p1x3vArb3CYIqAT6',
  'pro_monthly': 'pdt_0NbC3RvgiyFoZ6wJ7LLqP',
  'pro_annual': 'pdt_0NbC5NQsoxq2IeqmoeDmB',
  'enterprise_monthly': 'pdt_0NcBuLfSXkF4hSJFs0AbV',
  'enterprise_annual': 'pdt_0NbFhELrTC3P4kNf8On24',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // GRACEFUL FAILURE: If Dodo is not configured, fail honestly without breaking the app
    if (!DODO_API_KEY) {
      return new Response(
        JSON.stringify({ error: { message: 'Billing is currently being configured for this environment. Please contact support to upgrade.' } }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { workspace_id, tier, is_annual, price } = await req.json()
    
    if (!workspace_id || !tier || price === undefined) {
      throw new Error('Missing required parameters')
    }

    // Resolve the exact Dodo Product ID
    const planKey = `${tier}_${is_annual ? 'annual' : 'monthly'}`;
    const productId = PRODUCT_IDS[planKey];

    if (!productId) {
      throw new Error(`Invalid plan selection: ${planKey}`);
    }

    // SECURITY: Verify user is authenticated and is a Workspace Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_workspace_admin', { 
      p_workspace_id: workspace_id 
    });

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: { message: 'Only workspace admins can modify billing.' } }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const origin = req.headers.get('origin') || 'https://astrixai.app'

    // Create Dodo Payments Checkout Session
    const res = await fetch(`${DODO_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        billing: {
          city: "", country: "", state: "", street: "", zip_code: ""
        },
        customer: {
          email: user.email, 
          name: user.user_metadata?.full_name || ""
        },
        product_cart: [
          {
            product_id: productId,
            quantity: 1
          }
        ],
        return_url: `${origin}/app/settings?checkout=success`,
        metadata: {
          workspace_id,
          tier,
          interval: is_annual ? 'annual' : 'monthly'
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Dodo API Error: ${errText}`);
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({ url: data.payment_link }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Dodo Checkout Error:', error)
    return new Response(
      JSON.stringify({ error: { message: error.message } }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
