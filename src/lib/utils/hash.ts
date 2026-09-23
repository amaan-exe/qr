import { createHash } from 'crypto'

export function saltedHash(value: string): string {
  const salt = process.env.HASH_SALT || 'default-dev-salt-replace-in-production'
  return createHash('sha256').update(salt + value).digest('hex')
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null
  return saltedHash(ip)
}

export function hashUserAgent(ua: string | null): string | null {
  if (!ua) return null
  return saltedHash(ua)
}
