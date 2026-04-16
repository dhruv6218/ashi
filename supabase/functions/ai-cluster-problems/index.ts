import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../shared/cors.ts'
import { generateText } from '../shared/ai/router.ts'
import { logInfo, logError } from '../shared/logger.ts'
import { initSentry, captureBackendError } from '../shared/sentry.ts'

initSentry();

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const endpoint = 'ai-cluster-problems';
  let workspace_id = 'unknown';
  let user_id = 'unknown';

  try {
    const body = await req.json()
    workspace_id = body.workspace_id;
    if (!workspace_id) throw new Error('workspace_id is required')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    user_id = user.id;

    // Rate Limit Check (5 requests per minute per workspace)
    const { data: isAllowed, error: rlError } = await supabaseAdmin.rpc('check_rate_limit', {
      p_workspace_id: workspace_id,
      p_endpoint: endpoint,
      p_limit: 5
    });

    if (rlError) {
      logError({ endpoint, workspace_id, user_id, operation: 'rate_limit_check', error_message: rlError.message });
    } else if (!isAllowed) {
      logInfo({ endpoint, workspace_id, user_id, operation: 'rate_limit_exceeded', message: "Rate limit hit" });
      return new Response(
        JSON.stringify({ error: { code: 'RATE_LIMITED', message: "You have hit the rate limit for this workspace. Try again in a minute." } }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    logInfo({ endpoint, workspace_id, user_id, operation: 'request_received', message: "Starting clustering" });

    // Fetch Plan Type
    const { data: sub } = await supabaseAdmin
      .from('workspace_subscriptions')
      .select('plan_type')
      .eq('workspace_id', workspace_id)
      .single();
    
    const planType = sub?.plan_type || 'free';

    const { data: hasQuota, error: quotaError } = await supabaseClient.rpc('consume_ai_quota', { 
      p_workspace_id: workspace_id, p_feature_type: 'clustering'
    })

    if (quotaError || !hasQuota) {
      await supabaseAdmin.from('audit_logs').insert({
        workspace_id, user_id: user.id, action_type: 'quota_rejected', 
        description: 'AI Clustering quota exceeded', source: 'edge_function'
      })
      
      const premiumMessage = planType === 'free' 
        ? "You’ve reached the AI capacity included in the free plan. Upgrade for higher limits and deeper AI analysis."
        : "You’ve reached your plan’s AI capacity for this billing period. Please contact support to increase your limits.";

      return new Response(
        JSON.stringify({ error: { code: 'QUOTA_EXCEEDED', message: premiumMessage } }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const startTime = Date.now()

    const { data: signals } = await supabaseClient
      .from('signals')
      .select('id, raw_text, source_type')
      .eq('workspace_id', workspace_id)
      .is('problem_id', null)
      .limit(50)

    if (!signals || signals.length === 0) {
      return new Response(JSON.stringify({ message: "No unclustered signals found" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const systemPrompt = `You are a PM AI. Group the user feedback signals into 1-3 core product problems. 
    Return ONLY a valid JSON array of objects with this exact structure:
    [{"title": "Short name", "description": "1 sentence summary", "severity": "High|Medium|Low", "product_area": "Area", "signal_ids": ["id1", "id2"]}]`;

    const prompt = `Signals: ${JSON.stringify(signals)}`;

    const aiRes = await generateText(prompt, systemPrompt, { planType, taskType: 'cluster' });
    
    let cleanJson = aiRes.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const clusters = JSON.parse(cleanJson).clusters || JSON.parse(cleanJson);

    for (const cluster of clusters) {
      if (!cluster.signal_ids || cluster.signal_ids.length === 0) continue;

      const { data: newProblem } = await supabaseAdmin.from('problems').insert({
        workspace_id, title: cluster.title, description: cluster.description, severity: cluster.severity, product_area: cluster.product_area, evidence_count: cluster.signal_ids.length
      }).select('id').single()

      if (newProblem) {
        await supabaseAdmin.from('signals').update({ problem_id: newProblem.id }).in('id', cluster.signal_ids).eq('workspace_id', workspace_id)
      }
    }

    await supabaseAdmin.from('api_usage_logs').insert({
      workspace_id, user_id: user.id, function_name: 'ai-cluster-problems',
      status: 'success', duration_ms: Date.now() - startTime, tokens_used: aiRes.tokensUsed,
      error_message: `Provider: ${aiRes.provider} | Model: ${aiRes.model}`
    })

    logInfo({ endpoint, workspace_id, user_id, operation: 'success', duration_ms: Date.now() - startTime, provider: aiRes.provider });

    return new Response(JSON.stringify({ success: true, clustered: signals.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    captureBackendError(error, { endpoint, workspace_id, user_id });
    logError({ endpoint, workspace_id, user_id, operation: 'failure', error_message: error.message });
    return new Response(JSON.stringify({ error: { message: error.message } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
