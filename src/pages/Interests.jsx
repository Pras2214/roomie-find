import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Heart, Send, User, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

function InterestCard({ item, type, onRemove }) {
  const navigate = useNavigate()
  const other = type === 'sent' ? { id: item.toUserId, name: item.toName, photo: item.toPhoto }
    : { id: item.fromUserId, name: item.fromName, photo: item.fromPhoto }

  return (
    <div className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className="w-14 h-14 rounded-full overflow-hidden bg-crimson-100 cursor-pointer shrink-0 flex items-center justify-center"
        onClick={() => navigate(`/profile/${other.id}`)}
      >
        {other.photo ? (
          <img src={other.photo} alt={other.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display font-bold text-xl text-crimson-400">
            {other.name?.[0]?.toUpperCase() || '?'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{other.name || 'Unknown User'}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {type === 'sent' ? 'You showed interest' : 'Showed interest in you'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate(`/profile/${other.id}`)}
          className="text-sm font-medium text-crimson-700 bg-crimson-50 px-3 py-1.5 rounded-lg hover:bg-crimson-100 transition-colors"
        >
          View
        </button>
        {type === 'sent' && (
          <button onClick={() => onRemove(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Interests() {
  const { user } = useAuth()
  const [tab, setTab] = useState('received')
  const [sent, setSent] = useState([])
  const [received, setReceived] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchInterests = async () => {
    setLoading(true)
    try {
      // Sent
      const sentSnap = await getDocs(query(
        collection(db, 'interests'), where('fromUserId', '==', user.uid)
      ))
      const sentData = []
      for (const d of sentSnap.docs) {
        const item = { id: d.id, ...d.data() }
        // Fetch recipient name
        const userSnap = await import('firebase/firestore').then(({ getDoc, doc: fDoc }) =>
          getDoc(fDoc(db, 'users', item.toUserId))
        )
        if (userSnap.exists()) {
          item.toName = userSnap.data().displayName
          item.toPhoto = userSnap.data().photoURL || ''
        }
        sentData.push(item)
      }
      setSent(sentData)

      // Received
      const recSnap = await getDocs(query(
        collection(db, 'interests'), where('toUserId', '==', user.uid)
      ))
      setReceived(recSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInterests() }, [user])

  const handleRemove = async (interestId) => {
    await deleteDoc(doc(db, 'interests', interestId))
    toast.success('Interest withdrawn')
    fetchInterests()
  }

  const current = tab === 'sent' ? sent : received

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <h1 className="section-title mb-2">Interests</h1>
      <p className="text-gray-500 mb-6">Track who you've connected with</p>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl border border-gray-200 p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('received')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'received' ? 'bg-crimson-800 text-white shadow-sm' : 'text-gray-600 hover:text-crimson-700'
          }`}
        >
          <Heart size={15} /> Received {received.length > 0 && `(${received.length})`}
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'sent' ? 'bg-crimson-800 text-white shadow-sm' : 'text-gray-600 hover:text-crimson-700'
          }`}
        >
          <Send size={15} /> Sent {sent.length > 0 && `(${sent.length})`}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card p-4 flex items-center gap-4 animate-pulse">
              <div className="w-14 h-14 bg-crimson-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : current.length === 0 ? (
        <div className="text-center py-16">
          {tab === 'received' ? (
            <>
              <Heart size={48} className="mx-auto text-crimson-200 mb-4" />
              <p className="text-gray-500 font-medium">No one has shown interest yet</p>
              <p className="text-gray-400 text-sm mt-1">Complete your profile to attract more matches</p>
            </>
          ) : (
            <>
              <Send size={48} className="mx-auto text-crimson-200 mb-4" />
              <p className="text-gray-500 font-medium">You haven't shown interest in anyone yet</p>
              <p className="text-gray-400 text-sm mt-1">Browse profiles to find your ideal roommate</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {current.map(item => (
            <InterestCard key={item.id} item={item} type={tab} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
