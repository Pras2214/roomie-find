import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

function getCompletionScore(profile) {
  if (!profile) return 0
  const fields = [
    'photoURL', 'displayName', 'campus', 'course', 'undergradUni',
    'bio', 'diet', 'sleepSchedule', 'cleanliness', 'noiseLevel',
    'roomType', 'rentRange', 'smokingOk', 'drinkingOk', 'petPreference',
  ]
  const filled = fields.filter(f => profile[f] && profile[f] !== '').length
  return Math.round((filled / fields.length) * 100)
}

export default function ProfileCompletionBanner() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !profile) return null

  const score = getCompletionScore(profile)
  if (score >= 80) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle size={16} className="shrink-0" />
          <span className="text-sm font-medium">
            Your profile is {score}% complete — complete it to get better matches!
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/onboarding')}
            className="text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Complete Profile
          </button>
          <button onClick={() => setDismissed(true)} className="text-amber-600 hover:text-amber-800">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
