'use client'
import { useEffect, useState } from 'react'

// ─────────────────────────────────────────
// ALL TEXT CONTENT — English + Telugu
// ─────────────────────────────────────────
const content = {
  en: {
    badge_new: 'Free to start — no card needed',
    badge_returning: (name) => `Welcome back, ${name}!`,
    hero_line1: 'Your AI assistant',
    hero_line2: 'that',
    hero_highlight: 'never misses',
    hero_line3: 'a lead',
    hero_sub: 'Built for real estate agents. Share your listings with one link. Let AI handle enquiries when you are busy. Never lose a client again.',
    what_label: 'What does this app do?',
    what_text: 'When you are out showing a property and someone calls you — our AI picks up the call, understands what they are looking for, and sends them your matching listings on WhatsApp. You get a summary notification. Zero leads lost.',
    what_bold1: 'our AI picks up the call',
    what_bold2: 'Zero leads lost.',
    steps_label: 'How to get started — 3 simple steps',
    steps: [
      {
        num: '1',
        title: 'Create your free account',
        desc: 'Sign up with your name, phone number and pick a username. Takes less than 30 seconds. No payment needed.',
        btn: 'Register Now →',
        link: '/register',
      },
      {
        num: '2',
        title: 'Add your properties',
        desc: 'Upload your flats, plots and houses. You get your own shareable link to send to any client instantly.',
        btn: 'Add a Property →',
        link: '/upload',
      },
      {
        num: '3',
        title: 'Check your dashboard',
        desc: 'See all your listings, calls handled, and enquiries — all in one place. Open it anytime from your phone.',
        btn: 'Open Dashboard →',
        link: '/dashboard',
      },
    ],
    returning_title: 'You are already registered!',
    returning_sub: (slug) => `Username: ${slug}`,
    returning_btn: 'View My Portfolio →',
    help_title: 'Need help getting started? 🙋',
    help_sub: 'If anything is confusing or not working — just call us. We will help you set everything up, completely free.',
    help_btn: '📞 Call Us',
    nav_dashboard: 'Dashboard →',
    footer: 'Kinetos · Real Estate AI · Built for Indian Agents · Free to Start',
    toggle_btn: 'తెలుగు లో చదవండి',
  },
  te: {
    badge_new: 'Free గా Start చేయండి — Card అక్కర్లేదు',
    badge_returning: (name) => `Welcome back, ${name}!`,
    hero_line1: 'మీ AI Assistant',
    hero_line2: '',
    hero_highlight: 'ఒక్క Lead కూడా',
    hero_line3: 'Miss చేయదు',
    hero_sub: 'Real estate agents కోసం తయారు చేశాం. మీ listings ఒక్క link తో share చేయండి. మీరు busy గా ఉన్నా AI enquiries handle చేస్తుంది. ఒక్క client కూడా పోరు.',
    what_label: 'ఇది ఏం చేస్తుంది?',
    what_text: 'మీరు property show కి వెళ్ళినప్పుడు ఎవరైనా call చేస్తే — మన AI automatically pick చేసి, వాళ్ళకి మీ listings పంపిస్తుంది. మీకు ఒక summary notification వస్తుంది. Zero leads lost.',
    what_bold1: 'AI automatically pick చేసి',
    what_bold2: 'Zero leads lost.',
    steps_label: 'మొదలు పెట్టడానికి — 3 Simple Steps',
    steps: [
      {
        num: '1',
        title: 'మీ Free Account తయారు చేసుకోండి',
        desc: 'మీ పేరు, phone number, username ఇచ్చి register చేసుకోండి. Free గా, 30 seconds లో అవుతుంది. Payment అక్కర్లేదు.',
        btn: 'Register చేయండి →',
        link: '/register',
      },
      {
        num: '2',
        title: 'మీ Properties Add చేయండి',
        desc: 'మీ దగ్గర ఉన్న flats, plots, houses అన్నీ add చేయండి. Clients కి share చేయడానికి మీ own link వస్తుంది.',
        btn: 'Property Add చేయండి →',
        link: '/upload',
      },
      {
        num: '3',
        title: 'మీ Dashboard చూసుకోండి',
        desc: 'మీ listings, calls, AI handle చేసిన enquiries అన్నీ ఒకే చోట చూడవచ్చు. Phone లో anytime open చేయవచ్చు.',
        btn: 'Dashboard తెరవండి →',
        link: '/dashboard',
      },
    ],
    returning_title: 'మీరు already registered అయ్యారు!',
    returning_sub: (slug) => `Username: ${slug}`,
    returning_btn: 'మీ Portfolio చూడండి →',
    help_title: 'సహాయం కావాలా? 🙋',
    help_sub: 'ఏదైనా అర్థం కాకపోతే, లేదా problem వస్తే — మాకు call చేయండి. మేము setup చేయడంలో help చేస్తాం. Completely free.',
    help_btn: '📞 మాకు Call చేయండి',
    nav_dashboard: 'Dashboard →',
    footer: 'Kinetos · Real Estate AI · Telugu Agents కోసం · Free to Start',
    toggle_btn: 'Read in English',
  },
}

const STEP_COLORS = [
  { color: '#3b82f6', dim: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
  { color: '#f59e0b', dim: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  { color: '#10b981', dim: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
]

export default function Home() {
  const [lang, setLang] = useState('en')
  const [agentName, setAgentName] = useState('')
  const [agentSlug, setAgentSlug] = useState('')

  useEffect(() => {
    // restore saved language
    const savedLang = localStorage.getItem('kinetos_lang') || 'en'
    setLang(savedLang)
    // restore agent info
    const savedName = localStorage.getItem('kinetos_agent_name')
    const savedSlug = localStorage.getItem('kinetos_agent_slug')
    if (savedName) setAgentName(savedName)
    if (savedSlug) setAgentSlug(savedSlug)
  }, [])

  function toggleLang() {
    const next = lang === 'en' ? 'te' : 'en'
    setLang(next)
    localStorage.setItem('kinetos_lang', next)
  }

  const t = content[lang]

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

        /* NAV */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0 36px;
          gap: 10px;
        }
        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 800;
          color: #f1f5f9;
          flex: 1;
          min-width: 0;
        }
        .logo em {
          font-style: normal;
          background: linear-gradient(135deg, #60a5fa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* nav right side buttons */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* language toggle button */
        .lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          color: #f59e0b;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: 8px;
          padding: 7px 12px;
          cursor: pointer;
          transition: all .2s;
          -webkit-tap-highlight-color: transparent;
          white-space: nowrap;
        }
        .lang-btn:hover {
          background: rgba(245,158,11,0.15);
          border-color: rgba(245,158,11,0.5);
        }
        .lang-btn:active { transform: scale(0.97); }
        .lang-icon { font-size: 13px; }

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
          white-space: nowrap;
        }
        .nav-btn:hover { border-color: #3b82f6; color: #3b82f6; }

        /* BADGE */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.3);
          background: rgba(16,185,129,0.07);
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: blink 2s infinite;
          flex-shrink: 0;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        /* HERO */
        .hero { margin-bottom: 32px; }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(26px, 6vw, 40px);
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1.2;
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

        /* WHAT BOX */
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

        /* STEPS */
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
          font-size: 15px;
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

        /* RETURNING BANNER */
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

        /* HELP BOX */
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
          line-height: 1.8;
        }

        @media (max-width: 400px) {
          .logo { font-size: 12px; }
          .lang-btn { font-size: 10px; padding: 6px 9px; }
          .nav-btn { font-size: 11px; padding: 6px 10px; }
          .hero-title { font-size: 24px; }
          .step-title { font-size: 14px; }
        }
      `}</style>

      <div className="page">
        <div className="wrap">

          {/* ── NAV ── */}
          <nav className="nav">
            <div className="logo">
              Kinetos — <em>Mee Property Assistant</em>
            </div>
            <div className="nav-right">
              {/* Language toggle */}
              <button className="lang-btn" onClick={toggleLang}>
                <span className="lang-icon">🌐</span>
                {t.toggle_btn}
              </button>
              <a href="/dashboard" className="nav-btn">{t.nav_dashboard}</a>
            </div>
          </nav>

          {/* ── HERO ── */}
          <div className="hero">
            <div className="badge">
              <span className="badge-dot"></span>
              {agentName
                ? t.badge_returning(agentName)
                : t.badge_new
              }
            </div>

            <h1 className="hero-title">
              {t.hero_line1}<br />
              {t.hero_line2 && <>{t.hero_line2} </>}
              <em>{t.hero_highlight}</em><br />
              {t.hero_line3}
            </h1>
            <p className="hero-sub">{t.hero_sub}</p>
          </div>

          {/* ── WHAT IT DOES ── */}
          <div className="what-box">
            <span className="what-label">{t.what_label}</span>
            <p className="what-text">
              {t.what_text.split(t.what_bold1)[0]}
              <strong>{t.what_bold1}</strong>
              {t.what_text.split(t.what_bold1)[1]?.split(t.what_bold2)[0]}
              <strong>{t.what_bold2}</strong>
            </p>
          </div>

          {/* ── STEPS ── */}
          <span className="steps-label">{t.steps_label}</span>

          {t.steps.map((s, i) => (
            <div
              key={i}
              className="step-card"
              style={{ borderTop: `2px solid ${STEP_COLORS[i].color}` }}
            >
              <div className="step-top">
                <div
                  className="step-num"
                  style={{ color: STEP_COLORS[i].color }}
                >
                  {s.num}
                </div>
                <div className="step-title">{s.title}</div>
              </div>
              <p className="step-desc">{s.desc}</p>
              <a
                href={s.link}
                className="step-btn"
                style={{
                  background: STEP_COLORS[i].dim,
                  borderColor: STEP_COLORS[i].border,
                  color: STEP_COLORS[i].color,
                }}
              >
                {s.btn}
              </a>
            </div>
          ))}

          {/* ── RETURNING AGENT ── */}
          {agentSlug && (
            <div className="returning-banner">
              <div>
                <div className="returning-title">{t.returning_title}</div>
                <div className="returning-sub">{t.returning_sub(agentSlug)}</div>
              </div>
              <a href={`/agent/${agentSlug}`} className="returning-btn">
                {t.returning_btn}
              </a>
            </div>
          )}

          {/* ── HELP ── */}
          <div className="help-box">
            <div className="help-title">{t.help_title}</div>
            <p className="help-sub">{t.help_sub}</p>
            <a href="tel:+919999999999" className="help-call">
              {t.help_btn}
            </a>
          </div>

          <p className="footer">{t.footer}</p>

        </div>
      </div>
    </>
  )
}