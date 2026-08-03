import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { login, signup, guestLogin } from '../api'

export default function Auth() {
  const [mode,    setMode]    = useState('login') // login | signup
  const [email,   setEmail]   = useState('')
  const [username,setUsername]= useState('')
  const [password,setPassword]= useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const { loginWithToken } = useAuth()
  const navigate           = useNavigate()

  

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await login({ email, password })
      } else {
        res = await signup({ email, username, password })
      }
      loginWithToken(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await guestLogin()
      loginWithToken(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError('Could not create guest session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          Data<span style={styles.logoAccent}>Lens</span>
        </div>
        <p style={styles.tagline}>
          Upload your data. Ask anything.
        </p>

        {/* Mode toggle */}
        <div style={styles.toggleRow}>
          <button
            style={mode === 'login' ? styles.toggleActive : styles.toggleInactive}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            style={mode === 'signup' ? styles.toggleActive : styles.toggleInactive}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        {mode === 'signup' && (
          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        )}
        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={loading ? styles.btnDisabled : styles.btnPrimary}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Guest button */}
        <button
          style={styles.btnGuest}
          onClick={handleGuest}
          disabled={loading}
        >
          Continue as guest
        </button>
        <p style={styles.guestNote}>
          No account needed · Session lasts 7 days · Data deleted after expiry
        </p>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight:       '100vh',
    background:      'var(--color-bg-page)',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         '1rem',
    fontFamily:      'system-ui, sans-serif',
  },
  card: {
    background:    'var(--color-bg-card)',
    border:        '1px solid var(--color-border)',
    borderRadius:  'var(--radius-xl)',
    padding:       '2rem',
    width:         '100%',
    maxWidth:      '400px',
    boxShadow:     'var(--shadow-md)',
  },
  logo: {
    fontSize:    '24px',
    fontWeight:  '600',
    color:       'var(--color-text)',
    textAlign:   'center',
    marginBottom:'4px',
  },
  logoAccent: {
    color: 'var(--color-primary)',
  },
  tagline: {
    textAlign:    'center',
    color:        'var(--color-text-muted)',
    fontSize:     '13px',
    marginBottom: '1.5rem',
  },
  toggleRow: {
    display:       'flex',
    background:    'var(--color-bg-muted)',
    borderRadius:  'var(--radius-md)',
    padding:       '4px',
    marginBottom:  '1rem',
    gap:           '4px',
  },
  toggleActive: {
    flex:          1,
    padding:       '8px',
    border:        'none',
    borderRadius:  'var(--radius-sm)',
    background:    'var(--color-bg-card)',
    color:         'var(--color-primary-dark)',
    fontWeight:    '500',
    fontSize:      '13px',
    cursor:        'pointer',
    boxShadow:     'var(--shadow-sm)',
  },
  toggleInactive: {
    flex:          1,
    padding:       '8px',
    border:        'none',
    borderRadius:  'var(--radius-sm)',
    background:    'transparent',
    color:         'var(--color-text-muted)',
    fontSize:      '13px',
    cursor:        'pointer',
  },
  input: {
    width:         '100%',
    padding:       '10px 12px',
    border:        '1px solid var(--color-border)',
    borderRadius:  'var(--radius-md)',
    fontSize:      '13px',
    color:         'var(--color-text)',
    background:    'var(--color-bg-card)',
    marginBottom:  '10px',
    outline:       'none',
    boxSizing:     'border-box',
  },
  btnPrimary: {
    width:         '100%',
    padding:       '10px',
    background:    'var(--color-primary)',
    color:         '#fff',
    border:        'none',
    borderRadius:  'var(--radius-md)',
    fontSize:      '14px',
    fontWeight:    '500',
    cursor:        'pointer',
    marginTop:     '4px',
  },
  btnDisabled: {
    width:         '100%',
    padding:       '10px',
    background:    'var(--color-border)',
    color:         'var(--color-text-muted)',
    border:        'none',
    borderRadius:  'var(--radius-md)',
    fontSize:      '14px',
    cursor:        'not-allowed',
    marginTop:     '4px',
  },
  divider: {
    display:       'flex',
    alignItems:    'center',
    gap:           '10px',
    margin:        '1.25rem 0',
  },
  dividerLine: {
    flex:          1,
    height:        '1px',
    background:    'var(--color-border)',
  },
  dividerText: {
    fontSize:      '12px',
    color:         'var(--color-text-hint)',
  },
  btnGuest: {
    width:         '100%',
    padding:       '10px',
    background:    'var(--color-accent-light)',
    color:         'var(--color-accent-dark)',
    border:        '1px solid var(--color-accent)',
    borderRadius:  'var(--radius-md)',
    fontSize:      '14px',
    fontWeight:    '500',
    cursor:        'pointer',
  },
  guestNote: {
    textAlign:     'center',
    fontSize:      '11px',
    color:         'var(--color-text-hint)',
    marginTop:     '8px',
  },
  error: {
    color:         'var(--color-danger)',
    fontSize:      '12px',
    marginBottom:  '8px',
    textAlign:     'center',
  },
}