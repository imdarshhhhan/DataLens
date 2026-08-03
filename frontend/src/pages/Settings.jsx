import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import api from '../api'

export default function Settings() {
const { user, logout, loginWithToken } = useAuth()
  const navigate         = useNavigate()

  const [username,    setUsername]    = useState(user?.username || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [groqKey,     setGroqKey]     = useState('')
  const [msg,         setMsg]         = useState('')
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  const showMsg = (m, isError = false) => {
    if (isError) setError(m)
    else setMsg(m)
    setTimeout(() => { setMsg(''); setError('') }, 3000)
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your account and all your files.')) return
    try {
      logout()
      navigate('/auth')
    } catch (err) {
      showMsg('Failed to delete account', true)
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth:'560px' }}>

        <div style={{ marginBottom:'2rem' }}>
          <h1 style={{ fontSize:'22px', fontWeight:'700', color:'#1A1A2E' }}>Settings</h1>
          <p style={{ fontSize:'13px', color:'#6B8BAA', marginTop:'4px' }}>
            Manage your account and preferences
          </p>
        </div>

        {msg   && <div style={styles.successMsg}>{msg}</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}

        {/* Profile section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.avatar}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={styles.sectionTitle}>Profile</div>
              <div style={styles.sectionSub}>{user?.email || 'Guest account'}</div>
            </div>
          </div>

          {user?.is_guest ? (
            <div style={styles.guestNotice}>
              <p style={{ fontSize:'13px', color:'#C4661A', marginBottom:'8px', fontWeight:'500' }}>
                You are using a guest account
              </p>
              <p style={{ fontSize:'12px', color:'#6B8BAA', marginBottom:'12px' }}>
                Sign up to save your data permanently and access all features.
              </p>
              <button
                onClick={() => navigate('/auth')}
                style={styles.btnPrimary}
              >
                Sign up now
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div>
                <label style={styles.label}>Username</label>
                <input
                  style={styles.input}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your username"
                />
              </div>
              <button
                style={loading ? styles.btnDisabled : styles.btnPrimary}
                disabled={loading}

                onClick={async () => {
                  setLoading(true)
                  try {
                    await api.patch('/auth/profile', { username })
                    // Refresh user data in auth context
                    const res = await api.get('/auth/me')
                    loginWithToken(localStorage.getItem('token'), res.data)
                    showMsg('Username updated successfully')
                  } catch {
                    showMsg('Failed to update username', true)
                  } finally {
                    setLoading(false)
                  }
                }}

              >
                Save changes
              </button>
            </div>
          )}
        </div>

        {/* Password section */}
        {!user?.is_guest && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Change password</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'12px' }}>
              <div>
                <label style={styles.label}>Current password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label style={styles.label}>New password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <button
                style={loading ? styles.btnDisabled : styles.btnPrimary}
                disabled={loading}
                onClick={async () => {
                  if (!oldPassword || !newPassword) {
                    showMsg('Please fill in both fields', true)
                    return
                  }
                  setLoading(true)
                  try {
                    await api.patch('/auth/password', {
                      old_password: oldPassword,
                      new_password: newPassword
                    })
                    showMsg('Password changed successfully')
                    setOldPassword('')
                    setNewPassword('')
                  } catch {
                    showMsg('Incorrect current password', true)
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                Update password
              </button>
            </div>
          </div>
        )}

        {/* Account info */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Account info</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'12px' }}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Account type</span>
              <span style={{ ...styles.infoBadge, background: user?.is_guest ? '#FFF0E5' : '#E6F6EE', color: user?.is_guest ? '#C4661A' : '#1A7A47' }}>
                {user?.is_guest ? 'Guest' : 'Registered'}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Username</span>
              <span style={styles.infoVal}>{user?.username}</span>
            </div>
            {user?.is_guest && user?.expires_at && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Session expires</span>
                <span style={{ ...styles.infoVal, color:'#C4661A' }}>
                  {new Date(user.expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ ...styles.section, border:'1px solid #f5c6c2' }}>
          <div style={{ ...styles.sectionTitle, color:'#C0392B' }}>Danger zone</div>
          <p style={{ fontSize:'13px', color:'#6B8BAA', margin:'10px 0 14px' }}>
            {user?.is_guest
              ? 'End your guest session. All data will be permanently deleted.'
              : 'Permanently delete your account and all uploaded files.'
            }
          </p>
          <button
            style={styles.btnDanger}
            onClick={handleDeleteAccount}
          >
            {user?.is_guest ? 'End guest session' : 'Delete account'}
          </button>
        </div>

      </div>
    </Layout>
  )
}

const styles = {
  section: {
    background:   '#fff',
    border:       '1px solid #E2EEF9',
    borderRadius: '12px',
    padding:      '1.25rem',
    marginBottom: '1rem',
  },
  sectionHeader: {
    display:      'flex',
    alignItems:   'center',
    gap:          '12px',
    marginBottom: '1rem',
  },
  avatar: {
    width:          '44px',
    height:         '44px',
    borderRadius:   '50%',
    background:     '#E2EEF9',
    color:          '#1A6FA8',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '18px',
    fontWeight:     '600',
    flexShrink:     0,
  },
  sectionTitle: {
    fontSize:   '15px',
    fontWeight: '600',
    color:      '#1A1A2E',
  },
  sectionSub: {
    fontSize:  '12px',
    color:     '#6B8BAA',
    marginTop: '2px',
  },
  label: {
    display:      'block',
    fontSize:     '12px',
    fontWeight:   '500',
    color:        '#6B8BAA',
    marginBottom: '5px',
  },
  input: {
    width:        '100%',
    padding:      '9px 12px',
    border:       '1px solid #E2EEF9',
    borderRadius: '8px',
    fontSize:     '13px',
    color:        '#1A1A2E',
    outline:      'none',
    background:   '#F7FBFF',
    boxSizing:    'border-box',
  },
  btnPrimary: {
    padding:      '9px 20px',
    background:   '#5BAADC',
    color:        '#fff',
    border:       'none',
    borderRadius: '8px',
    fontSize:     '13px',
    fontWeight:   '500',
    cursor:       'pointer',
  },
  btnDisabled: {
    padding:      '9px 20px',
    background:   '#E2EEF9',
    color:        '#6B8BAA',
    border:       'none',
    borderRadius: '8px',
    fontSize:     '13px',
    cursor:       'not-allowed',
  },
  btnDanger: {
    padding:      '9px 20px',
    background:   '#FDECEA',
    color:        '#C0392B',
    border:       '1px solid #f5c6c2',
    borderRadius: '8px',
    fontSize:     '13px',
    fontWeight:   '500',
    cursor:       'pointer',
  },
  infoRow: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        '8px 0',
    borderBottom:   '1px solid #F7FBFF',
  },
  infoLabel: {
    fontSize: '13px',
    color:    '#6B8BAA',
  },
  infoVal: {
    fontSize:   '13px',
    fontWeight: '500',
    color:      '#1A1A2E',
  },
  infoBadge: {
    fontSize:     '11px',
    fontWeight:   '600',
    padding:      '2px 10px',
    borderRadius: '20px',
  },
  guestNotice: {
    background:   '#FFF0E5',
    border:       '1px solid #FAD4B0',
    borderRadius: '10px',
    padding:      '1rem',
  },
  successMsg: {
    background:   '#E6F6EE',
    border:       '1px solid #A8DFC0',
    borderRadius: '8px',
    padding:      '10px 14px',
    fontSize:     '13px',
    color:        '#1A7A47',
    marginBottom: '1rem',
  },
  errorMsg: {
    background:   '#FDECEA',
    border:       '1px solid #f5c6c2',
    borderRadius: '8px',
    padding:      '10px 14px',
    fontSize:     '13px',
    color:        '#C0392B',
    marginBottom: '1rem',
  },
}