'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { saveSession } from '../../lib/auth'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', slug: '', password: '', confirmPassword: ''
  })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  function handleChange(e) {
    const val = e.target.name === 'slug'
      ? e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
      : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    if (form.password !== form.confirmPassword) {
      setStatus('❌ Passwords do not match. Please check and try again.')
      setLoading(false)
      return
    }
    if (form.password.length < 6) {
      setStatus('❌ Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const { data: existing } = await supabase
      .from('agents')
      .select('slug')
      .eq('slug', form.slug)
      .single()

    if (existing) {
      setStatus('❌ That username is already taken. Try another one.')
      setLoading(false)
      return
    }

    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert([{
        name: form.name,
        email: form.email,
        phone: form.phone,
        slug: form.slug,
        password: form.password,
      }])
      .select()
      .single()

    if (error) {
      setStatus('❌ Error: ' + error.message)
      setLoading(false)
      return
    }

    // save phone map for voice bot
    await supabase.from('agent_phone_map').insert([{
      agent_phone: form.phone,
      agent_id: newAgent.id
    }])

    // auto login after register
    saveSession(newAgent)
    setStatus('✅ Registered and logged in! Taking you to upload page...')
    setLoading(false)

    setTimeout(() => {
      window.location.href = '/upload'
    }, 1500)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080f; font-family: 'JetBrains Mono', monospace; }
        .page {
          min-height: 100vh; display: flex; align-items: center;
          justify-content: center; padding: 24px 16px;
          background: #06080f; position: relative;
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
          width: 100%; max-width: 460px; position: relative; z-index: 1;
        }
        .card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          border-radius: 24px 24px 0 0;
          background: linear-gradient(90deg, #3b82f6, #34d399, transparent);
        }
        .badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
          color: #3b82f6; border: 1px solid rgba(59,130,246,0.3);
          background: rgba(59,130,246,0.07); padding: 5px 14px;
          border-radius: 100px; margin-bottom: 20px;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #3b82f6; box-shadow: 0 0 6px #3b82f6;
          animation: blink 2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 5vw, 28px); font-weight: 800;
          color: #f1f5f9; letter-spacing: -0.5px; margin-bottom: 8px; line-height: 1.2;
        }
        .title em {
          font-style: normal;
          background: linear-gradient(135deg, #60a5fa, #34d399);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .subtitle { font-size: 12px; color: #6b7fa0; margin-bottom: 28px; line-height: 1.6; }
        .form { display: flex; flex-direction: column; gap: 4px; }
        .label {
          font-size: 10px; color: #6b7fa0; letter-spacing: 1.5px;
          text-transform: uppercase; margin-top: 16px; margin-bottom: 6px; display: block;
        }
        .input {
          background: #131a28; border: 1px solid #1c2538; border-radius: 12px;
          padding: 13px 16px; color: #dde4f0; font-size: 14px;
          font-family: 'JetBrains Mono', monospace; outline: none; width: 100%;
          transition: border-color .2s; -webkit-appearance: none;
        }
        .input:focus { border-color: #3b82f6; }
        .input::placeholder { color: #3d4e68; }
        .slug-wrap {
          display: flex; align-items: center; background: #131a28;
          border: 1px solid #1c2538; border-radius: 12px; overflow: hidden;
          transition: border-color .2s;
        }
        .slug-wrap:focus-within { border-color: #3b82f6; }
        .slug-prefix {
          font-size: 11px; color: #3b82f6; padding: 13px 0 13px 14px;
          white-space: nowrap; flex-shrink: 0; opacity: .8;
        }
        .slug-input {
          background: transparent; border: none; padding: 13px 14px 13px 4px;
          color: #dde4f0; font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          outline: none; width: 100%; -webkit-appearance: none;
        }
        .slug-input::placeholder { color: #3d4e68; }
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
        .hint { font-size: 10px; color: #3d4e68; margin-top: 4px; line-height: 1.5; }
        .btn {
          margin-top: 24px; background: #3b82f6; color: #fff; border: none;
          border-radius: 14px; padding: 16px; font-size: 14px;
          font-family: 'Syne', sans-serif; font-weight: 700;
          cursor: pointer; width: 100%; transition: opacity .2s, transform .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn:hover { opacity: .88; }
        .btn:active { transform: scale(0.98); }
        .btn:disabled { background: #1c2538; color: #3d4e68; cursor: not-allowed; }
        .status {
          margin-top: 20px; font-size: 13px; line-height: 1.6;
          padding: 12px 16px; border-radius: 10px;
        }
        .status.success {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25); color: #10b981;
        }
        .status.error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25); color: #ef4444;
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #1c2538, transparent);
          margin: 28px 0 20px;
        }
        .login-link { text-align: center; font-size: 12px; color: #6b7fa0; }
        .login-link a { color: #3b82f6; text-decoration: none; }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="badge"><span className="badge-dot"></span>Free to start</div>
          <h1 className="title">Create your<br /><em>agent profile</em></h1>
          <p className="subtitle">Register once — login forever. No payment needed.</p>

          <form className="form" onSubmit={handleSubmit}>
            <label className="label">Your Name</label>
            <input className="input" name="name" placeholder="Ravi Kumar"
              onChange={handleChange} required autoComplete="name" />

            <label className="label">Email</label>
            <input className="input" name="email" type="email"
              placeholder="ravi@gmail.com" onChange={handleChange}
              required autoComplete="email" />

            <label className="label">Phone</label>
            <input className="input" name="phone" type="tel"
              placeholder="9999999999" onChange={handleChange}
              required autoComplete="tel" inputMode="numeric" />

            <label className="label">Your Username</label>
            <div className="slug-wrap">
              <span className="slug-prefix">kinetos.in/agent/</span>
              <input className="slug-input" name="slug"
                placeholder="ravi" value={form.slug}
                onChange={handleChange} required
                autoCapitalize="none" autoCorrect="off" />
            </div>
            <p className="hint">Only lowercase letters and numbers. No spaces.</p>

            <label className="label">Password</label>
            <div className="pass-wrap">
              <input className="pass-input" name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min 6 characters"
                onChange={handleChange} required autoComplete="new-password" />
              <button type="button" className="pass-toggle"
                onClick={() => setShowPass(p => !p)}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>

            <label className="label">Confirm Password</label>
            <div className="pass-wrap">
              <input className="pass-input" name="confirmPassword"
                type={showPass ? 'text' : 'password'}
                placeholder="Type password again"
                onChange={handleChange} required autoComplete="new-password" />
            </div>

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
            Already registered? <a href="/login">Login here →</a>
          </p>
        </div>
      </div>
    </>
  )
}