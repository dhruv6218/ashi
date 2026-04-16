import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../shared/cors.ts'
import { generateText } from '../shared/ai/router.ts'
import { logInfo, logError } from '../shared/logger.ts'
import { initSentry, captureBackendError } from '../shared/sentry.ts'

initSentry();

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const endpoint = 'ai-generate-artifact';
  let workspace_id = 'unknown';
  let user_id = 'unknown';

  try {
    const body = await req.json()
    workspace_id = body.workspace_id;
    const { decision_id, type } = body;
    
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

    // Rate Limit Check (10 requests per minute per workspace)
    const { data: isAllowed, error: rlError } = await supabaseAdmin.rpc('check_rate_limit', {
      p_workspace_id: workspace_id,
      p_endpoint: endpoint,
      p_limit: 10
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

    logInfo({ endpoint, workspace_id, user_id, operation: 'request_received', message: `Generating artifact type: ${type}` });

    const { data: sub } = await supabaseAdmin
      .from('workspace_subscriptions')
      .select('plan_type')
      .eq('workspace_id', workspace_id)
      .single();
    
    const planType = sub?.plan_type || 'free';

    const { data: hasQuota, error: quotaError } = await supabaseClient.rpc('consume_ai_quota', { 
      p_workspace_id: workspace_id, p_feature_type: 'artifact'
    })

    if (quotaError || !hasQuota) {
      const premiumMessage = planType === 'free' 
        ? "You’ve reached the AI capacity included in the free plan. Upgrade for higher limits and deeper AI analysis."
        : "You’ve reached your plan’s AI capacity for this billing period. Please contact support to increase your limits.";

      return new Response(
        JSON.stringify({ error: { code: 'QUOTA_EXCEEDED', message: premiumMessage } }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: decision, error: decError } = await supabaseClient
      .from('decisions')
      .select('*, problems(title, description)')
      .eq('id', decision_id)
      .eq('workspace_id', workspace_id)
      .single()

    if (decError || !decision) throw new Error('Decision not found or unauthorized')

    const systemPrompt = `You are an expert Product Manager. Generate a professional ${type === 'prd' ? 'Product Requirements Document (PRD)' : 'Decision Memo'} in Markdown format. Format the output cleanly with standard markdown headings. Do not include any JSON wrapping, just raw markdown.`;
    
    const prompt = `Context:\nProblem: ${decision.problems?.title}\nProblem Description: ${decision.problems?.description}\nDecision Action: ${decision.action}\nPM Rationale: ${decision.rationale}`;

    const startTime = Date.now()
    
    const aiRes = await generateText(prompt, systemPrompt, { planType, taskType: 'artifact' });
    const markdown = aiRes.text;

    const { data: artifact, error: artError } = await supabaseClient.from('artifacts').insert({
      workspace_id, decision_id, title: `Generated ${type === 'prd' ? 'PRD' : 'Memo'}`, type, content: markdown, author_id: user.id
    }).select().single()

    if (artError) throw artError;

    await supabaseAdmin.from('api_usage_logs').insert({
      workspace_id, user_id: user.id, function_name: 'ai-generate-artifact',
      status: 'success', duration_ms: Date.now() - startTime, tokens_used: aiRes.tokensUsed,
      error_message: `Provider: ${aiRes.provider} | Model: ${aiRes.model}`
    })

    logInfo({ endpoint, workspace_id, user_id, operation: 'success', duration_ms: Date.now() - startTime, provider: aiRes.provider });

    return new Response(JSON.stringify({ success: true, artifact }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    captureBackendError(error, { endpoint, workspace_id, user_id });
    logError({ endpoint, workspace_id, user_id, operation: 'failure', error_message: error.message });
    return new Response(JSON.stringify({ error: { message: error.message } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
