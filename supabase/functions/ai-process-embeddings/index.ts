import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { generateEmbedding } from '../shared/ai/router.ts'

// Helper to generate SHA-256 hash for idempotency
async function generateHash(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // 1. Security: Verify Webhook Secret
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
  const authHeader = req.headers.get('webhook-secret');
  
  if (webhookSecret && authHeader !== webhookSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '', 
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const payload = await req.json();
    const { type, table, record } = payload;

    // Only process INSERT and UPDATE
    if (type !== 'INSERT' && type !== 'UPDATE') {
      return new Response('Ignored event type', { status: 200 });
    }

    if (!record || !record.id) {
      throw new Error('Invalid record payload');
    }

    // 2. Text Assembly Rules
    let sourceText = '';
    if (table === 'signals') {
      sourceText = record.raw_text || '';
    } else if (table === 'problems') {
      sourceText = `${record.title || ''}\n${record.description || ''}`.trim();
    } else if (table === 'decisions') {
      sourceText = `${record.title || ''}\nAction: ${record.action || ''}\nRationale: ${record.rationale || ''}`.trim();
    } else {
      return new Response('Ignored table', { status: 200 });
    }

    if (!sourceText) {
      return new Response('No text to embed', { status: 200 });
    }

    // 3. Idempotency & Loop Prevention Check
    const newHash = await generateHash(sourceText);
    if (record.embedding_source_hash === newHash) {
      // The text hasn't changed, or this webhook was triggered by our own update below.
      // Exit immediately to prevent infinite loops.
      return new Response('Text unchanged, skipping embedding', { status: 200 });
    }

    // 4. Generate Embedding (Strictly Gemini)
    const embedding = await generateEmbedding(sourceText);

    // 5. Update Record safely
    const { error: updateError } = await supabaseAdmin
      .from(table)
      .update({
        embedding: embedding,
        embedding_source_hash: newHash,
        embedding_updated_at: new Date().toISOString(),
        embedding_error: null // Clear any previous errors
      })
      .eq('id', record.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, id: record.id }), { status: 200 });

  } catch (error: any) {
    console.error('Embedding Pipeline Error:', error);
    
    // 6. Safe Failure Handling
    // If we have the table and record ID, attempt to log the error to the row without wiping the old embedding
    try {
      const payload = await req.clone().json().catch(() => null);
      if (payload?.table && payload?.record?.id) {
        await supabaseAdmin
          .from(payload.table)
          .update({
            embedding_error: error.message,
            embedding_updated_at: new Date().toISOString()
          })
          .eq('id', payload.record.id);
      }
    } catch (fallbackError) {
      console.error('Failed to log error to row:', fallbackError);
    }

    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})
