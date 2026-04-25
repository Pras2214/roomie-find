import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, deleteDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import { calculateMatch } from '../utils/matchScore'
import toast from 'react-hot-toast'
import {
  MapPin, GraduationCap, Heart, HeartOff, Star, ArrowLeft,
  Instagram, Linkedin, Moon, Utensils, Home, Volume2, Dog,
  Cigarette, Wine, Sparkles, HomeIcon, Building, Maximize, Bath, DollarSign, Users, Phone, Mail, Globe
} from 'lucide-react'

function MatchRing({ score }) {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  const r = 30
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="text-center -mt-14">
        <div className="font-bold text-xl" style={{ color }}>{score}%</div>
        <div className="text-xs text-gray-400 font-medium">match</div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1.5 transition-colors hover:bg-gray-50">
      <div className="flex items-center gap-1.5 text-gray-500">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

export default function ProfileView() {
  const { id } = useParams()
  const { user, profile: myProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [interestSent, setInterestSent] = useState(false)
  const [interestLoading, setInterestLoading] = useState(false)
  const [matchScore, setMatchScore] = useState(0)
  const [isMutual, setIsMutual] = useState(false)
  const [isRoommated, setIsRoommated] = useState(false)
  const [roommateLoading, setRoommateLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'users', id))
      if (snap.exists()) {
        const p = { id: snap.id, ...snap.data() }
        setProfile(p)
        setMatchScore(calculateMatch(myProfile, p))
      }

      // Check if interest already sent
      const intSnap = await getDocs(query(
        collection(db, 'interests'),
        where('fromUserId', '==', user.uid),
        where('toUserId', '==', id)
      ))
      const sent = !intSnap.empty
      setInterestSent(sent)

      // Check mutual
      if (sent) {
        const mutualSnap = await getDocs(query(
          collection(db, 'interests'),
          where('fromUserId', '==', id),
          where('toUserId', '==', user.uid)
        ))
        setIsMutual(!mutualSnap.empty)
      }

      // Check if already set as roommate
      const mySnap = await getDoc(doc(db, 'users', user.uid))
      if (mySnap.exists() && mySnap.data().roommateId === id) {
        setIsRoommated(true)
        setIsMutual(true)
      }

      setLoading(false)
    }
    fetch()
  }, [id, user, myProfile])

  const handleInterest = async () => {
    setInterestLoading(true)
    try {
      if (interestSent) {
        // Withdraw interest
        const intSnap = await getDocs(query(
          collection(db, 'interests'),
          where('fromUserId', '==', user.uid),
          where('toUserId', '==', id)
        ))
        for (const d of intSnap.docs) await deleteDoc(d.ref)
        setInterestSent(false)
        setIsMutual(false)
        toast.success('Interest withdrawn')
      } else {
        // Send interest
        await addDoc(collection(db, 'interests'), {
          fromUserId: user.uid,
          fromName: myProfile?.displayName || user.email,
          fromPhoto: myProfile?.photoURL || '',
          toUserId: id,
          createdAt: serverTimestamp(),
        })
        setInterestSent(true)
        toast.success('Interest shown! 💌')

        // Check if mutual
        const mutualSnap = await getDocs(query(
          collection(db, 'interests'),
          where('fromUserId', '==', id),
          where('toUserId', '==', user.uid)
        ))
        if (!mutualSnap.empty) {
          setIsMutual(true)
          // Create notifications for both
          await addDoc(collection(db, 'notifications'), {
            toUserId: user.uid,
            message: `🎉 You and ${profile?.displayName} mutually matched! Check their contact details.`,
            matchUserId: id,
            matchUserName: profile?.displayName,
            matchUserPhoto: profile?.photoURL || '',
            read: false,
            createdAt: serverTimestamp(),
          })
          await addDoc(collection(db, 'notifications'), {
            toUserId: id,
            message: `🎉 You and ${myProfile?.displayName} mutually matched!`,
            matchUserId: user.uid,
            matchUserName: myProfile?.displayName,
            matchUserPhoto: myProfile?.photoURL || '',
            read: false,
            createdAt: serverTimestamp(),
          })
          toast('🎉 It\'s a mutual match!', { duration: 4000 })
        }
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setInterestLoading(false)
    }
  }

  const handleSetRoommate = async () => {
    setRoommateLoading(true)
    try {
      // Update both users: set roommateId and isMatched = true
      await updateDoc(doc(db, 'users', user.uid), {
        roommateId: id,
        isMatched: true,
      })
      await updateDoc(doc(db, 'users', id), {
        roommateId: user.uid,
        isMatched: true,
      })
      setIsRoommated(true)
      await refreshProfile()
      toast.success(`🏠 ${profile?.displayName} is now your roommate! You're both hidden from Browse.`, { duration: 5000 })
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setRoommateLoading(false)
    }
  }

  const handleRemoveRoommate = async () => {
    if (!window.confirm(`Remove ${profile?.displayName} as your roommate? You'll both reappear in Browse.`)) return
    setRoommateLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        roommateId: deleteField(),
        isMatched: false,
      })
      await updateDoc(doc(db, 'users', id), {
        roommateId: deleteField(),
        isMatched: false,
      })
      setIsRoommated(false)
      setIsMutual(true)
      await refreshProfile()
      toast.success('Roommate removed. You\'re both back on Browse.')
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setRoommateLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-crimson-200 border-t-crimson-700 rounded-full animate-spin" />
    </div>
  )

  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Profile not found</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-crimson-700 mb-4 transition-colors font-medium">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="card overflow-hidden shadow-xl shadow-crimson-100/30">
        {/* Hero */}
        <div className="relative h-56 sm:h-72 bg-gradient-to-br from-crimson-800 to-crimson-950 overflow-hidden">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-9xl font-bold text-crimson-500/40">
                {profile.displayName?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{profile.displayName}</h1>
              <p className="text-crimson-200 font-medium">{profile.program}</p>
            </div>
            <MatchRing score={matchScore} />
          </div>
        </div>

        <div className="p-6">
          {/* Campus & Undergrad */}
          <div className="flex flex-wrap gap-2 mb-4">
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
            {profile.ethnicity && (
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-100">
                {profile.ethnicity}
              </span>
            )}
            {isRoommated && (
              <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium border border-green-200">
                🏠 Your Roommate
              </span>
            )}
          </div>

          {profile.bio && (
            <div className="mb-5 p-4 bg-cream rounded-xl border border-crimson-50">
              <p className="text-gray-700 text-sm leading-relaxed italic">"{profile.bio}"</p>
            </div>
          )}

          {profile.additionalPhotos?.length > 0 && (
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none' }}>
              {profile.additionalPhotos.map((url, i) => (
                <div key={i} className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100 snap-start">
                  <img src={url} className="w-full h-full object-cover shadow-sm bg-gray-50" alt="Gallery" />
                </div>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Living Preferences */}
            <div>
              <h3 className="font-display font-bold text-crimson-900 mb-3 flex items-center gap-2">
                <Home size={16} /> Living Preferences
              </h3>
              <div className="card p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3">
                <InfoRow icon={Building} label="Room Type" value={profile.roomType} />
                <InfoRow icon={Maximize} label="Apartment Size" value={profile.apartmentSize} />
                <InfoRow icon={Bath} label="Bathroom" value={profile.bathroomAttached} />
                <InfoRow icon={DollarSign} label="Rent Budget" value={profile.rentRange} />
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <h3 className="font-display font-bold text-crimson-900 mb-3 flex items-center gap-2">
                <Sparkles size={16} /> Lifestyle
              </h3>
              <div className="card p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3">
                <InfoRow icon={Users} label="Guests" value={profile.guestFrequency} />
                <InfoRow icon={Utensils} label="Diet" value={profile.diet} />
                <InfoRow icon={Moon} label="Sleep Schedule" value={profile.sleepSchedule} />
                <InfoRow icon={Volume2} label="Noise Level" value={profile.noiseLevel} />
                <InfoRow icon={Dog} label="Pets" value={profile.petPreference} />
                <InfoRow icon={Cigarette} label="Smoking" value={profile.smoking ? 'Smoker' : 'Non-smoker'} />
                <InfoRow icon={Wine} label="Drinking" value={profile.drinking ? 'Drinks' : 'Non-drinker'} />
              </div>
            </div>

            {/* Roommate Preferences */}
            <div>
              <h3 className="font-display font-bold text-crimson-900 mb-3 flex items-center gap-2">
                <Users size={16} /> Roommate Prefs
              </h3>
              <div className="card p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3">
                <InfoRow icon={Users} label="Preferred Gender" value={profile.preferredGender} />
                <InfoRow icon={Globe} label="Pref Ethnicity" value={Array.isArray(profile.preferredEthnicity) ? (profile.preferredEthnicity.length ? profile.preferredEthnicity.join(', ') : 'Any') : (profile.preferredEthnicity || 'Any')} />
                <InfoRow icon={Utensils} label="Preferred Diet" value={profile.preferredRoommateDiet} />
                <InfoRow icon={Cigarette} label="Smoking OK" value={profile.smokingOk ? 'Yes' : 'No'} />
                <InfoRow icon={Wine} label="Drinking OK" value={profile.drinkingOk ? 'Yes' : 'No'} />
                <InfoRow icon={Dog} label="Pets OK" value={profile.petOk ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* Hobbies */}
            {profile.recreation?.length > 0 && (
              <div className="sm:col-span-2">
                <h3 className="font-display font-bold text-crimson-900 mb-3">Hobbies & Recreation</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.recreation.map(r => (
                    <span key={r} className="text-sm bg-crimson-50 text-crimson-700 px-3 py-1.5 rounded-full border border-crimson-100 font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact & Social Links */}
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

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            {/* Withdraw / Show Interest */}
            <button
              onClick={handleInterest}
              disabled={interestLoading || isRoommated || myProfile?.isHidden}
              title={myProfile?.isHidden ? "You cannot show or withdraw interest while your profile is hidden." : ""}
              className={`flex-1 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
                interestSent
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  : 'bg-crimson-800 text-white hover:bg-crimson-700 shadow-lg shadow-crimson-200'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {interestSent ? <><HeartOff size={18} /> Withdraw Interest</> : <><Heart size={18} /> Show Interest</>}
            </button>

            {/* Set as Roommate — only shown on mutual match */}
            {isMutual && !isRoommated && (
              <button
                onClick={handleSetRoommate}
                disabled={roommateLoading || myProfile?.isHidden}
                title={myProfile?.isHidden ? "You cannot secure a roommate while your profile is hidden." : ""}
                className="flex-1 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                🏠 Set as Roommate
              </button>
            )}

            {/* Already roommated — show remove option */}
            {isRoommated && (
              <button
                onClick={handleRemoveRoommate}
                disabled={roommateLoading || myProfile?.isHidden}
                title={myProfile?.isHidden ? "Please unhide your profile first to modify roommate connections." : ""}
                className="flex-1 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                🏠 Remove Roommate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
