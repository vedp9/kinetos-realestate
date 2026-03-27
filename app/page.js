export default function Home() {
  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', background: '#06080f', minHeight: '100vh' }}>
      <h1 style={{ color: '#f1f5f9', fontSize: '24px' }}>🏠 Kinetos — Real Estate AI</h1>
      <p style={{ color: '#10b981', marginTop: '16px', fontSize: '14px' }}>
        ✅ App is running!
      </p>
      <a href="/register" style={{ display: 'inline-block', marginTop: '24px', color: '#3b82f6', fontSize: '13px' }}>
        → Go to Agent Registration
      </a>
    </main>
  )
}