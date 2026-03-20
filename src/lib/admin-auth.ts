import { createHmac } from "crypto"

const COOKIE_NAME = "darvis-admin"
const TTL_MS = 8 * 60 * 60 * 1000 // 8 hours

function getSecret(): string {
  return process.env.ADMIN_SECRET || "dev-secret-darvis-2026"
}

/** Create a token: `{expiresAt}.{hmac}` */
export function generateToken(secret?: string): string {
  const s = secret ?? getSecret()
  const expiresAt = Date.now() + TTL_MS
  const hmac = createHmac("sha256", s).update(String(expiresAt)).digest("hex")
  return `${expiresAt}.${hmac}`
}

/** Verify token HMAC + expiry */
export function verifyToken(token: string, secret?: string): boolean {
  const s = secret ?? getSecret()
  const dot = token.indexOf(".")
  if (dot === -1) return false

  const expiresAt = Number(token.slice(0, dot))
  const hmac = token.slice(dot + 1)

  if (isNaN(expiresAt) || expiresAt < Date.now()) return false

  const expected = createHmac("sha256", s).update(String(expiresAt)).digest("hex")
  // Constant-time comparison
  if (hmac.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < hmac.length; i++) {
    mismatch |= hmac.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return mismatch === 0
}

/** Read admin cookie from request */
export function getAdminCookie(request: Request): string | null {
  const header = request.headers.get("cookie")
  if (!header) return null
  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Return Set-Cookie header value */
export function adminCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL_MS / 1000}`
}

/** Return a clear-cookie header value */
export function clearAdminCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
}

/** Check if request has a valid admin cookie */
export function isAdmin(request: Request): boolean {
  const token = getAdminCookie(request)
  if (!token) return false
  return verifyToken(token)
}
