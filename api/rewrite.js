export const config = { runtime: 'edge' }

const SYSTEM = `You are a professional workplace communication rewriter.

Given a raw, unpolished message, rewrite it to be clear, appropriate, and well-suited for the specified recipient(s), tone(s), and format.

Rules:
- Preserve the original intent completely
- Remove awkward phrasing and filler words
- Never sound robotic or over-corporate
- Adapt to format norms:
  - Messenger/Slack → short, conversational, no formal greeting/sign-off
  - Email → structured, with appropriate greeting and closing
  - Conversation → natural spoken language, as if saying it out loud
- Match the tone(s) requested
- If multiple recipients or tones are selected, find a sensible blend
- Output ONLY the rewritten message — no explanations, no labels, no preamble`

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { message, to, tone, format, extraInstruction } = body

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const toStr = to?.length ? to.join(', ') : 'general audience'
  const toneStr = tone?.length ? tone.join(', ') : 'professional'
  const formatStr = format?.length ? format[0] : 'Messenger'

  let userPrompt = `Recipient(s): ${toStr}
Tone(s): ${toneStr}
Format: ${formatStr}

Raw message:
${message}`

  if (extraInstruction) {
    userPrompt += `\n\n[Additional instruction: ${extraInstruction}]`
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      stream: true,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.json().catch(() => ({}))
    return new Response(
      JSON.stringify({ error: err?.error?.message || `Anthropic error ${anthropicRes.status}` }),
      { status: anthropicRes.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Stream the response straight through
  return new Response(anthropicRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
