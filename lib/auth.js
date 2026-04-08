// save agent session to localStorage forever
export function saveSession(agent) {
  localStorage.setItem('kinetos_session', JSON.stringify({
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    phone: agent.phone,
    loggedInAt: Date.now(),
  }))
  localStorage.setItem('kinetos_agent_name', agent.name)
  localStorage.setItem('kinetos_agent_slug', agent.slug)
}

// get current logged in agent
export function getSession() {
  try {
    const raw = localStorage.getItem('kinetos_session')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// clear session — logout
export function clearSession() {
  localStorage.removeItem('kinetos_session')
  localStorage.removeItem('kinetos_agent_name')
  localStorage.removeItem('kinetos_agent_slug')
}

// check if agent is logged in
export function isLoggedIn() {
  return getSession() !== null
}