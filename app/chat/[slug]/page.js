'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ChatPage() {
  const { slug } = useParams()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hi! I am ${slug}'s property assistant. Ask me anything — budget, area, BHK, ready to move — I will find the best match for you! 🏠`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, agentSlug: slug })
      })
      const data = await res.json()

      if (data.error) {
        setMessages(prev => [...prev, { role: 'ai', text: '❌ ' + data.error }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ Could not connect. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080f; font-family: 'JetBrains Mono', monospace; }

        .page {
          display: flex; flex-direction: column;
          height: 100dvh;
          background: #06080f;
        }

        /* header */
        .header {
          background: #0f1520;
          border-bottom: 1px solid #1c2538;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .header-back {
          color: #6b7fa0; text-decoration: none;
          font-size: 12px;
          -webkit-tap-highlight-color: transparent;
        }
        .header-info { flex: 1; }
        .header-name {
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 800;
          color: #f1f5f9;
        }
        .header-sub { font-size: 11px; color: #6b7fa0; margin-top: 1px; }
        .online-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: blink 2s infinite;
          flex-shrink: 0;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        /* messages */
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
        }

        .msg { display: flex; gap: 10px; max-width: 88%; }
        .msg.user { align-self: flex-end; flex-direction: row-reverse; }
        .msg.ai { align-self: flex-start; }

        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .avatar.ai { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.25); }
        .avatar.user { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25); }

        .bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.75;
        }
        .bubble.ai {
          background: #0f1520;
          border: 1px solid #1c2538;
          color: #dde4f0;
          border-radius: 4px 16px 16px 16px;
        }
        .bubble.user {
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.25);
          color: #dde4f0;
          border-radius: 16px 4px 16px 16px;
        }

        /* typing indicator */
        .typing {
          display: flex; gap: 5px;
          align-items: center;
          padding: 14px 16px;
        }
        .typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: #3b82f6; opacity: 0.5;
          animation: bounce 1.2s infinite;
        }
        .typing span:nth-child(2) { animation-delay: .2s; }
        .typing span:nth-child(3) { animation-delay: .4s; }
        @keyframes bounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* quick prompts */
        .quick-prompts {
          padding: 0 16px 10px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
          flex-shrink: 0;
        }
        .quick-prompts::-webkit-scrollbar { display: none; }
        .qp {
          flex-shrink: 0;
          padding: 7px 14px;
          background: #0f1520;
          border: 1px solid #1c2538;
          border-radius: 100px;
          color: #6b7fa0;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          white-space: nowrap;
          transition: all .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .qp:hover { border-color: #3b82f6; color: #3b82f6; }

        /* input bar */
        .input-bar {
          background: #0f1520;
          border-top: 1px solid #1c2538;
          padding: 12px 16px;
          flex-shrink: 0;
        }
        .input-inner {
          max-width: 640px;
          margin: 0 auto;
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .input {
          flex: 1;
          background: #131a28;
          border: 1px solid #1c2538;
          border-radius: 14px;
          padding: 12px 16px;
          color: #dde4f0;
          font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: border-color .2s;
          -webkit-appearance: none;
        }
        .input:focus { border-color: #3b82f6; }
        .input::placeholder { color: #3d4e68; }

        .send-btn {
          width: 44px; height: 44px;
          background: #3b82f6;
          border: none; border-radius: 12px;
          color: #fff; font-size: 18px;
          cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: opacity .2s, transform .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .send-btn:hover { opacity: .88; }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { background: #1c2538; cursor: not-allowed; }
      `}</style>

      <div className="page">

        {/* Header */}
        <div className="header">
          <a href={`/agent/${slug}`} className="header-back">←</a>
          <div className="header-info">
            <div className="header-name">🏠 {slug}'s Property Assistant</div>
            <div className="header-sub">Ask me anything about properties</div>
          </div>
          <div className="online-dot"></div>
        </div>

        {/* Messages */}
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className={`avatar ${m.role}`}>
                {m.role === 'ai' ? '🤖' : '👤'}
              </div>
              <div className={`bubble ${m.role}`}>{m.text}</div>
            </div>
          ))}

          {loading && (
            <div className="msg ai">
              <div className="avatar ai">🤖</div>
              <div className="bubble ai">
                <div className="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="quick-prompts">
          {[
            '2BHK under ₹50L',
            'Ready to move',
            '3BHK near school',
            'Best budget option',
            'Show all listings',
          ].map((q, i) => (
            <button
              key={i}
              className="qp"
              onClick={() => {
                setInput(q)
                setTimeout(() => {
                  document.querySelector('form').requestSubmit()
                }, 50)
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="input-bar">
          <form className="input-inner" onSubmit={sendMessage}>
            <input
              className="input"
              placeholder="Ask about properties..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <button className="send-btn" type="submit" disabled={loading || !input.trim()}>
              ↑
            </button>
          </form>
        </div>

      </div>
    </>
  )
}