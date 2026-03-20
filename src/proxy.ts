import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

const COOKIE_NAME = "darvis-access"
const ACCESS_PAGE = "/access"

function getSecret(): string {
  return process.env.ADMIN_SECRET || "dev-secret-darvis-2026"
}

function isValidAccessCookie(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_NAME)
  if (!cookie?.value) return false

  const token = cookie.value
  const dot = token.indexOf(".")
  if (dot === -1) return false

  const expiresAt = Number(token.slice(0, dot))
  const hmac = token.slice(dot + 1)

  if (isNaN(expiresAt) || expiresAt < Date.now()) return false

  const expected = createHmac("sha256", getSecret()).update(`access:${expiresAt}`).digest("hex")
  return hmac === expected
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access page and API routes without auth
  if (
    pathname === ACCESS_PAGE ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next()
  }

  // Check access cookie
  if (!isValidAccessCookie(request)) {
    const url = request.nextUrl.clone()
    url.pathname = ACCESS_PAGE
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
