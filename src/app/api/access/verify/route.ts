import { createHmac } from "crypto"

const COOKIE_NAME = "darvis-access"
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function getSecret(): string {
  return process.env.ADMIN_SECRET || "dev-secret-darvis-2026"
}

export async function POST(request: Request) {
  const { pin } = await request.json()
  const correctPin = process.env.ACCESS_PIN || "1515"

  if (pin === correctPin) {
    const expiresAt = Date.now() + TTL_MS
    const hmac = createHmac("sha256", getSecret()).update(`access:${expiresAt}`).digest("hex")
    const token = `${expiresAt}.${hmac}`

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL_MS / 1000}`,
      },
    })
  }

  return Response.json({ error: "Wrong PIN" }, { status: 401 })
}
