import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { calculateMatch } from '../utils/matchScore'
import ProfileCard from '../components/ProfileCard'
import { IU_CAMPUSES, DIET_OPTIONS, ROOM_TYPES, RENT_RANGES } from '../utils/constants'
import { SlidersHorizontal, Search, X } from 'lucide-react'

export default function Browse() {
  const { user, profile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('match') // 'match' | 'newest'
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    campus: '',
    diet: '',
    roomType: '',
    rentRange: '',
  })

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        const fetched = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.id !== user?.uid && !u.isMatched)
        setUsers(fetched)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [user])

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const clearFilters = () => setFilters({ campus: '', diet: '', roomType: '', rentRange: '' })
  const hasFilters = Object.values(filters).some(Boolean)

  const processed = users
    .map(u => ({ ...u, matchScore: calculateMatch(profile, u) }))
    .filter(u => {
      if (search && !u.displayName?.toLowerCase().includes(search.toLowerCase()) &&
          !u.program?.toLowerCase().includes(search.toLowerCase()) &&
          !u.campus?.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.campus && u.campus !== filters.campus) return false
      if (filters.diet && u.diet !== filters.diet) return false
      if (filters.roomType && u.roomType !== filters.roomType) return false
      if (filters.rentRange && u.rentRange !== filters.rentRange) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore
      return 0 // newest already sorted from Firestore
    })

  return (
    <div>
      {/* Header */}
      <div className="mb-6 fade-in">
        <h1 className="font-display text-3xl font-bold text-crimson-900">Find Roommates</h1>
        <p className="text-gray-500 mt-1">Discover compatible roommates across IU campuses</p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 fade-in-delay-1">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pl-10"
            placeholder="Search by name, program, campus..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            className="input-field w-auto"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="match">Best Match</option>
            <option value="newest">Newest First</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
              hasFilters || showFilters
                ? 'bg-crimson-800 text-white border-crimson-800'
                : 'bg-white text-gray-700 border-gray-200 hover:border-crimson-300'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters{hasFilters ? ` (${Object.values(filters).filter(Boolean).length})` : ''}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-4 mb-4 fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="label text-xs">Campus</label>
              <select className="input-field text-sm" value={filters.campus} onChange={e => setFilter('campus', e.target.value)}>
                <option value="">All</option>
                {IU_CAMPUSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Diet</label>
              <select className="input-field text-sm" value={filters.diet} onChange={e => setFilter('diet', e.target.value)}>
                <option value="">All</option>
                {DIET_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Room Type</label>
              <select className="input-field text-sm" value={filters.roomType} onChange={e => setFilter('roomType', e.target.value)}>
                <option value="">All</option>
                {ROOM_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Rent Range</label>
              <select className="input-field text-sm" value={filters.rentRange} onChange={e => setFilter('rentRange', e.target.value)}>
                <option value="">All</option>
                {RENT_RANGES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-crimson-700 font-medium mt-3 hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-crimson-100 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : processed.length === 0 ? (
        <div className="text-center py-16 fade-in">
          <p className="text-5xl mb-4">🏠</p>
          <p className="text-gray-500 font-medium">No roommates found matching your criteria</p>
          <button onClick={clearFilters} className="text-crimson-700 font-semibold mt-2 hover:underline text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4 fade-in-delay-2">
            {processed.length} roommate{processed.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 fade-in-delay-2">
            {processed.map(u => (
              <ProfileCard key={u.id} profile={u} matchScore={u.matchScore} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
