'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', slug: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const val = e.target.name === 'slug'
      ? e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
      : e.target.value
    setForm({ ...form, [e.target.name]: val.trim() })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    const { data: existing } = await supabase
      .from('agents')
      .select('slug')
      .eq('slug', form.slug)
      .single()

    if (existing) {
      setStatus('❌ That slug is already taken. Try another.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('agents').insert([form])

    if (error) {
      setStatus('❌ Error: ' + error.message)
    } else {
      localStorage.setItem('kinetos_agent_name', form.name)
      localStorage.setItem('kinetos_agent_slug', form.slug)
      setStatus('✅ Registered! Your link is: /agent/' + form.slug)
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #06080f;
          font-family: 'JetBrains Mono', monospace;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background: #06080f;
          position: relative;
        }

        /* subtle grid bg */
        .page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .card {
          background: #0f1520;
          border: 1px solid #1c2538;
          border-radius: 24px;
          padding: 36px 28px;
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 1;
        }

        /* top gradient line */
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 24px 24px 0 0;
          background: linear-gradient(90deg, #3b82f6, #10b981, transparent);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #3b82f6;
          border: 1px solid rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.07);
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 20px;
        }

        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 6px #3b82f6;
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%,100% { opacity:1 }
          50% { opacity:.2 }
        }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 5vw, 28px);
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .title em {
          font-style: normal;
          background: linear-gradient(135deg, #60a5fa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 12px;
          color: #6b7fa0;
          line-height: 1.7;
          margin-bottom: 28px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label {
          font-size: 10px;
          color: #6b7fa0;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-top: 16px;
          margin-bottom: 6px;
          display: block;
        }

        .input {
          background: #131a28;
          border: 1px solid #1c2538;
          border-radius: 12px;
          padding: 13px 16px;
          color: #dde4f0;
          font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          width: 100%;
          transition: border-color .2s;
          -webkit-appearance: none;
        }

        .input:focus {
          border-color: #3b82f6;
        }

        .input::placeholder {
          color: #3d4e68;
        }

        .slug-wrap {
          display: flex;
          align-items: center;
          background: #131a28;
          border: 1px solid #1c2538;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color .2s;
        }

        .slug-wrap:focus-within {
          border-color: #3b82f6;
        }

        .slug-prefix {
          font-size: 11px;
          color: #3b82f6;
          padding: 13px 0 13px 14px;
          white-space: nowrap;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .slug-input {
          background: transparent;
          border: none;
          padding: 13px 14px 13px 4px;
          color: #dde4f0;
          font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          width: 100%;
          -webkit-appearance: none;
        }

        .slug-input::placeholder {
          color: #3d4e68;
        }

        .hint {
          font-size: 10px;
          color: #3d4e68;
          margin-top: 5px;
          line-height: 1.5;
        }

        .btn {
          margin-top: 28px;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 16px;
          font-size: 14px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          transition: opacity .2s, transform .2s;
          -webkit-tap-highlight-color: transparent;
        }

        .btn:hover { opacity: .88; }
        .btn:active { transform: scale(0.98); }

        .btn:disabled {
          background: #1c2538;
          color: #3d4e68;
          cursor: not-allowed;
          transform: none;
        }

        .status {
          margin-top: 20px;
          font-size: 13px;
          line-height: 1.6;
          padding: 12px 16px;
          border-radius: 10px;
        }

        .status.success {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: #10b981;
        }

        .status.error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #ef4444;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #1c2538, transparent);
          margin: 28px 0 20px;
        }

        .login-link {
          text-align: center;
          font-size: 12px;
          color: #6b7fa0;
        }

        .login-link a {
          color: #3b82f6;
          text-decoration: none;
        }

        /* mobile tweaks */
        @media (max-width: 400px) {
          .card { padding: 28px 20px; border-radius: 20px; }
          .slug-prefix { font-size: 10px; }
        }
      `}</style>

      <div className="page">
        <div className="card">

          <div className="badge">
            <span className="badge-dot"></span>
            Free to start
          </div>

          <h1 className="title">Create your<br /><em>agent profile</em></h1>
          <p className="subtitle">
            Get your personal property listing link in 30 seconds.<br />
            No credit card. No app download.
          </p>

          <form className="form" onSubmit={handleSubmit}>

            <label className="label">Your Name</label>
            <input
              className="input"
              name="name"
              placeholder="Ravi Kumar"
              onChange={handleChange}
              required
              autoComplete="name"
            />

            <label className="label">Email</label>
            <input
              className="input"
              name="email"
              type="email"
              placeholder="ravi@gmail.com"
              onChange={handleChange}
              required
              autoComplete="email"
            />

            <label className="label">Phone</label>
            <input
              className="input"
              name="phone"
              type="tel"
              placeholder="9999999999"
              onChange={handleChange}
              required
              autoComplete="tel"
              inputMode="numeric"
            />

            <label className="label">Your Username</label>
            <div className="slug-wrap">
              <span className="slug-prefix">kinetos.in/agent/</span>
              <input
                className="slug-input"
                name="slug"
                placeholder="e.g. ravi, priya, srikanth"
                value={form.slug}
                onChange={handleChange}
                required
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
            <p className="hint">
              Only lowercase letters & numbers. No spaces.<br />
              Example: ravi · priya · srikanth99
            </p>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creating your profile...' : 'Create My Profile →'}
            </button>

          </form>

          {status && (
            <div className={`status ${status.startsWith('✅') ? 'success' : 'error'}`}>
              {status}
            </div>
          )}

          <div className="divider" />
          <p className="login-link">
            Already registered? <a href="/dashboard">Go to dashboard →</a>
          </p>

        </div>
      </div>
    </>
  )
}