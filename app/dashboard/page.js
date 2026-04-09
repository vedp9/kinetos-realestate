'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getSession, clearSession } from '../../lib/auth'

export default function Dashboard() {
  const [slug, setSlug] = useState('')
  const [agent, setAgent] = useState(null)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [deleting, setDeleting] = useState(null)
  useEffect(() => {
    const session = getSession()
    if (!session) {
      window.location.href = '/login'
      return
    }
    // auto-fill username from session
    setForm(f => ({ ...f, agent_slug: session.slug }))
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: agentData, error: agentErr } = await supabase
      .from('agents')
      .select('*')
      .eq('slug', slug.toLowerCase().trim())
      .single()

    if (agentErr || !agentData) {
      setError('❌ No agent found with that slug. Did you register?')
      setLoading(false)
      return
    }

    const { data: props } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', agentData.id)
      .order('created_at', { ascending: false })

    setAgent(agentData)
    setProperties(props || [])
    setLoggedIn(true)
    setLoading(false)
  }

  async function handleDelete(propId) {
    setDeleting(propId)
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propId)

    if (!error) {
      setProperties(prev => prev.filter(p => p.id !== propId))
    }
    setDeleting(null)
  }

  function copyLink() {
    const link = `${window.location.origin}/agent/${agent.slug}`
    navigator.clipboard.writeText(link)
    alert('✅ Link copied! Share it with your clients.')
  }

  // ── STATS ──
  const totalProps = properties.length
  const readyCount = properties.filter(p => p.status === 'Ready to move').length
  const underCount = properties.filter(p => p.status === 'Under construction').length
  const avgPrice = totalProps > 0
    ? (properties.reduce((sum, p) => sum + p.price_lakhs, 0) / totalProps).toFixed(1)
    : 0

  // ── LOGIN SCREEN ──
  if (!loggedIn) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080f; font-family: 'JetBrains Mono', monospace; }
        .page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
          background: #06080f;
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
        .card {
          background: #0f1520; border: 1px solid #1c2538;
          border-radius: 24px; padding: 36px 28px;
          width: 100%; max-width: 400px; position: relative; z-index: 1;
        }
        .card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          border-radius: 24px 24px 0 0;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, transparent);
        }
        .icon { font-size: 32px; margin-bottom: 16px; }
        .title {
          font-family: 'Syne', sans-serif; font-size: 24px;
          font-weight: 800; color: #f1f5f9; margin-bottom: 6px;
        }
        .title em {
          font-style: normal;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .sub { font-size: 12px; color: #6b7fa0; margin-bottom: 28px; line-height: 1.6; }
        .label {
          font-size: 10px; color: #6b7fa0; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 6px; display: block;
        }
        .input {
          background: #131a28; border: 1px solid #1c2538; border-radius: 12px;
          padding: 13px 16px; color: #dde4f0; font-size: 14px;
          font-family: 'JetBrains Mono', monospace; outline: none; width: 100%;
          transition: border-color .2s; -webkit-appearance: none;
        }
        .input:focus { border-color: #3b82f6; }
        .input::placeholder { color: #3d4e68; }
        .btn {
          margin-top: 20px; width: 100%;
          background: #3b82f6; color: #fff; border: none;
          border-radius: 14px; padding: 15px;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: opacity .2s, transform .2s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn:hover { opacity: .88; }
        .btn:active { transform: scale(0.98); }
        .btn:disabled { background: #1c2538; color: #3d4e68; cursor: not-allowed; }
        .err {
          margin-top: 14px; font-size: 12px; color: #ef4444;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
          padding: 10px 14px; border-radius: 10px;
        }
        .register-link {
          margin-top: 20px; text-align: center;
          font-size: 12px; color: #6b7fa0;
        }
        .register-link a { color: #3b82f6; text-decoration: none; }
      `}</style>
      <div className="page">
        <div className="card">
          <div className="icon">📊</div>
          <h1 className="title">Agent <em>Dashboard</em></h1>
          <p className="sub">Enter your username to access your dashboard.</p>
          <form onSubmit={handleLogin}>
            <label className="label">Your Username</label>
            <input
              className="input"
              placeholder="Enter your username"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              required
              autoCapitalize="none"
              autoCorrect="off"
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Open My Dashboard →'}
            </button>
          </form>
          {error && <p className="err">{error}</p>}
          <p className="register-link">
            New agent? <a href="/register">Register here →</a>
          </p>
        </div>
      </div>
    </>
  )

  // ── DASHBOARD SCREEN ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06080f; font-family: 'JetBrains Mono', monospace; }

        .page { min-height: 100vh; background: #06080f; padding-bottom: 40px; }

        /* header */
        .header {
          background: #0f1520; border-bottom: 1px solid #1c2538;
          padding: 16px; position: sticky; top: 0; z-index: 10;
        }
        .header-inner {
          max-width: 640px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .agent-name {
          font-family: 'Syne', sans-serif; font-size: 16px;
          font-weight: 800; color: #f1f5f9;
        }
        .agent-slug { font-size: 11px; color: #3b82f6; margin-top: 2px; }
        .logout-btn {
          font-size: 11px; color: #6b7fa0; background: none;
          border: 1px solid #1c2538; border-radius: 8px;
          padding: 6px 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
          -webkit-tap-highlight-color: transparent;
        }
        .logout-btn:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); }

        /* body */
        .body { max-width: 640px; margin: 0 auto; padding: 20px 16px 0; }

        /* stats grid */
        .stats-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px; margin-bottom: 20px;
        }
        .stat-card {
          background: #0f1520; border: 1px solid #1c2538;
          border-radius: 16px; padding: 18px 16px;
          position: relative; overflow: hidden;
        }
        .stat-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
        }
        .stat-num {
          font-family: 'Syne', sans-serif; font-size: 28px;
          font-weight: 800; color: #f1f5f9; line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label { font-size: 10px; color: #6b7fa0; letter-spacing: 1px; text-transform: uppercase; }

        /* action row */
        .action-row { display: flex; gap: 10px; margin-bottom: 24px; }
        .action-btn {
          flex: 1; padding: 13px 10px; border-radius: 12px;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          text-align: center; text-decoration: none; cursor: pointer;
          transition: opacity .2s, transform .2s; border: none;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          -webkit-tap-highlight-color: transparent;
        }
        .action-btn:active { transform: scale(0.97); }
        .btn-blue { background: #3b82f6; color: #fff; }
        .btn-outline {
          background: transparent; color: #6b7fa0;
          border: 1px solid #1c2538 !important;
        }
        .btn-outline:hover { border-color: #3b82f6 !important; color: #3b82f6; }

        /* section title */
        .section-title {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800;
          color: #f1f5f9; margin-bottom: 12px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .section-count {
          font-size: 11px; color: #3d4e68;
          font-family: 'JetBrains Mono', monospace; font-weight: 400;
        }

        /* property row */
        .prop-row {
          background: #0f1520; border: 1px solid #1c2538;
          border-radius: 14px; padding: 16px;
          margin-bottom: 8px; transition: border-color .2s;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .prop-row:hover { border-color: #253248; }
        .prop-info { flex: 1; min-width: 0; }
        .prop-title {
          font-family: 'Syne', sans-serif; font-size: 14px;
          font-weight: 700; color: #f1f5f9;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .prop-meta { font-size: 11px; color: #6b7fa0; line-height: 1.6; }
        .prop-right { text-align: right; flex-shrink: 0; }
        .prop-price {
          font-family: 'Syne', sans-serif; font-size: 15px;
          font-weight: 800; color: #10b981; margin-bottom: 6px;
        }
        .delete-btn {
          font-size: 10px; color: #3d4e68; background: none;
          border: 1px solid #1c2538; border-radius: 6px;
          padding: 4px 8px; cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          transition: all .2s; -webkit-tap-highlight-color: transparent;
        }
        .delete-btn:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); }

        .status-dot {
          display: inline-block; width: 6px; height: 6px;
          border-radius: 50%; margin-right: 5px; vertical-align: middle;
        }

        /* empty */
        .empty {
          text-align: center; padding: 40px 24px;
          background: #0f1520; border: 1px solid #1c2538;
          border-radius: 16px;
        }
        .empty-icon { font-size: 32px; margin-bottom: 12px; }
        .empty-title {
          font-family: 'Syne', sans-serif; font-size: 15px;
          font-weight: 700; color: #f1f5f9; margin-bottom: 6px;
        }
        .empty-sub { font-size: 12px; color: #6b7fa0; line-height: 1.6; }
        .empty-link {
          display: inline-block; margin-top: 16px;
          background: #3b82f6; color: #fff;
          padding: 10px 20px; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 12px;
          font-weight: 700; text-decoration: none;
        }

        /* share box */
        .share-box {
          background: rgba(59,130,246,0.07);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 14px; padding: 16px;
          margin-bottom: 24px;
          display: flex; align-items: center; gap: 12px;
        }
        .share-link {
          flex: 1; font-size: 12px; color: #3b82f6;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .copy-btn {
          background: #3b82f6; color: #fff; border: none;
          border-radius: 8px; padding: 8px 14px;
          font-family: 'Syne', sans-serif; font-size: 11px;
          font-weight: 700; cursor: pointer; flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .copy-btn:active { opacity: .8; }

        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .stat-num { font-size: 24px; }
        }
      `}</style>

      <div className="page">

        {/* Header */}
        <div className="header">
          <div className="header-inner">
            <div>
              <div className="agent-name">👋 {agent.name}</div>
              <div className="agent-slug">kinetos.in/agent/{agent.slug}</div>
            </div>
            <button className="logout-btn" onClick={() => { setLoggedIn(false); setAgent(null); setSlug('') }}>
              Log out
            </button>
          </div>
        </div>

        <div className="body">

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card" style={{ position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,#3b82f6,transparent)',padding:0,margin:0,border:'none',borderRadius:0 }}></div>
              <div className="stat-num">{totalProps}</div>
              <div className="stat-label">Total listings</div>
            </div>
            <div className="stat-card">
              <div className="stat-card" style={{ position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,#10b981,transparent)',padding:0,margin:0,border:'none',borderRadius:0 }}></div>
              <div className="stat-num">{readyCount}</div>
              <div className="stat-label">Ready to move</div>
            </div>
            <div className="stat-card">
              <div className="stat-card" style={{ position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,#f59e0b,transparent)',padding:0,margin:0,border:'none',borderRadius:0 }}></div>
              <div className="stat-num">{underCount}</div>
              <div className="stat-label">Under construction</div>
            </div>
            <div className="stat-card">
              <div className="stat-card" style={{ position:'absolute',top:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,#8b5cf6,transparent)',padding:0,margin:0,border:'none',borderRadius:0 }}></div>
              <div className="stat-num">₹{avgPrice}L</div>
              <div className="stat-label">Avg price</div>
            </div>
          </div>

          {/* Share box */}
          <div className="share-box">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#3d4e68', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
                Your Links
              </div>
              <div className="share-link">
                📋 kinetos.in/agent/{agent.slug}
              </div>
              <div style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '6px' }}>
                🤖 kinetos.in/chat/{agent.slug}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                className="copy-btn"
                onClick={copyLink}
              >
                Copy Portfolio
              </button>
              <button
                className="copy-btn"
                style={{ background: '#8b5cf6' }}
                onClick={() => {
                  const link = `${window.location.origin}/chat/${agent.slug}`
                  navigator.clipboard.writeText(link)
                  alert('✅ AI Chat link copied! Share it with clients.')
                }}
              >
                Copy Chat
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-row">
            <a href="/upload" className="action-btn btn-blue">+ Add Property</a>
            <a href={`/agent/${agent.slug}`} className="action-btn btn-outline" target="_blank" rel="noreferrer">View Portfolio ↗</a>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER?.replace('+', '')}?text=${encodeURIComponent(agent.slug + ': ')}`}
            target="_blank"
            rel="noreferrer"
            className="action-btn btn-outline"
            style={{ fontSize: '11px' }}
          >
            Share WhatsApp Link
          </a>
          {/* Property list */}
          <div className="section-title">
            My Listings
            <span className="section-count">{totalProps} properties</span>
          </div>

          {properties.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🏚️</div>
              <div className="empty-title">No properties yet</div>
              <p className="empty-sub">Add your first listing and it will appear here instantly.</p>
              <a href="/upload" className="empty-link">+ Add First Property</a>
            </div>
          ) : (
            properties.map(p => (
              <div key={p.id} className="prop-row">
                <div className="prop-info">
                  <div className="prop-title">{p.title}</div>
                  <div className="prop-meta">
                    📍 {p.area} · {p.bhk} BHK<br />
                    <span className="status-dot" style={{
                      background: p.status === 'Ready to move' ? '#10b981' :
                        p.status === 'Under construction' ? '#f59e0b' : '#8b5cf6'
                    }}></span>
                    {p.status}
                  </div>
                </div>
                <div className="prop-right">
                  <div className="prop-price">₹{p.price_lakhs}L</div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                  >
                    {deleting === p.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </>
  )
}