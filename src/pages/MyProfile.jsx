import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { MapPin, GraduationCap, Edit, Instagram, Linkedin, Moon, Utensils, Home, Volume2, Dog, Cigarette, Wine, Sparkles, Building, Maximize, Bath, DollarSign, Users, Phone, Mail, Globe } from 'lucide-react'

function InfoRow({ icon: Icon, label, value }) {
  if (!value && value !== false) return null
  return (
    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1.5 transition-colors hover:bg-gray-50">
      <div className="flex items-center gap-1.5 text-gray-500">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{String(value)}</span>
    </div>
  )
}

function ProfileSection({ title, icon: Icon, children }) {
  return (
    <div>
      <h3 className="font-display font-bold text-crimson-900 mb-3 flex items-center gap-2">
        <Icon size={16} /> {title}
      </h3>
      <div className="card p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3">{children}</div>
    </div>
  )
}

export default function MyProfile() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Loading profile...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">My Profile</h1>
        <button
          onClick={() => navigate('/onboarding')}
          className="btn-outline flex items-center gap-2 text-sm py-2"
        >
          <Edit size={15} /> Edit Profile
        </button>
      </div>

      <div className="card overflow-hidden shadow-lg shadow-crimson-100/20 mb-6">
        {/* Header */}
        <div className="relative h-40 bg-gradient-to-br from-crimson-800 to-crimson-950 overflow-hidden">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover opacity-70" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-8xl font-bold text-crimson-500/30">
                {profile.displayName?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div className="px-6 pb-6 -mt-8 relative">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-crimson-100 mb-4 shadow-lg">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display font-bold text-2xl text-crimson-400">
                  {profile.displayName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>

          <h2 className="font-display text-2xl font-bold text-crimson-900">{profile.displayName || 'Your Name'}</h2>
          <p className="text-crimson-600 font-medium">{profile.program || 'Add your program'}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {profile.campus && (
              <span className="flex items-center gap-1.5 text-xs bg-crimson-50 text-crimson-700 px-3 py-1.5 rounded-full font-medium border border-crimson-100">
                <MapPin size={11} /> {profile.campus}
              </span>
            )}
            {(profile.city || profile.state || profile.country) && (
              <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium border border-emerald-100">
                <Globe size={11} /> {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
              </span>
            )}
            {profile.undergradUni && (
              <span className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full font-medium border border-gray-100">
                <GraduationCap size={11} /> {profile.undergradUni}
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 text-gray-600 text-sm leading-relaxed italic border-l-4 border-crimson-200 pl-3">
              "{profile.bio}"
            </p>
          )}

          {profile.additionalPhotos?.length > 0 && (
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none' }}>
              {profile.additionalPhotos.map((url, i) => (
                <div key={i} className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100 snap-start">
                  <img src={url} className="w-full h-full object-cover" alt="Gallery" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ProfileSection title="Living Preferences" icon={Home}>
          <InfoRow icon={Building} label="Room Type" value={profile.roomType} />
          <InfoRow icon={Maximize} label="Apartment Size" value={profile.apartmentSize} />
          <InfoRow icon={Bath} label="Bathroom" value={profile.bathroomAttached} />
          <InfoRow icon={DollarSign} label="Rent Budget" value={profile.rentRange} />
        </ProfileSection>

        <ProfileSection title="Lifestyle" icon={Sparkles}>
          <InfoRow icon={Users} label="Guests" value={profile.guestFrequency} />
          <InfoRow icon={Utensils} label="Diet" value={profile.diet} />
          <InfoRow icon={Moon} label="Sleep Schedule" value={profile.sleepSchedule} />
          <InfoRow icon={Volume2} label="Noise Level" value={profile.noiseLevel} />
          <InfoRow icon={Dog} label="Pets" value={profile.petPreference} />
          <InfoRow icon={Cigarette} label="Smoking" value={profile.smoking ? 'Smoker' : 'Non-smoker'} />
          <InfoRow icon={Wine} label="Drinking" value={profile.drinking ? 'Drinks' : 'Non-drinker'} />
        </ProfileSection>

        <ProfileSection title="Roommate Prefs" icon={Users}>
          <InfoRow icon={Users} label="Preferred Gender" value={profile.preferredGender} />
          <InfoRow icon={Globe} label="Preferred Ethnicity" value={Array.isArray(profile.preferredEthnicity) ? (profile.preferredEthnicity.length ? profile.preferredEthnicity.join(', ') : 'Any') : (profile.preferredEthnicity || 'Any')} />
          <InfoRow icon={Utensils} label="Preferred Diet" value={profile.preferredRoommateDiet} />
          <InfoRow icon={Cigarette} label="Smoking OK" value={profile.smokingOk ? 'Yes' : 'No'} />
          <InfoRow icon={Wine} label="Drinking OK" value={profile.drinkingOk ? 'Yes' : 'No'} />
          <InfoRow icon={Dog} label="Pets OK" value={profile.petOk ? 'Yes' : 'No'} />
        </ProfileSection>

        {profile.recreation?.length > 0 && (
          <div className="sm:col-span-2">
            <h3 className="font-display font-bold text-crimson-900 mb-3">Hobbies</h3>
            <div className="flex flex-wrap gap-2">
              {profile.recreation.map(r => (
                <span key={r} className="text-sm bg-crimson-50 text-crimson-700 px-3 py-1.5 rounded-full border border-crimson-100 font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {(profile.email || profile.phone || profile.instagram || profile.linkedin) && (
          <div className="sm:col-span-2">
            <h3 className="font-display font-bold text-crimson-900 mb-3">Contact & Social</h3>
            <div className="flex flex-wrap gap-3">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors font-medium">
                  <Mail size={15} /> Email
                </a>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl border border-green-200 hover:bg-green-100 transition-colors font-medium">
                  <Phone size={15} /> Phone
                </a>
              )}
              {profile.instagram && (
                <a href={profile.instagram.startsWith('http') ? profile.instagram : `https://${profile.instagram}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-pink-600 bg-pink-50 px-3 py-2 rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors font-medium">
                  <Instagram size={15} /> Instagram
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors font-medium">
                  <Linkedin size={15} /> LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {!profile.profileComplete && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <p className="text-amber-800 font-medium text-sm mb-2">Your profile is incomplete</p>
          <button onClick={() => navigate('/onboarding')} className="btn-crimson text-sm py-2 bg-amber-600 hover:bg-amber-700">
            Complete Profile →
          </button>
        </div>
      )}
    </div>
  )
}
