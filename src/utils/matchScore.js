import { MATCH_WEIGHTS } from './constants'

// Helper: check if two rent ranges overlap
function rentRangesOverlap(range1, range2) {
  const ranges = [
    'Under $500/mo',
    '$500 – $750/mo',
    '$750 – $1000/mo',
    '$1000 – $1250/mo',
    '$1250 – $1500/mo',
    '$1500+/mo',
  ]
  const i1 = ranges.indexOf(range1)
  const i2 = ranges.indexOf(range2)
  if (i1 === -1 || i2 === -1) return 0.5
  return Math.max(0, 1 - Math.abs(i1 - i2) * 0.25)
}

// Helper: score close-range matches (sleep, cleanliness, noise)
function closeRangeScore(val1, val2, options) {
  const i1 = options.indexOf(val1)
  const i2 = options.indexOf(val2)
  if (i1 === -1 || i2 === -1) return 0.5
  const diff = Math.abs(i1 - i2)
  if (diff === 0) return 1
  if (diff === 1) return 0.6
  if (diff === 2) return 0.3
  return 0
}

/**
 * Calculate match % between current user and a candidate.
 * currentUser = logged-in user's profile
 * candidate = the profile being viewed
 */
export function calculateMatch(currentUser, candidate) {
  if (!currentUser || !candidate) return 0

  let totalScore = 0

  const cu = currentUser
  const ca = candidate

  // --- DIET (20%) ---
  const dietScore = (() => {
    if (!cu.diet || !ca.diet) return 0.5
    if (cu.preferredRoommateDiet === 'No Preference' || ca.preferredRoommateDiet === 'No Preference') return 0.9
    if (cu.preferredRoommateDiet === ca.diet) return 1
    if (cu.diet === ca.preferredRoommateDiet) return 0.8
    return 0.3
  })()
  totalScore += dietScore * MATCH_WEIGHTS.diet

  // --- SLEEP SCHEDULE (15%) ---
  const sleepOptions = [
    'Early Bird (sleep by 10pm)',
    'Regular (sleep by midnight)',
    'Night Owl (sleep after 1am)',
    'Varies / No preference',
  ]
  const sleepScore = (() => {
    if (cu.sleepSchedule === 'Varies / No preference' || ca.sleepSchedule === 'Varies / No preference') return 0.8
    return closeRangeScore(cu.sleepSchedule, ca.sleepSchedule, sleepOptions)
  })()
  totalScore += sleepScore * MATCH_WEIGHTS.sleepSchedule

  // --- ROOM TYPE (15%) ---
  const roomScore = (() => {
    if (!cu.roomType || !ca.roomType) return 0.5
    if (cu.roomType === 'Either' || ca.roomType === 'Either') return 1
    if (cu.roomType === ca.roomType) return 1
    return 0
  })()
  totalScore += roomScore * MATCH_WEIGHTS.roomType

  // --- RENT RANGE (15%) ---
  const rentScore = rentRangesOverlap(cu.rentRange, ca.rentRange)
  totalScore += rentScore * MATCH_WEIGHTS.rentRange

  // --- CLEANLINESS (10%) ---
  const cleanOptions = [
    'Very Clean (daily tidying)',
    'Clean (weekly cleaning)',
    'Moderate (occasional mess ok)',
    'Relaxed (low maintenance)',
  ]
  const cleanScore = closeRangeScore(cu.cleanliness, ca.cleanliness, cleanOptions)
  totalScore += cleanScore * MATCH_WEIGHTS.cleanliness

  // --- SMOKING / DRINKING (10%) ---
  const smokeDrinkScore = (() => {
    let s = 0
    // Smoking
    if (cu.smokingOk === ca.smoking || cu.smokingOk === 'No preference') s += 0.5
    else if (cu.smoking === false && ca.smokingOk === false) s += 0.5
    else s += 0.1
    // Drinking
    if (cu.drinkingOk === ca.drinking || cu.drinkingOk === 'No preference') s += 0.5
    else s += 0.1
    return s
  })()
  totalScore += smokeDrinkScore * MATCH_WEIGHTS.smokingDrinking

  // --- NOISE LEVEL (8%) ---
  const noiseOptions = [
    'Silent (library quiet)',
    'Low (soft background noise ok)',
    'Moderate (music/TV ok)',
    'Loud (parties occasionally ok)',
  ]
  const noiseScore = closeRangeScore(cu.noiseLevel, ca.noiseLevel, noiseOptions)
  totalScore += noiseScore * MATCH_WEIGHTS.noiseLevel

  // --- PET PREFERENCE (7%) ---
  const petScore = (() => {
    if (!cu.petPreference || !ca.petPreference) return 0.5
    if (cu.petPreference === ca.petPreference) return 1
    if (cu.petPreference === 'No pets' && ca.petPreference?.includes('pet')) return 0
    if (cu.petPreference === 'Any pets ok') return 0.9
    return 0.5
  })()
  totalScore += petScore * MATCH_WEIGHTS.petPreference

  return Math.round(Math.min(100, Math.max(0, totalScore)))
}
