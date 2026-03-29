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

// helper — send WhatsApp message and return empty TwiML
// empty TwiML = no "OK" showing up in WhatsApp
async function sendWhatsApp(to, body) {
  await twilioClient.messages.create({
    from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
    to: to,
    body: body,
  })
  // return empty TwiML — tells Twilio "got it, nothing to echo back"
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { headers: { 'Content-Type': 'text/xml' } }
  )
}

export async function POST(req) {
  try {
    const formData = await req.formData()
    const from = formData.get('From')   // client WhatsApp e.g. whatsapp:+919876543210
    const body = (formData.get('Body') || '').trim()

    if (!body) {
      return sendWhatsApp(from,
        `Hi! Send us your property requirement and we will find the best match for you.\n\nExample: _2BHK in Kondapur under 50 lakhs_`
      )
    }

    // ── check if message starts with a slug like "ravi: ..." ──
    // this is used when agent shares their direct WhatsApp link
    let agentSlug = ''
    let clientMessage = body

    if (body.includes(':')) {
      const firstColon = body.indexOf(':')
      const possibleSlug = body.substring(0, firstColon).trim().toLowerCase()

      // check if this is actually an agent slug (no spaces, short)
      if (possibleSlug.length < 30 && !possibleSlug.includes(' ')) {
        // verify it exists in DB
        const { data: checkAgent } = await supabase
          .from('agents')
          .select('slug')
          .eq('slug', possibleSlug)
          .single()

        if (checkAgent) {
          agentSlug = possibleSlug
          clientMessage = body.substring(firstColon + 1).trim()
        }
      }
    }

    // if no slug found — ask which agent they want
    if (!agentSlug) {
      return sendWhatsApp(from,
        `Hi! We could not find which agent you are looking for.\n\nPlease use the WhatsApp link shared by your agent directly — it will connect you automatically. 🏠`
      )
    }

    // get agent details
    const { data: agent } = await supabase
      .from('agents')
      .select('id, name')
      .eq('slug', agentSlug)
      .single()

    if (!agent) {
      return sendWhatsApp(from,
        `Sorry, no agent found. Please use the link shared by your agent directly.`
      )
    }

    // get agent properties
    const { data: properties } = await supabase
      .from('properties')
      .select('title, area, bhk, price_lakhs, status, description')
      .eq('agent_id', agent.id)

    if (!properties || properties.length === 0) {
      return sendWhatsApp(from,
        `${agent.name} has not added any properties yet. Please check back soon!`
      )
    }

    const propertyContext = properties.map((p, i) =>
      `Property ${i + 1}: ${p.title} | ${p.bhk} BHK | ${p.area} | ₹${p.price_lakhs} Lakhs | ${p.status} | ${p.description || ''}`
    ).join('\n')

    // ask Groq for matching properties
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a WhatsApp property assistant for ${agent.name}, a real estate agent.
A client has messaged asking about properties.
Find the best matches from the listings below and reply naturally.
Rules:
- Do NOT greet with "Hello" or mention the agent name at the start
- Get straight to the point — show matching properties
- Use simple WhatsApp style — short sentences, emojis are fine
- Mention max 3 properties
- Keep total reply under 200 words
- End with: "Reply with any questions and I will help further!"

PROPERTY LISTINGS:
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

    const aiReply = completion.choices[0]?.message?.content
      || 'Let me find the best properties for you!'

    const portfolioLink = `${process.env.NEXT_PUBLIC_APP_URL}/agent/${agentSlug}`
    const chatLink = `${process.env.NEXT_PUBLIC_APP_URL}/chat/${agentSlug}`

    return sendWhatsApp(from,
      `${aiReply}\n\n📋 See all listings: ${portfolioLink}\n🤖 Chat with AI: ${chatLink}`
    )

  } catch (err) {
    console.error('WhatsApp route error:', err)
    // even on error — return empty TwiML not "OK"
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }
}

export async function GET() {
  return new Response('✅ Kinetos WhatsApp Bot is live.', {
    headers: { 'Content-Type': 'text/plain' }
  })
}