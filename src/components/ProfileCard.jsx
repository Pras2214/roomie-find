import { useNavigate } from 'react-router-dom'
import { MapPin, GraduationCap, Eye } from 'lucide-react'

function MatchBadge({ score }) {
  const cls = score >= 75 ? 'match-high' : score >= 50 ? 'match-med' : 'match-low'
  return (
    <div className={`${cls} text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1`}>
      <span className="text-xs opacity-80">MATCH</span>
      <span>{score}%</span>
    </div>
  )
}

export default function ProfileCard({ profile, matchScore }) {
  const navigate = useNavigate()

  const tags = [
    profile.roomType,
    profile.diet,
    profile.sleepSchedule?.split(' ')[0],
  ].filter(Boolean)

  return (
    <div
      className="profile-card card overflow-hidden cursor-pointer"
      onClick={() => navigate(`/profile/${profile.id}`)}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-crimson-100 overflow-hidden">
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt={profile.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-crimson-100 to-crimson-200">
            <span className="text-6xl font-display font-bold text-crimson-400">
              {profile.displayName?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}

        {/* Match badge */}
        <div className="absolute top-3 right-3">
          <MatchBadge score={matchScore} />
        </div>

        {/* Hover overlay */}
        <div className="hover-overlay absolute inset-0 bg-crimson-900/60 flex items-center justify-center">
          <button className="flex items-center gap-2 bg-white text-crimson-800 font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:bg-cream transition-colors">
            <Eye size={16} />
            View Profile
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display font-bold text-lg text-crimson-900 leading-tight">
          {profile.displayName || 'Anonymous'}
        </h3>
        <p className="text-sm text-crimson-600 font-medium mb-2">
          {[profile.program, profile.campus?.split(' ')[1] || profile.campus].filter(Boolean).join(' · ')}
        </p>

        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
          <MapPin size={12} />
          <span>{profile.campus || 'IU Campus'}</span>
        </div>
        {profile.undergradUni && (
          <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
            <GraduationCap size={12} />
            <span className="truncate">{profile.undergradUni}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs font-medium bg-crimson-50 text-crimson-700 px-2.5 py-1 rounded-full border border-crimson-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
