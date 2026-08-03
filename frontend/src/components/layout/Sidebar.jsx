import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'Home',     path: '/dashboard' },
  { label: 'History',  path: '/history'   },
  { label: 'Settings', path: '/settings'  },
]

export default function Sidebar({onClose}) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { logout, user } = useAuth()

  return (
  <div style={styles.sidebar} className="sidebar-inner">
    {onClose && (
      <button
        onClick={onClose}
        style={{ position:'absolute', top:'12px', right:'12px', background:'transparent', border:'none', fontSize:'20px', cursor:'pointer', color:'#6B8BAA' }}
      >
        ×
      </button>
    )}


      <div style={styles.logo}>
        Data<span style={styles.logoAccent}>Lens</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map(item => (
          <button
            key={item.path}
            style={location.pathname === item.path
              ? styles.navItemActive
              : styles.navItem
            }
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div style={styles.bottom}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={styles.userName}>{user?.username}</div>
            <div style={styles.userRole}>
              {user?.is_guest ? 'Guest' : 'Member'}
            </div>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width:          '200px',
    height:         '100%',
    minHeight:      '100%',
    background:     '#F7FBFF',
    borderRight:    '1px solid var(--color-border)',
    display:        'flex',
    flexDirection:  'column',
    padding:        '1.25rem 0',
  },

  
  logo: {
    fontSize:     '18px',
    fontWeight:   '600',
    color:        'var(--color-text)',
    padding:      '0 1.25rem 1.25rem',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: '8px',
  },
  logoAccent: { color: 'var(--color-primary)' },
  nav: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    padding:       '0 8px',
    flex:          1,
  },
  navItem: {
    display:      'block',
    width:        '100%',
    padding:      '9px 12px',
    border:       'none',
    borderRadius: 'var(--radius-md)',
    background:   'transparent',
    color:        'var(--color-text-muted)',
    fontSize:     '13px',
    textAlign:    'left',
    cursor:       'pointer',
  },
  navItemActive: {
    display:      'block',
    width:        '100%',
    padding:      '9px 12px',
    border:       'none',
    borderRadius: 'var(--radius-md)',
    background:   'var(--color-primary-light)',
    color:        'var(--color-primary-dark)',
    fontSize:     '13px',
    fontWeight:   '500',
    textAlign:    'left',
    cursor:       'pointer',
    borderLeft:   '2px solid var(--color-primary)',
  },
  bottom: {
    padding:      '1rem 1.25rem 0',
    borderTop:    '1px solid var(--color-border)',
    marginTop:    'auto',
  },
  userInfo: {
    display:       'flex',
    alignItems:    'center',
    gap:           '8px',
    marginBottom:  '10px',
  },
  avatar: {
    width:          '30px',
    height:         '30px',
    borderRadius:   '50%',
    background:     'var(--color-primary-light)',
    color:          'var(--color-primary-dark)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '12px',
    fontWeight:     '600',
    flexShrink:     0,
  },
  userName: {
    fontSize:   '13px',
    fontWeight: '500',
    color:      'var(--color-text)',
  },
  userRole: {
    fontSize: '11px',
    color:    'var(--color-text-muted)',
  },
  logoutBtn: {
    width:        '100%',
    padding:      '7px',
    border:       '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background:   'transparent',
    color:        'var(--color-text-muted)',
    fontSize:     '12px',
    cursor:       'pointer',
  },
}