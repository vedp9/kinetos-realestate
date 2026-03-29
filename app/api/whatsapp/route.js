import twilio from 'twilio'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(req) {
  try {
    const formData = await req.formData()
    const from = formData.get('From')       // client WhatsApp number
    const body = formData.get('Body')       // message they sent
    const to = formData.get('To')           // your Twilio WhatsApp number

    // client must message in format: "ravi: I want 2BHK in Kondapur"
    // OR we look up their number if they already messaged before

    let agentSlug = ''
    let clientMessage = body

    // check if message starts with agent slug like "ravi: ..."
    if (body.includes(':')) {
      const parts = body.split(':')
      agentSlug = parts[0].trim().toLowerCase()
      clientMessage = parts.slice(1).join(':').trim()
    }

    if (!agentSlug) {
      // ask them to specify agent
      await twilioClient.messages.create({
        from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
        to: from,
        body: `Hi! To find properties, message us like this:\n\n*agentname: your requirement*\n\nExample:\n_ravi: 2BHK in Kondapur under 50 lakhs_`
      })
      return new Response('OK', { status: 200 })
    }

    // get agent
    const { data: agent } = await supabase
      .from('agents')
      .select('id, name')
      .eq('slug', agentSlug)
      .single()

    if (!agent) {
      await twilioClient.messages.create({
        from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
        to: from,
        body: `Sorry, no agent found with username "${agentSlug}". Please check and try again.`
      })
      return new Response('OK', { status: 200 })
    }

    // get properties
    const { data: properties } = await supabase
      .from('properties')
      .select('title, area, bhk, price_lakhs, status, description')
      .eq('agent_id', agent.id)

    const propertyContext = properties?.map((p, i) =>
      `Property ${i + 1}: ${p.title} | ${p.bhk} BHK | ${p.area} | ₹${p.price_lakhs} Lakhs | ${p.status}`
    ).join('\n') || 'No properties listed yet'

    // ask Groq
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are a WhatsApp property assistant for ${agent.name}.
Find matching properties and reply in a friendly WhatsApp style.
Keep it concise. Use emojis naturally.
End with the portfolio link note.

PROPERTIES:
${propertyContext}`
        },
        {
          role: 'user',
          content: clientMessage
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content || 'Let me find properties for you!'

    const portfolioLink = `${process.env.NEXT_PUBLIC_APP_URL}/agent/${agentSlug}`
    const chatLink = `${process.env.NEXT_PUBLIC_APP_URL}/chat/${agentSlug}`

    await twilioClient.messages.create({
      from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
      to: from,
      body: `${reply}\n\n📋 Full listings: ${portfolioLink}\n🤖 Chat with AI: ${chatLink}`
    })

    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error('WhatsApp route error:', err)
    return new Response('OK', { status: 200 })
  }
}

export async function GET() {
  return new Response('✅ Kinetos WhatsApp Bot is live.', {
    headers: { 'Content-Type': 'text/plain' }
  })
}