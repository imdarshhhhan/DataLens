import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function GuestBanner() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (!user?.is_guest || dismissed) return null

  const daysLeft = Math.ceil(
    (new Date(user.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
  )

  const color = daysLeft <= 1 ? '#C0392B' : daysLeft <= 3 ? '#C4661A' : '#C4661A'
  const bg    = daysLeft <= 1 ? '#FDECEA' : '#FFF0E5'
  const border= daysLeft <= 1 ? '#f5c6c2' : '#FAD4B0'

  return (
    <div
      data-guest-banner
      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px', padding:'10px 14px', background:bg, border:`1px solid ${border}`, borderRadius:'10px', marginBottom:'1rem', fontSize:'13px', color }}
    >
      <span>
        ⏱ Guest session · {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
        · Your data will be deleted when this expires.
      </span>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <button
          onClick={() => navigate('/auth')}
          style={{ padding:'5px 14px', background:color, color:'#fff', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:'500', cursor:'pointer' }}
        >
          Sign up to save
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{ background:'transparent', border:'none', fontSize:'18px', cursor:'pointer', color, lineHeight:1 }}
        >
          ×
        </button>
      </div>
    </div>
  )
}