import twilio from 'twilio'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(req) {
  try {
    const formData = await req.formData()

    // Twilio sends these automatically
    const callerPhone = formData.get('From')      // client's number
    const forwardedFrom = formData.get('ForwardedFrom') // agent's real number
    const speechResult = formData.get('SpeechResult')   // what client said

    const twiml = new VoiceResponse()

    // ── STEP 1: First call — no speech yet, greet and listen ──
    if (!speechResult) {

      // find agent by their real phone number
      const phoneToSearch = forwardedFrom || callerPhone

      const { data: phoneMap } = await supabase
        .from('agent_phone_map')
        .select('agent_id, agents(name, slug)')
        .eq('agent_phone', phoneToSearch.replace('+91', '').replace('+1', ''))
        .single()

      const agentName = phoneMap?.agents?.name || 'our agent'
      const agentSlug = phoneMap?.agents?.slug || ''

      // greet caller and ask what they want
      const gather = twiml.gather({
        input: 'speech',
        language: 'hi-IN',  // understands Hindi, Telugu, English
        speechTimeout: 'auto',
        action: `/api/voice?slug=${agentSlug}&agentPhone=${phoneToSearch}`,
        method: 'POST',
      })

      gather.say({
        voice: 'Polly.Aditi',
        language: 'hi-IN'
      },
        `Hello! I am ${agentName}'s property assistant. Please tell me what kind of property you are looking for — area, budget, and number of bedrooms.`
      )

      // if no speech detected
      twiml.say({ voice: 'Polly.Aditi' },
        'Sorry, I could not hear you. Please call back and try again.'
      )

      return new Response(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // ── STEP 2: Client spoke — process their requirement ──
    const slug = new URL(req.url).searchParams.get('slug')
    const agentPhone = new URL(req.url).searchParams.get('agentPhone')

    // get agent details
    const { data: agent } = await supabase
      .from('agents')
      .select('id, name, phone')
      .eq('slug', slug)
      .single()

    if (!agent) {
      twiml.say('Sorry, agent not found. Please try again.')
      return new Response(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // get agent's properties
    const { data: properties } = await supabase
      .from('properties')
      .select('title, area, bhk, price_lakhs, status, description')
      .eq('agent_id', agent.id)

    // build property context
    const propertyContext = properties?.map((p, i) =>
      `Property ${i + 1}: ${p.title} | ${p.bhk} BHK | ${p.area} | ₹${p.price_lakhs} Lakhs | ${p.status}`
    ).join('\n') || 'No properties available'

    // ask Groq to find matches
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `You are a property assistant for ${agent.name}.
Find the best matching properties from this list based on the client's requirement.
Reply in simple English, mention max 2-3 properties.
Keep it short — this will be spoken aloud on a phone call.
End with: "I am sending you a WhatsApp message with the full details right now."

PROPERTIES:
${propertyContext}`
        },
        {
          role: 'user',
          content: `Client said: "${speechResult}". What properties match?`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const aiReply = completion.choices[0]?.message?.content ||
      'I found some properties for you. I am sending details on WhatsApp now.'

    // speak the reply to caller
    twiml.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, aiReply)

    // send WhatsApp to client with portfolio link
    try {
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      )

      const portfolioLink = `${process.env.NEXT_PUBLIC_APP_URL}/agent/${slug}`
      const chatLink = `${process.env.NEXT_PUBLIC_APP_URL}/chat/${slug}`

      // WhatsApp to client
      await twilioClient.messages.create({
        from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
        to: 'whatsapp:' + callerPhone,
        body: `Hi! I am ${agent.name}'s property assistant.\n\nBased on your requirement, here are the matching properties:\n\n📋 View all listings: ${portfolioLink}\n\n🤖 Ask me more questions: ${chatLink}\n\n${agent.name} will call you back shortly.`
      })

      // WhatsApp summary to agent
      await twilioClient.messages.create({
        from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
        to: 'whatsapp:+91' + agent.phone,
        body: `🔔 New missed call handled!\n\nCaller: ${callerPhone}\nThey said: "${speechResult}"\n\nAI replied: ${aiReply}\n\nCall them back when free!`
      })

    } catch (waErr) {
      console.error('WhatsApp error:', waErr.message)
      // don't crash the call if WhatsApp fails
    }

    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (err) {
    console.error('Voice route error:', err)
    const twiml = new VoiceResponse()
    twiml.say('Sorry, something went wrong. Please try again.')
    return new Response(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}
