import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Register from './pages/Register'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Browse from './pages/Browse'
import ProfileView from './pages/ProfileView'
import MyProfile from './pages/MyProfile'
import Interests from './pages/Interests'
import Notifications from './pages/Notifications'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-crimson-200 border-t-crimson-700 rounded-full animate-spin" />
        <p className="text-crimson-700 font-medium">Loading...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/browse" replace />} />
        <Route path="browse" element={<Browse />} />
        <Route path="profile/:id" element={<ProfileView />} />
        <Route path="profile/me" element={<MyProfile />} />
        <Route path="interests" element={<Interests />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="onboarding" element={<Onboarding />} />
      </Route>
    </Routes>
  )
}
