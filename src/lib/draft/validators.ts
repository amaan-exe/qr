import type { FactSheet } from './fact-sheet'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const FORBIDDEN_WORDS = [
  '5 star',
  'five star',
  '1 star',
  'one star',
  'rate us',
  'rating',
  'discount',
  'coupon',
  'freebie',
  'deal',
  'promo',
  'voucher',
  'manager',
  'waiter',
  'waitress',
  'server name',
]

const POSITIVE_FOOD_WORDS = ['delicious', 'superb', 'fantastic', 'amazing', 'tasty', 'flavorful', 'wonderful']
const NEGATIVE_FOOD_WORDS = ['terrible', 'bland', 'inedible', 'cold food', 'poor quality', 'bad taste', 'undercooked', 'overcooked']

const POSITIVE_SERVICE_WORDS = ['attentive', 'friendly', 'warm', 'quick', 'fast', 'helpful', 'prompt']
const NEGATIVE_SERVICE_WORDS = ['rude', 'slow', 'inattentive', 'ignored', 'negligent', 'unfriendly']

export function validateDraft(text: string, factSheet: FactSheet): ValidationResult {
  const errors: string[] = []
  const trimmed = text.trim()

  // 1. Length check: 25 to 90 words
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length < 20 || words.length > 95) {
    errors.push(`Length is ${words.length} words (must be between 25 and 90 words)`)
  }

  // 2. Forbidden content check
  const lower = trimmed.toLowerCase()

  // URLs
  if (/https?:\/\/|\.com|\.in|\.org/i.test(trimmed)) {
    errors.push('Contains URL or web link')
  }

  // Emails
  if (/[\w.-]+@[\w.-]+\.\w+/i.test(trimmed)) {
    errors.push('Contains email address')
  }

  // Phone numbers (sequences of 7+ digits)
  if (/\b\d{7,}\b/.test(trimmed)) {
    errors.push('Contains phone number or sequence of digits')
  }

  // Emojis
  if (/\p{Extended_Pictographic}/u.test(trimmed)) {
    errors.push('Contains emojis')
  }

  // Forbidden keywords
  for (const forbidden of FORBIDDEN_WORDS) {
    if (lower.includes(forbidden)) {
      errors.push(`Contains forbidden phrase: "${forbidden}"`)
    }
  }

  // 3. Polarity check
  // Food polarity
  if (factSheet.food?.tone === 'negative') {
    for (const pos of POSITIVE_FOOD_WORDS) {
      if (lower.includes(pos)) {
        errors.push(`Food was rated negative but draft includes positive word: "${pos}"`)
        break
      }
    }
  } else if (factSheet.food?.tone === 'positive') {
    for (const neg of NEGATIVE_FOOD_WORDS) {
      if (lower.includes(neg)) {
        errors.push(`Food was rated positive but draft includes negative word: "${neg}"`)
        break
      }
    }
  }

  // Service polarity
  if (factSheet.service?.tone === 'negative') {
    for (const pos of POSITIVE_SERVICE_WORDS) {
      if (lower.includes(pos)) {
        errors.push(`Service was rated negative but draft includes positive word: "${pos}"`)
        break
      }
    }
  } else if (factSheet.service?.tone === 'positive') {
    for (const neg of NEGATIVE_SERVICE_WORDS) {
      if (lower.includes(neg)) {
        errors.push(`Service was rated positive but draft includes negative word: "${neg}"`)
        break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
