import { createHmac } from "crypto"

export const dynamic = "force-dynamic"

const COOKIE_NAME = "darvis-access"

function getSecret(): string {
  return process.env.ADMIN_SECRET || "dev-secret-darvis-2026"
}

export async function GET(request: Request) {
  const header = request.headers.get("cookie")
  if (!header) return Response.json({ ok: false }, { status: 401 })

  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  if (!match) return Response.json({ ok: false }, { status: 401 })

  const token = decodeURIComponent(match[1])
  const dot = token.indexOf(".")
  if (dot === -1) return Response.json({ ok: false }, { status: 401 })

  const expiresAt = Number(token.slice(0, dot))
  const hmac = token.slice(dot + 1)

  if (isNaN(expiresAt) || expiresAt < Date.now()) {
    return Response.json({ ok: false }, { status: 401 })
  }

  const expected = createHmac("sha256", getSecret()).update(`access:${expiresAt}`).digest("hex")
  if (hmac !== expected) {
    return Response.json({ ok: false }, { status: 401 })
  }

  return Response.json({ ok: true })
}
