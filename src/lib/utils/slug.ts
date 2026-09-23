import crypto from 'crypto'

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'
const DEFAULT_LENGTH = 8

export function generateRandomSlug(length: number = DEFAULT_LENGTH): string {
  let result = ''
  const randomBytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    result += SLUG_CHARS[randomBytes[i] % SLUG_CHARS.length]
  }
  return result
}
