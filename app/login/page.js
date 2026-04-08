'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { saveSession, isLoggedIn } from '../../lib/auth'

export default function LoginPage() {
  const [form, setForm] = useState({ slug: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    // already logged in — go to upload
    if (isLoggedIn()) {
      window.location.href = '/upload'
    }
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('slug', form.slug.toLowerCase().trim())
      .eq('password', form.password)
      .single()

    if (error || !agent) {
      setStatus('❌ Wrong username or password. Please try again.')
      setLoading(false)
      return
    }

    // save session
    saveSession(agent)
    setStatus('✅ Logged in! Taking you to your dashboard...')
    setLoading(false)

    setTimeout(() => {
      window.location.href = '/upload'
    }, 1000)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080f; font-family: 'JetBrains Mono', monospace; }
        .page {
          min-height: 100vh; display: flex;
          align-items: center; justify-content: center;
          padding: 24px 16px; background: #06080f; position: relative;
        }
        .page::before {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none; z-index: 0;
        }
        .card {
          background: #0f1520; border: 1px solid #1c2538;
          border-radius: 24px; padding: 36px 28px;
          width: 100%; max-width: 400px;
          position: relative; z-index: 1;
        }
        .card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          border-radius: 24px 24px 0 0;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, transparent);
        }
        .icon { font-size: 32px; margin-bottom: 16px; }
        .title {
          font-family: 'Syne', sans-serif; font-size: 26px;
          font-weight: 800; color: #f1f5f9; margin-bottom: 6px;
        }
        .title em {
          font-style: normal;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sub { font-size: 12px; color: #6b7fa0; margin-bottom: 28px; line-height: 1.6; }
        .label {
          font-size: 10px; color: #6b7fa0; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 6px;
          display: block; margin-top: 16px;
        }
        .input {
          background: #131a28; border: 1px solid #1c2538; border-radius: 12px;
          padding: 13px 16px; color: #dde4f0; font-size: 14px;
          font-family: 'JetBrains Mono', monospace; outline: none; width: 100%;
          transition: border-color .2s; -webkit-appearance: none;
        }
        .input:focus { border-color: #3b82f6; }
        .input::placeholder { color: #3d4e68; }
        .pass-wrap {
          display: flex; align-items: center; background: #131a28;
          border: 1px solid #1c2538; border-radius: 12px; overflow: hidden;
          transition: border-color .2s;
        }
        .pass-wrap:focus-within { border-color: #3b82f6; }
        .pass-input {
          background: transparent; border: none; padding: 13px 14px;
          color: #dde4f0; font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          outline: none; flex: 1; -webkit-appearance: none;
        }
        .pass-input::placeholder { color: #3d4e68; }
        .pass-toggle {
          background: none; border: none; color: #6b7fa0;
          padding: 13px 14px; cursor: pointer; font-size: 12px;
          -webkit-tap-highlight-color: transparent;
        }
        .btn {
          margin-top: 24px; background: #3b82f6; color: #fff; border: none;
          border-radius: 14px; padding: 15px; font-size: 14px;
          font-family: 'Syne', sans-serif; font-weight: 700;
          cursor: pointer; width: 100%; transition: opacity .2s, transform .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn:hover { opacity: .88; }
        .btn:active { transform: scale(0.98); }
        .btn:disabled { background: #1c2538; color: #3d4e68; cursor: not-allowed; }
        .status {
          margin-top: 16px; font-size: 13px; padding: 12px 16px;
          border-radius: 10px; line-height: 1.6;
        }
        .success {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25); color: #10b981;
        }
        .error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25); color: #ef4444;
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #1c2538, transparent);
          margin: 24px 0 20px;
        }
        .bottom-links {
          display: flex; flex-direction: column; gap: 8px;
          text-align: center; font-size: 12px; color: #6b7fa0;
        }
        .bottom-links a { color: #3b82f6; text-decoration: none; }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="icon">🔐</div>
          <h1 className="title">Agent <em>Login</em></h1>
          <p className="sub">Login once — upload properties anytime, from anywhere.</p>

          <form onSubmit={handleSubmit}>
            <label className="label">Your Username</label>
            <input
              className="input"
              name="slug"
              placeholder="e.g. ravi"
              value={form.slug}
              onChange={handleChange}
              required
              autoCapitalize="none"
              autoCorrect="off"
            />

            <label className="label">Password</label>
            <div className="pass-wrap">
              <input
                className="pass-input"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          {status && (
            <div className={`status ${status.startsWith('✅') ? 'success' : 'error'}`}>
              {status}
            </div>
          )}

          <div className="divider" />
          <div className="bottom-links">
            <span>New agent? <a href="/register">Register here →</a></span>
            <span><a href="/">← Back to Home</a></span>
          </div>
        </div>
      </div>
    </>
  )
}