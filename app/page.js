'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [agentName, setAgentName] = useState('')
  const [agentSlug, setAgentSlug] = useState('')

  useEffect(() => {
    const savedName = localStorage.getItem('kinetos_agent_name')
    const savedSlug = localStorage.getItem('kinetos_agent_slug')
    if (savedName) setAgentName(savedName)
    if (savedSlug) setAgentSlug(savedSlug)
  }, [])

  const steps = [
    {
      num: '1',
      title: 'Create your free account',
      desc: 'Sign up with your name, phone number and pick a username. Takes less than 30 seconds. No payment needed.',
      btn: 'Register Now →',
      link: '/register',
      color: '#3b82f6',
      dim: 'rgba(59,130,246,0.1)',
      border: 'rgba(59,130,246,0.25)',
    },
    {
      num: '2',
      title: 'Add your properties',
      desc: 'Upload your flats, plots and houses. You get your own shareable link to send to any client instantly.',
      btn: 'Add a Property →',
      link: '/upload',
      color: '#f59e0b',
      dim: 'rgba(245,158,11,0.1)',
      border: 'rgba(245,158,11,0.25)',
    },
    {
      num: '3',
      title: 'Check your dashboard',
      desc: 'See all your listings, calls handled, and enquiries — all in one place. Open it anytime from your phone.',
      btn: 'Open Dashboard →',
      link: '/dashboard',
      color: '#10b981',
      dim: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.25)',
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080f; font-family: 'JetBrains Mono', monospace; }

        .page {
          min-height: 100vh;
          background: #06080f;
          padding-bottom: 60px;
          position: relative;
        }
        .page::before {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }

        .wrap {
          max-width: 540px;
          margin: 0 auto;
          padding: 0 16px;
          position: relative;
          z-index: 1;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0 36px;
        }
        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #f1f5f9;
        }
        .logo em {
          font-style: normal;
          background: linear-gradient(135deg, #60a5fa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-btn {
          font-size: 12px;
          color: #6b7fa0;
          text-decoration: none;
          border: 1px solid #1c2538;
          border-radius: 8px;
          padding: 7px 14px;
          transition: border-color .2s, color .2s;
          -webkit-tap-highlight-color: transparent;
          font-family: 'JetBrains Mono', monospace;
        }
        .nav-btn:hover { border-color: #3b82f6; color: #3b82f6; }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.3);
          background: rgba(16,185,129,0.07);
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 20px;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        .hero { margin-bottom: 32px; }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 6vw, 40px);
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1.15;
          letter-spacing: -0.5px;
          margin-bottom: 14px;
        }
        .hero-title em {
          font-style: normal;
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 13px;
          color: #6b7fa0;
          line-height: 1.85;
        }

        .what-box {
          background: #0f1520;
          border: 1px solid #1c2538;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        .what-box::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #3b82f6, #10b981, transparent);
        }
        .what-label {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 10px;
          display: block;
        }
        .what-text {
          font-size: 13px;
          color: #dde4f0;
          line-height: 1.85;
        }
        .what-text strong { color: #f1f5f9; }

        .steps-label {
          font-size: 10px;
          color: #3d4e68;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }

        .step-card {
          background: #0f1520;
          border: 1px solid #1c2538;
          border-radius: 18px;
          padding: 22px 20px;
          margin-bottom: 10px;
          transition: border-color .2s;
        }
        .step-card:hover { border-color: #253248; }

        .step-top {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 10px;
        }
        .step-num {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          line-height: 1;
          flex-shrink: 0;
          opacity: 0.35;
        }
        .step-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
          padding-top: 5px;
          line-height: 1.3;
        }
        .step-desc {
          font-size: 12px;
          color: #6b7fa0;
          line-height: 1.85;
          margin-bottom: 16px;
          padding-left: 44px;
        }
        .step-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: opacity .2s, transform .2s;
          -webkit-tap-highlight-color: transparent;
          border: 1px solid;
        }
        .step-btn:hover { opacity: .85; }
        .step-btn:active { transform: scale(0.98); }

        .returning-banner {
          background: rgba(59,130,246,0.07);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 14px;
          padding: 16px 18px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .returning-title {
          font-size: 13px;
          color: #3b82f6;
          font-weight: 500;
          margin-bottom: 3px;
        }
        .returning-sub { font-size: 11px; color: #6b7fa0; }
        .returning-btn {
          background: #3b82f6;
          color: #fff;
          padding: 9px 18px;
          border-radius: 9px;
          font-size: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
          flex-shrink: 0;
        }

        .help-box {
          background: #0f1520;
          border: 1px solid #1c2538;
          border-radius: 16px;
          padding: 22px 20px;
          margin-top: 24px;
          text-align: center;
        }
        .help-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 8px;
        }
        .help-sub {
          font-size: 12px;
          color: #6b7fa0;
          line-height: 1.8;
          margin-bottom: 16px;
        }
        .help-call {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: #10b981;
          border-radius: 10px;
          padding: 11px 22px;
          font-size: 13px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }

        .footer {
          text-align: center;
          margin-top: 32px;
          font-size: 10px;
          color: #3d4e68;
          letter-spacing: 1px;
        }

        @media (max-width: 380px) {
          .hero-title { font-size: 24px; }
          .step-title { font-size: 14px; }
        }
      `}</style>

      <div className="page">
        <div className="wrap">

          <nav className="nav">
            <div className="logo">Kinetos — <em>Mee Property Assistant</em></div>
            <a href="/dashboard" className="nav-btn">Dashboard →</a>
          </nav>

          <div className="hero">
            <div className="badge">
              <span className="badge-dot"></span>
              {agentName ? `Welcome back, ${agentName}!` : 'Free to start — no card needed'}
            </div>
            <h1 className="hero-title">
              Your AI assistant<br />
              that <em>never misses</em><br />
              a lead
            </h1>
            <p className="hero-sub">
              Built for real estate agents. Share your listings with one link.
              Let AI handle enquiries when you are busy. Never lose a client again.
            </p>
          </div>

          <div className="what-box">
            <span className="what-label">What does this app do?</span>
            <p className="what-text">
              When you are out showing a property and someone calls you —{' '}
              <strong>our AI picks up the call</strong>, understands what they
              are looking for, and sends them your matching listings on WhatsApp.
              You get a summary notification.{' '}
              <strong>Zero leads lost.</strong>
            </p>
          </div>

          <span className="steps-label">How to get started — 3 simple steps</span>

          {steps.map((s, i) => (
            <div key={i} className="step-card" style={{ borderTop: `2px solid ${s.color}` }}>
              <div className="step-top">
                <div className="step-num" style={{ color: s.color }}>{s.num}</div>
                <div className="step-title">{s.title}</div>
              </div>
              <p className="step-desc">{s.desc}</p>
              <a
                href={s.link}
                className="step-btn"
                style={{ background: s.dim, borderColor: s.border, color: s.color }}
              >
                {s.btn}
              </a>
            </div>
          ))}

          {agentSlug && (
            <div className="returning-banner">
              <div>
                <div className="returning-title">You are already registered!</div>
                <div className="returning-sub">Username: {agentSlug}</div>
              </div>
              <a href={`/agent/${agentSlug}`} className="returning-btn">
                View My Portfolio →
              </a>
            </div>
          )}

          <div className="help-box">
            <div className="help-title">Need help getting started? 🙋</div>
            <p className="help-sub">
              If anything is confusing or not working — just call us.
              We will help you set everything up, completely free.
            </p>
            <a href="tel:+917013781290" className="help-call">
              📞 Call Us
            </a>
          </div>

          <p className="footer">
            Kinetos · Real Estate AI · Built for Indian Agents · Free to Start
          </p>

        </div>
      </div>
    </>
  )
}