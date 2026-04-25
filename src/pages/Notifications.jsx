import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = async () => {
    const q = query(
      collection(db, 'notifications'),
      where('toUserId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifs()
  }, [user])

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.read)
    for (const n of unread) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true })
    }
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClick = async (notif) => {
    if (!notif.read) {
      await updateDoc(doc(db, 'notifications', notif.id), { read: true })
    }
    if (notif.matchUserId) navigate(`/profile/${notif.matchUserId}`)
  }

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-crimson-600 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-crimson-700 transition-colors">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="card p-4 flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-crimson-100 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={48} className="mx-auto text-crimson-200 mb-4" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">Mutual matches and updates will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${
                !n.read ? 'border-crimson-200 bg-crimson-50/30' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-crimson-100 overflow-hidden shrink-0 flex items-center justify-center">
                {n.matchUserPhoto ? (
                  <img src={n.matchUserPhoto} alt={n.matchUserName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg text-crimson-400">
                    {n.matchUserName?.[0]?.toUpperCase() || '🎉'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) || 'Recently'}
                </p>
              </div>
              {!n.read && (
                <div className="w-2.5 h-2.5 bg-crimson-600 rounded-full shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
