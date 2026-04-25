import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { Home, Heart, Bell, User, LogOut } from 'lucide-react'
import ProfileCompletionBanner from './ProfileCompletionBanner'
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import IULogo from './IULogo'

export default function Layout() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', user.uid),
      where('read', '==', false)
    )
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size))
    return unsub
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-xs font-medium ${
      isActive
        ? 'text-crimson-800 bg-crimson-50'
        : 'text-gray-500 hover:text-crimson-700 hover:bg-crimson-50/50'
    }`

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-crimson-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IULogo className="w-8 h-8 text-crimson-800" />
            <span className="font-display text-xl font-bold text-crimson-900">RoomieFind</span>
            <span className="text-xs font-medium text-crimson-400 bg-crimson-50 px-2 py-0.5 rounded-full ml-1">IU</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/browse" className={navLinkClass}>
              <Home size={18} />
              Browse
            </NavLink>
            <NavLink to="/interests" className={navLinkClass}>
              <Heart size={18} />
              Interests
            </NavLink>
            <NavLink to="/notifications" className={navLinkClass}>
              <div className="relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-crimson-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              Alerts
            </NavLink>
            <NavLink to="/profile/me" className={navLinkClass}>
              {profile?.photoURL ? (
                <img src={profile.photoURL} className="w-5 h-5 rounded-full object-cover" alt="" />
              ) : (
                <User size={18} />
              )}
              Profile
            </NavLink>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-crimson-700 transition-colors px-3 py-2 rounded-xl hover:bg-crimson-50"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Profile completion banner */}
      <ProfileCompletionBanner />

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-crimson-100 flex items-center justify-around px-2 py-2 z-50">
        <NavLink to="/browse" className={navLinkClass}>
          <Home size={20} />
          Browse
        </NavLink>
        <NavLink to="/interests" className={navLinkClass}>
          <Heart size={20} />
          Interests
        </NavLink>
        <NavLink to="/notifications" className={navLinkClass}>
          <div className="relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-crimson-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          Alerts
        </NavLink>
        <NavLink to="/profile/me" className={navLinkClass}>
          <User size={20} />
          Profile
        </NavLink>
      </nav>
    </div>
  )
}
