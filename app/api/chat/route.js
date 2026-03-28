import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  try {
    const { message, agentSlug } = await req.json()

    if (!message || !agentSlug) {
      return Response.json(
        { error: 'Message and agent slug required' },
        { status: 400 }
      )
    }

    // 1. get agent
    const { data: agent, error: agentErr } = await supabase
      .from('agents')
      .select('id, name')
      .eq('slug', agentSlug)
      .single()

    if (agentErr || !agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 })
    }

    // 2. get all properties for this agent
    const { data: properties } = await supabase
      .from('properties')
      .select('id, title, area, bhk, price_lakhs, status, description')
      .eq('agent_id', agent.id)

    if (!properties || properties.length === 0) {
      return Response.json({
        reply: `${agent.name} has not added any properties yet. Please check back soon!`
      })
    }

    // 3. build property context string
    const propertyContext = properties.map((p, i) =>
      `Property ${i + 1}: ${p.title} | ${p.bhk} BHK | ${p.area} | ₹${p.price_lakhs} Lakhs | ${p.status} | ${p.description || 'No description'}`
    ).join('\n')

    // 4. ask Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a helpful property assistant for ${agent.name}, a real estate agent.
You have access to their property listings below.
Answer client questions based ONLY on these listings.
Be friendly, helpful and concise.
Always mention price in Lakhs (₹).
If no property matches, say so politely and suggest the closest option.

PROPERTY LISTINGS:
${propertyContext}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content
      || 'Sorry, I could not process that. Please try again.'

    return Response.json({ reply, agentName: agent.name })

  } catch (err) {
    console.error('Chat API error:', err)
    return Response.json(
      { error: 'Something went wrong: ' + err.message },
      { status: 500 }
    )
  }
}