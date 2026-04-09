import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const studentNav = [
  { to: '/dashboard',   icon: '⊞', label: 'Dashboard' },
  { to: '/modules',     icon: '◫', label: 'Modules' },
  { to: '/discussions', icon: '◉', label: 'Discussions' },
  { to: '/assignments', icon: '▤', label: 'Assignments' },
]

const instructorNav = [
  { to: '/dashboard',    icon: '⊞', label: 'Dashboard' },
  { to: '/modules',      icon: '◫', label: 'Modules' },
  { to: '/discussions',  icon: '◉', label: 'Discussions' },
  { to: '/students',     icon: '◎', label: 'Students' },
  { to: '/quiz-creator', icon: '✎', label: 'Quiz Creator' },
]

export default function Layout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  // Pick the right nav based on the user's role
  const navItems = profile?.role === 'instructor' ? instructorNav : studentNav

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoMark}>E</div>
          <span style={styles.logoText}>EduEase</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>
              {profile?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>
                {profile?.name || 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {profile?.role}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  shell: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: {
    width: '220px', background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0, padding: '0 12px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '20px 8px 16px',
    borderBottom: '1px solid var(--border)', marginBottom: 12,
  },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--blue)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: 16,
  },
  logoText: { fontWeight: 600, fontSize: 16 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 10px', borderRadius: 8,
    color: 'var(--text-muted)', fontSize: 14,
    fontWeight: 500, textDecoration: 'none',
    transition: 'background .15s, color .15s',
  },
  navLinkActive: { background: 'var(--blue-light)', color: 'var(--blue)' },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  sidebarBottom: {
    borderTop: '1px solid var(--border)',
    padding: '12px 0', display: 'flex',
    flexDirection: 'column', gap: 8,
  },
  userChip: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--purple-light)', color: 'var(--purple)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: 14, flexShrink: 0,
  },
  logoutBtn: {
    background: 'none', color: 'var(--text-muted)',
    fontSize: 13, padding: '6px 10px',
    borderRadius: 6, textAlign: 'left',
    cursor: 'pointer', border: 'none',
  },
  main: { flex: 1, overflow: 'auto', padding: '28px 32px' },
}