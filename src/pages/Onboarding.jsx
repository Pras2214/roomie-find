import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import {
  IU_CAMPUSES, DIET_OPTIONS, SLEEP_SCHEDULES, CLEANLINESS_LEVELS,
  NOISE_LEVELS, ROOM_TYPES, APARTMENT_SIZES, GENDER_PREFERENCES,
  PET_PREFERENCES, RECREATION_OPTIONS, RENT_RANGES, ETHNICITIES
} from '../utils/constants'
import { Camera, ChevronRight, ChevronLeft, Check, Plus, X } from 'lucide-react'

const STEPS = ['About You', 'Living Prefs', 'Lifestyle', 'Roommate Prefs']

// Compress image to base64 JPEG (max 300x300, ~80KB) — no Storage needed
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 300
      let { width, height } = img
      if (width > height) {
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX }
      } else {
        if (height > MAX) { width = Math.round(width * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject
    img.src = url
  })
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 ${i <= current ? 'text-crimson-800' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < current ? 'bg-crimson-800 text-white' : i === current ? 'bg-crimson-800 text-white ring-4 ring-crimson-200' : 'bg-gray-200 text-gray-500'}`}>
              {i < current ? <Check size={13} /> : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:inline">{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? 'bg-crimson-800' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function AccordionSection({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-800 hover:bg-crimson-50/50 transition-colors"
      >
        <span>{label}</span>
        <ChevronRight
          size={18}
          className={`text-crimson-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}

function SelectChip({ value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
        selected
          ? 'bg-crimson-800 text-white border-crimson-800'
          : 'bg-white text-gray-700 border-gray-200 hover:border-crimson-300'
      }`}
    >
      {value}
    </button>
  )
}

function MultiSelect({ options, selected = [], onChange }) {
  const toggle = (v) => {
    if (selected.includes(v)) onChange(selected.filter(x => x !== v))
    else onChange([...selected, v])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <SelectChip key={o} value={o} selected={selected.includes(o)} onClick={() => toggle(o)} />
      ))}
    </div>
  )
}

function SingleSelect({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <SelectChip key={o} value={o} selected={value === o} onClick={() => onChange(o)} />
      ))}
    </div>
  )
}

export default function Onboarding() {
  const { user, profile: existingProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileRef = useRef()
  const extraFileRef = useRef()

  // Pre-populate from existing profile (edit mode)
  const [data, setData] = useState({
    displayName: '', campus: '', program: '', undergradUni: '', undergradCourse: '',
    bio: '', ethnicity: '', instagram: '', linkedin: '', photoURL: '',
    additionalPhotos: [],
    phone: '', country: '', state: '', city: '', guestFrequency: '',
    roomType: '', bathroomAttached: '', apartmentSize: '', rentRange: '',
    diet: '', smoking: false, drinking: false, petPreference: '',
    sleepSchedule: '', cleanliness: '', noiseLevel: '', recreation: [],
    preferredGender: '', preferredRoommateDiet: '', preferredEthnicity: [], smokingOk: false,
    drinkingOk: false, petOk: false,
  })

  // Once profile loads, autofill data and photo preview
  useEffect(() => {
    if (existingProfile) {
      setData({
        displayName: existingProfile.displayName || '',
        campus: existingProfile.campus || '',
        program: existingProfile.program || '',
        undergradUni: existingProfile.undergradUni || '',
        undergradCourse: existingProfile.undergradCourse || '',
        bio: existingProfile.bio || '',
        ethnicity: existingProfile.ethnicity || '',
        instagram: existingProfile.instagram || '',
        linkedin: existingProfile.linkedin || '',
        photoURL: existingProfile.photoURL || '',
        additionalPhotos: existingProfile.additionalPhotos || [],
        phone: existingProfile.phone || '',
        country: existingProfile.country || '',
        state: existingProfile.state || '',
        city: existingProfile.city || '',
        guestFrequency: existingProfile.guestFrequency || '',
        roomType: existingProfile.roomType || '',
        bathroomAttached: existingProfile.bathroomAttached || '',
        apartmentSize: existingProfile.apartmentSize || '',
        rentRange: existingProfile.rentRange || '',
        diet: existingProfile.diet || '',
        smoking: existingProfile.smoking || false,
        drinking: existingProfile.drinking || false,
        petPreference: existingProfile.petPreference || '',
        sleepSchedule: existingProfile.sleepSchedule || '',
        cleanliness: existingProfile.cleanliness || '',
        noiseLevel: existingProfile.noiseLevel || '',
        recreation: existingProfile.recreation || [],
        preferredGender: existingProfile.preferredGender || '',
        preferredRoommateDiet: existingProfile.preferredRoommateDiet || '',
        preferredEthnicity: Array.isArray(existingProfile.preferredEthnicity) ? existingProfile.preferredEthnicity : (existingProfile.preferredEthnicity ? [existingProfile.preferredEthnicity] : []),
        smokingOk: existingProfile.smokingOk || false,
        drinkingOk: existingProfile.drinkingOk || false,
        petOk: existingProfile.petOk || false,
      })
      if (existingProfile.photoURL) {
        setPhotoPreview(existingProfile.photoURL)
      }
    }
  }, [existingProfile])

  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleAdditionalPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const b64 = await compressImage(file)
      setData(d => ({ ...d, additionalPhotos: [...(d.additionalPhotos || []), b64] }))
    } catch (err) {
      toast.error('Failed to process image')
    } finally {
      setLoading(false)
    }
  }

  const handleEthnicityChange = (newVal) => {
    const oldVal = data.preferredEthnicity || []
    if (newVal.includes('No Preference') && !oldVal.includes('No Preference')) {
      setData(d => ({ ...d, preferredEthnicity: ['No Preference'] }))
    } else if (newVal.includes('No Preference') && newVal.length > 1) {
      setData(d => ({ ...d, preferredEthnicity: newVal.filter(v => v !== 'No Preference') }))
    } else {
      setData(d => ({ ...d, preferredEthnicity: newVal }))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let photoURL = data.photoURL
      if (photoFile) {
        // Compress & store as base64 in Firestore — no Firebase Storage needed
        photoURL = await compressImage(photoFile)
      }
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        photoURL,
        profileComplete: true,
        updatedAt: new Date(),
      })
      await refreshProfile()
      toast.success('Profile saved!')
      navigate('/browse')
    } catch (err) {
      toast.error('Error saving profile: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    // Step 0: About You
    <div key={0} className="space-y-5">
      <h2 className="section-title">About You</h2>
      <div className="flex flex-col items-center gap-3 mb-2">
        <div
          onClick={() => fileRef.current.click()}
          className="w-28 h-28 rounded-full bg-crimson-100 border-4 border-crimson-200 overflow-hidden cursor-pointer hover:opacity-90 transition flex items-center justify-center relative"
        >
          {photoPreview ? (
            <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-crimson-400">
              <Camera size={28} />
              <span className="text-xs font-medium">Add Photo</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <p className="text-xs text-gray-400">Tap to upload your main photo</p>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="label">Additional Photos (Optional, up to 3)</label>
        <div className="flex gap-2">
          {data.additionalPhotos.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group border border-gray-200">
              <img src={url} className="w-full h-full object-cover" alt="Additional" />
              <button 
                type="button"
                onClick={() => setData(d => ({ ...d, additionalPhotos: d.additionalPhotos.filter((_, idx) => idx !== i) }))} 
                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {data.additionalPhotos.length < 3 && (
            <div onClick={() => extraFileRef.current.click()} className="w-16 h-16 rounded-xl border-dashed border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400 transition-colors">
              <Plus size={20} />
            </div>
          )}
          <input ref={extraFileRef} type="file" accept="image/*" className="hidden" onChange={handleAdditionalPhoto} />
        </div>
      </div>

      <div>
        <label className="label">Display Name</label>
        <input className="input-field" value={data.displayName} onChange={e => set('displayName', e.target.value)} placeholder="Jane Smith" />
      </div>
      <div>
        <label className="label">Campus</label>
        <select className="input-field" value={data.campus} onChange={e => set('campus', e.target.value)}>
          <option value="">Select campus</option>
          {IU_CAMPUSES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Current Program / Degree</label>
        <input className="input-field" value={data.program} onChange={e => set('program', e.target.value)} placeholder="e.g. MS Data Science, MBA" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Undergrad University</label>
          <input className="input-field" value={data.undergradUni} onChange={e => set('undergradUni', e.target.value)} placeholder="VIT Vellore" />
        </div>
        <div>
          <label className="label">Undergrad Course</label>
          <input className="input-field" value={data.undergradCourse} onChange={e => set('undergradCourse', e.target.value)} placeholder="B.Tech CSE" />
        </div>
      </div>
      <div>
        <label className="label">Cultural Background / Ethnicity</label>
        <select className="input-field" value={data.ethnicity} onChange={e => set('ethnicity', e.target.value)}>
          <option value="">Select (optional)</option>
          {ETHNICITIES.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
      <div>
        <label className="label">About Me</label>
        <textarea className="input-field resize-none" rows={3} value={data.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell future roommates a bit about yourself..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Instagram (optional)</label>
          <input className="input-field" value={data.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/username" />
        </div>
        <div>
          <label className="label">LinkedIn (optional)</label>
          <input className="input-field" value={data.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
        </div>
      </div>
      <div>
        <label className="label">Phone Number (optional)</label>
        <input className="input-field" type="tel" value={data.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Country</label>
          <input className="input-field" value={data.country} onChange={e => set('country', e.target.value)} placeholder="e.g. USA" />
        </div>
        <div>
          <label className="label">State</label>
          <input className="input-field" value={data.state} onChange={e => set('state', e.target.value)} placeholder="e.g. IN" />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input-field" value={data.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Bloomington" />
        </div>
      </div>
    </div>,

    // Step 1: Living Preferences
    <div key={1} className="space-y-5">
      <h2 className="section-title">Living Preferences</h2>
      <div>
        <label className="label">Room Type</label>
        <SingleSelect options={ROOM_TYPES} value={data.roomType} onChange={v => set('roomType', v)} />
      </div>
      <div>
        <label className="label">Attached Washroom</label>
        <SingleSelect options={['Required', 'Preferred', 'Not needed']} value={data.bathroomAttached} onChange={v => set('bathroomAttached', v)} />
      </div>
      <div>
        <label className="label">Preferred Apartment Size</label>
        <SingleSelect options={APARTMENT_SIZES} value={data.apartmentSize} onChange={v => set('apartmentSize', v)} />
      </div>
      <div>
        <label className="label">Rent Range (per month)</label>
        <SingleSelect options={RENT_RANGES} value={data.rentRange} onChange={v => set('rentRange', v)} />
      </div>
    </div>,

    // Step 2: Lifestyle
    <div key={2} className="space-y-5">
      <h2 className="section-title">Your Lifestyle</h2>
      <div>
        <label className="label">Diet / Food Preference</label>
        <SingleSelect options={DIET_OPTIONS} value={data.diet} onChange={v => set('diet', v)} />
      </div>
      <div>
        <label className="label">Sleep Schedule</label>
        <SingleSelect options={SLEEP_SCHEDULES} value={data.sleepSchedule} onChange={v => set('sleepSchedule', v)} />
      </div>
      <div>
        <label className="label">Guests Visit Frequency</label>
        <SingleSelect options={['Rarely', 'Occasionally', 'Frequently']} value={data.guestFrequency} onChange={v => set('guestFrequency', v)} />
      </div>
      <div>
        <label className="label">Cleanliness Level</label>
        <SingleSelect options={CLEANLINESS_LEVELS} value={data.cleanliness} onChange={v => set('cleanliness', v)} />
      </div>
      <div>
        <label className="label">Noise Tolerance</label>
        <SingleSelect options={NOISE_LEVELS} value={data.noiseLevel} onChange={v => set('noiseLevel', v)} />
      </div>
      <div>
        <label className="label">Pets</label>
        <SingleSelect options={PET_PREFERENCES} value={data.petPreference} onChange={v => set('petPreference', v)} />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.smoking} onChange={e => set('smoking', e.target.checked)} className="w-4 h-4 accent-crimson-700" />
          <span className="text-sm font-medium text-gray-700">I smoke</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.drinking} onChange={e => set('drinking', e.target.checked)} className="w-4 h-4 accent-crimson-700" />
          <span className="text-sm font-medium text-gray-700">I drink</span>
        </label>
      </div>
      <div>
        <label className="label">Hobbies & Recreation</label>
        <MultiSelect options={RECREATION_OPTIONS} selected={data.recreation} onChange={v => set('recreation', v)} />
      </div>
    </div>,

    // Step 3: Roommate Preferences
    <div key={3} className="space-y-5">
      <h2 className="section-title">Roommate Preferences</h2>
      <p className="text-sm text-gray-500">What are you looking for in a roommate?</p>
      <div>
        <label className="label">Preferred Gender</label>
        <SingleSelect options={GENDER_PREFERENCES} value={data.preferredGender} onChange={v => set('preferredGender', v)} />
      </div>
      <div>
        <label className="label">Preferred Diet</label>
        <SingleSelect options={DIET_OPTIONS} value={data.preferredRoommateDiet} onChange={v => set('preferredRoommateDiet', v)} />
      </div>
      <div>
        <label className="label">Preferred Ethnicity</label>
        <MultiSelect options={['No Preference', ...ETHNICITIES.filter(e => e !== 'Prefer not to say')]} selected={data.preferredEthnicity} onChange={handleEthnicityChange} />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.smokingOk} onChange={e => set('smokingOk', e.target.checked)} className="w-4 h-4 accent-crimson-700" />
          <span className="text-sm font-medium text-gray-700">Smoking is ok</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.drinkingOk} onChange={e => set('drinkingOk', e.target.checked)} className="w-4 h-4 accent-crimson-700" />
          <span className="text-sm font-medium text-gray-700">Drinking is ok</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.petOk} onChange={e => set('petOk', e.target.checked)} className="w-4 h-4 accent-crimson-700" />
          <span className="text-sm font-medium text-gray-700">Pets are ok</span>
        </label>
      </div>
    </div>,
  ]

  const isEditMode = !!existingProfile?.profileComplete

  // Edit mode: accordion sections + sticky save button
  if (isEditMode) {
    const sections = [
      { label: '👤 About You', content: steps[0] },
      { label: '🏠 Living Preferences', content: steps[1] },
      { label: '✨ Lifestyle', content: steps[2] },
      { label: '🤝 Roommate Preferences', content: steps[3] },
    ]
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-crimson-50 py-8 px-4 pb-28">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-crimson-700 transition-colors">
              <ChevronLeft size={22} />
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold text-crimson-900">Edit Profile</h1>
              <p className="text-gray-500 text-sm">Expand a section to edit, then save</p>
            </div>
          </div>

          <div className="space-y-2">
            {sections.map((section, i) => (
              <AccordionSection key={i} label={section.label}>
                {section.content}
              </AccordionSection>
            ))}
          </div>
        </div>

        {/* Sticky Save button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-lg z-50">
          <div className="max-w-xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-crimson py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-crimson-200"
            >
              {loading ? 'Saving...' : <><Check size={18} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Create mode: guided step-by-step wizard
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-crimson-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-bold text-crimson-900">Complete Your Profile</h1>
          <p className="text-gray-500 mt-1">Help others find their perfect match</p>
        </div>

        <StepIndicator current={step} />

        <div className="card p-6 shadow-lg shadow-crimson-100/30 fade-in">
          {steps[step]}

          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-outline flex items-center gap-2">
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <button onClick={() => navigate('/browse')} className="text-gray-400 hover:text-gray-600 text-sm font-medium">
                Skip for now
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-crimson flex items-center gap-2">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-crimson flex items-center gap-2 disabled:opacity-60">
                {loading ? 'Saving...' : <><Check size={16} /> Save Profile</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can always edit your profile later
        </p>
      </div>
    </div>
  )
}
