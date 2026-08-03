import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Landing   from './pages/Landing'
import Auth      from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import History   from './pages/History'
import Settings  from './pages/Settings'
import Export    from './pages/Export'
import NotFound from './pages/NotFound'
import SharedReport from './pages/SharedReport'


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding:'2rem', textAlign:'center' }}>Loading...</div>
  if (!user)   return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Landing />} />
      <Route path="/auth"  element={<Auth />} />

      <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/workspace/:fileId" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
      <Route path="/history"           element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/settings"          element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/export/:fileId"    element={<ProtectedRoute><Export /></ProtectedRoute>} />
      <Route path="/report/:reportId" element={<SharedReport />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}