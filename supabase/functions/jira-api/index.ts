import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../shared/cors.ts'
import { logInfo, logError } from '../shared/logger.ts'
import { initSentry, captureBackendError } from '../shared/sentry.ts'

initSentry();

const JIRA_BASE_URL = Deno.env.get('JIRA_BASE_URL');
const JIRA_EMAIL = Deno.env.get('JIRA_EMAIL');
const JIRA_API_TOKEN = Deno.env.get('JIRA_API_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const endpoint = 'jira-api';
  let workspace_id = 'unknown';
  let user_id = 'unknown';

  try {
    const body = await req.json()
    workspace_id = body.workspace_id;
    const { action, payload } = body;
    
    if (!workspace_id || !action) throw new Error('Missing required parameters')

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

    // Rate Limit Check (20 requests per minute per workspace)
    const { data: isAllowed, error: rlError } = await supabaseAdmin.rpc('check_rate_limit', {
      p_workspace_id: workspace_id,
      p_endpoint: endpoint,
      p_limit: 20
    });

    if (rlError) {
      logError({ endpoint, workspace_id, user_id, operation: 'rate_limit_check', error_message: rlError.message });
    } else if (!isAllowed) {
      logInfo({ endpoint, workspace_id, user_id, operation: 'rate_limit_exceeded', message: "Rate limit hit" });
      return new Response(
        JSON.stringify({ error: { code: 'RATE_LIMITED', message: "You have hit the rate limit for Jira API calls. Try again in a minute." } }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    logInfo({ endpoint, workspace_id, user_id, operation: 'request_received', message: `Executing Jira action: ${action}` });

    // 1. Verify Plan Access
    const { data: sub } = await supabaseAdmin
      .from('workspace_subscriptions')
      .select('plan_type')
      .eq('workspace_id', workspace_id)
      .single();
    
    if (!sub || sub.plan_type === 'free') {
      return new Response(
        JSON.stringify({ error: { message: 'Jira integration is only available on paid plans. Please upgrade your workspace.' } }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Verify Server Credentials
    if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
      throw new Error('Jira credentials are not configured on the server. Please contact support.')
    }

    const authHeader = `Basic ${btoa(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`)}`;
    const headers = {
      'Authorization': authHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    // 3. Route Actions
    if (action === 'test') {
      const res = await fetch(`${JIRA_BASE_URL}/rest/api/2/myself`, { headers })
      if (!res.ok) throw new Error('Failed to authenticate with Jira. Check server credentials.')
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'get_projects') {
      const res = await fetch(`${JIRA_BASE_URL}/rest/api/2/project`, { headers })
      if (!res.ok) throw new Error('Failed to fetch Jira projects.')
      const data = await res.json()
      return new Response(JSON.stringify({ projects: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'get_project_details') {
      if (!payload?.projectId) throw new Error('Project ID required')
      const res = await fetch(`${JIRA_BASE_URL}/rest/api/2/project/${payload.projectId}`, { headers })
      if (!res.ok) throw new Error('Failed to fetch project details.')
      const data = await res.json()
      return new Response(JSON.stringify({ project: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'create_issue') {
      if (!payload?.projectId || !payload?.issueTypeId || !payload?.summary) {
        throw new Error('Missing required issue fields')
      }

      const res = await fetch(`${JIRA_BASE_URL}/rest/api/2/issue`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fields: {
            project: { id: payload.projectId },
            summary: payload.summary,
            description: payload.description || '',
            issuetype: { id: payload.issueTypeId }
          }
        })
      })

      if (!res.ok) {
        const errData = await res.text()
        console.error("Jira Create Issue Error:", errData)
        throw new Error(`Jira API Error: Could not create issue. Verify project configurations.`)
      }

      const data = await res.json()
      
      await supabaseAdmin.from('audit_logs').insert({
        workspace_id, user_id: user.id, action_type: 'jira_issue_created',
        description: `Pushed issue ${data.key} to Jira.`, source: 'integration'
      })

      logInfo({ endpoint, workspace_id, user_id, operation: 'success', message: `Issue ${data.key} created` });

      return new Response(JSON.stringify({ 
        issue: data, 
        url: `${JIRA_BASE_URL}/browse/${data.key}` 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error('Invalid action specified')

  } catch (error: any) {
    captureBackendError(error, { endpoint, workspace_id, user_id });
    logError({ endpoint, workspace_id, user_id, operation: 'failure', error_message: error.message });
    return new Response(JSON.stringify({ error: { message: error.message } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
