export const IU_CAMPUSES = [
  'IU Bloomington',
  'IUPUI (Indianapolis)',
  'IU East (Richmond)',
  'IU Kokomo',
  'IU Northwest (Gary)',
  'IU South Bend',
  'IU Southeast (New Albany)',
  'IU Fort Wayne',
]

export const DIET_OPTIONS = [
  'No Preference',
  'Vegetarian',
  'Vegan',
  'Eggetarian',
  'Non-Vegetarian',
  'Halal',
  'Kosher',
  'Gluten-Free',
]

export const SLEEP_SCHEDULES = [
  'Early Bird (sleep by 10pm)',
  'Regular (sleep by midnight)',
  'Night Owl (sleep after 1am)',
  'Varies / No preference',
]

export const CLEANLINESS_LEVELS = [
  'Very Clean (daily tidying)',
  'Clean (weekly cleaning)',
  'Moderate (occasional mess ok)',
  'Relaxed (low maintenance)',
]

export const NOISE_LEVELS = [
  'Silent (library quiet)',
  'Low (soft background noise ok)',
  'Moderate (music/TV ok)',
  'Loud (parties occasionally ok)',
]

export const ROOM_TYPES = ['Private Room', 'Shared Room', 'Either']

export const APARTMENT_SIZES = [
  'Studio',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4+ Bedroom',
]

export const GENDER_PREFERENCES = [
  'Male',
  'Female',
  'Non-binary',
  'No Preference',
]

export const PET_PREFERENCES = [
  'No pets',
  'Cats only',
  'Dogs only',
  'Any pets ok',
  'Already have a pet',
]

export const RECREATION_OPTIONS = [
  'Gaming',
  'Fitness / Gym',
  'Cooking',
  'Music',
  'Movies / TV',
  'Outdoor activities',
  'Reading',
  'Art / Creative',
  'Sports',
  'Travel',
  'Social / Parties',
  'Yoga / Meditation',
]

export const RENT_RANGES = [
  'Under $500/mo',
  '$500 – $750/mo',
  '$750 – $1000/mo',
  '$1000 – $1250/mo',
  '$1250 – $1500/mo',
  '$1500+/mo',
]

export const ETHNICITIES = [
  'South Asian',
  'East Asian',
  'Southeast Asian',
  'Middle Eastern',
  'African',
  'African American',
  'Hispanic / Latino',
  'White / Caucasian',
  'Mixed / Multiracial',
  'Prefer not to say',
  'Other',
]

// Match scoring weights (must sum to 100)
export const MATCH_WEIGHTS = {
  diet: 20,
  sleepSchedule: 15,
  roomType: 15,
  rentRange: 15,
  cleanliness: 10,
  smokingDrinking: 10,
  noiseLevel: 8,
  petPreference: 7,
}
