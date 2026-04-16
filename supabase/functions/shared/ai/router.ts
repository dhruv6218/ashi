// AI Provider Orchestration Layer
// Handles routing, fallbacks, and normalized responses based on plan type.

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GROK_API_KEY = Deno.env.get('GROK_API_KEY');
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  tokensUsed: number;
}

export interface RouterOptions {
  planType?: string;
  taskType?: 'cluster' | 'ask' | 'artifact';
}

// --- PROVIDER: GEMINI (DEFAULT / FREE) ---
async function callGemini(prompt: string, systemPrompt?: string): Promise<AIResponse> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const contents = [];
  if (systemPrompt) contents.push({ role: "user", parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] });
  contents.push({ role: "user", parts: [{ text: prompt }] });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API Error: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error("Invalid response format from Gemini");

  return {
    text,
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    tokensUsed: data.usageMetadata?.totalTokenCount || 0
  };
}

// --- PROVIDER: GROK (PAID ENHANCEMENT) ---
async function callGrok(prompt: string, systemPrompt?: string): Promise<AIResponse> {
  if (!GROK_API_KEY) throw new Error("GROK_API_KEY not configured");

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'grok-beta', // Or grok-2-latest depending on exact X.AI tier
      messages
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok API Error: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) throw new Error("Invalid response format from Grok");

  return {
    text,
    provider: 'grok',
    model: data.model || 'grok-beta',
    tokensUsed: data.usage?.total_tokens || 0
  };
}

// --- PROVIDER: OPENROUTER (OPTIONAL FALLBACK) ---
async function callOpenRouter(prompt: string, systemPrompt?: string): Promise<AIResponse> {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://astrixai.app',
      'X-Title': 'Astrix AI'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash:free', // Free tier fallback
      messages
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API Error: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) throw new Error("Invalid response format from OpenRouter");

  return {
    text,
    provider: 'openrouter',
    model: data.model || 'unknown-free-model',
    tokensUsed: data.usage?.total_tokens || 0
  };
}

// --- ROUTER EXPORTS ---

export async function generateText(prompt: string, systemPrompt?: string, options?: RouterOptions): Promise<AIResponse> {
  const isPaid = options?.planType && options.planType !== 'free';
  const isComplexTask = options?.taskType === 'ask' || options?.taskType === 'artifact';
  
  let lastError = null;

  // 1. PAID PLANS: Try Grok first for complex reasoning tasks
  if (isPaid && isComplexTask && GROK_API_KEY) {
    try {
      return await callGrok(prompt, systemPrompt);
    } catch (e: any) {
      console.warn(`[AI Router] Grok failed: ${e.message}. Falling back to Gemini.`);
      lastError = e;
    }
  }

  // 2. DEFAULT / FREE PLANS / FALLBACK: Try Gemini
  if (GEMINI_API_KEY) {
    try {
      return await callGemini(prompt, systemPrompt);
    } catch (e: any) {
      console.warn(`[AI Router] Gemini failed: ${e.message}.`);
      lastError = e;
    }
  }

  // 3. OPTIONAL FALLBACK: OpenRouter (Only if explicitly configured)
  if (OPENROUTER_API_KEY) {
    try {
      return await callOpenRouter(prompt, systemPrompt);
    } catch (e: any) {
      console.error(`[AI Router] OpenRouter fallback failed: ${e.message}`);
      lastError = e;
    }
  }

  // 4. GRACEFUL FAILURE
  throw new Error(`AI providers are currently unavailable. Please try again later. ${!GEMINI_API_KEY && !GROK_API_KEY ? '(No providers configured)' : ''}`);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // STRICT RULE: Embeddings MUST use Gemini. No Grok. No OpenRouter.
  if (!GEMINI_API_KEY) throw new Error("AI embeddings are currently unavailable (Missing Provider Configuration).");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text }] }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding Generation Error: Provider rate limit or outage.`);
  }

  const data = await res.json();
  const embedding = data.embedding?.values;

  if (!embedding) throw new Error("Invalid embedding response from provider.");

  return embedding;
}
