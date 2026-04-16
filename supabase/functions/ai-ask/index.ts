import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../shared/cors.ts'
import { generateText, generateEmbedding } from '../shared/ai/router.ts'
import { logInfo, logError } from '../shared/logger.ts'
import { initSentry, captureBackendError } from '../shared/sentry.ts'

initSentry();

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const endpoint = 'ai-ask';
  let workspace_id = 'unknown';
  let user_id = 'unknown';

  try {
    const body = await req.json()
    workspace_id = body.workspace_id;
    const query = body.query;
    
    if (!workspace_id || !query) {
      throw new Error('workspace_id and query are required')
    }

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

    // 1. Rate Limit Check (15 requests per minute per workspace)
    const { data: isAllowed, error: rlError } = await supabaseAdmin.rpc('check_rate_limit', {
      p_workspace_id: workspace_id,
      p_endpoint: endpoint,
      p_limit: 15
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

    logInfo({ endpoint, workspace_id, user_id, operation: 'request_received', message: "Processing Ask AI query" });

    // Fetch Plan Type for Routing & Messaging
    const { data: sub } = await supabaseAdmin
      .from('workspace_subscriptions')
      .select('plan_type')
      .eq('workspace_id', workspace_id)
      .single();
    
    const planType = sub?.plan_type || 'free';

    const { data: hasQuota, error: quotaError } = await supabaseClient.rpc('consume_ai_quota', { 
      p_workspace_id: workspace_id, p_feature_type: 'ask'
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

    const startTime = Date.now()

    // 1. GENERATE EMBEDDING VIA ROUTER
    const queryEmbedding = await generateEmbedding(query);

    // 2. RETRIEVE CONTEXT VIA SEMANTIC SEARCH
    const [signalsRes, problemsRes, decisionsRes] = await Promise.all([
      supabaseClient.rpc('match_signals', { query_embedding: queryEmbedding, match_threshold: 0.3, match_count: 15, p_workspace_id: workspace_id }),
      supabaseClient.rpc('match_problems', { query_embedding: queryEmbedding, match_threshold: 0.4, match_count: 5, p_workspace_id: workspace_id }),
      supabaseClient.rpc('match_decisions', { query_embedding: queryEmbedding, match_threshold: 0.4, match_count: 5, p_workspace_id: workspace_id })
    ])

    const totalSources = (signalsRes.data?.length || 0) + (problemsRes.data?.length || 0) + (decisionsRes.data?.length || 0)

    let contextText = ""
    if (totalSources === 0) {
      const { data: recentProblems } = await supabaseClient.from('problems').select('title, description, severity').eq('workspace_id', workspace_id).limit(5)
      contextText = `[No vector matches. Fallback data:] Recent Problems: ${JSON.stringify(recentProblems)}`
    } else {
      contextText = `
        Relevant Signals: ${JSON.stringify(signalsRes.data)}
        Relevant Problems: ${JSON.stringify(problemsRes.data)}
        Relevant Decisions: ${JSON.stringify(decisionsRes.data)}
      `
    }

    // 3. GENERATE ANSWER VIA ROUTER
    const systemPrompt = `You are an expert AI assistant for a Product Management workspace. Answer the user's question based ONLY on the provided context retrieved from their workspace database. Cite specific signals, problems, or decisions if applicable.`;
    const prompt = `Context:\n${contextText}\n\nUser Question: ${query}`;

    const aiRes = await generateText(prompt, systemPrompt, { planType, taskType: 'ask' });

    await supabaseAdmin.from('api_usage_logs').insert({
      workspace_id, user_id: user.id, function_name: 'ai-ask-rag',
      status: 'success', duration_ms: Date.now() - startTime, tokens_used: aiRes.tokensUsed,
      error_message: `Provider: ${aiRes.provider} | Model: ${aiRes.model}`
    })

    logInfo({ endpoint, workspace_id, user_id, operation: 'success', duration_ms: Date.now() - startTime, provider: aiRes.provider });

    return new Response(JSON.stringify({ 
      answer: aiRes.text, 
      sources: ['Semantic Vector Search'], 
      count: totalSources > 0 ? totalSources : 5 
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    captureBackendError(error, { endpoint, workspace_id, user_id });
    logError({ endpoint, workspace_id, user_id, operation: 'failure', error_message: error.message });
    return new Response(JSON.stringify({ error: { message: error.message } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
