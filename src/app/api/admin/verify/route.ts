import { generateToken, adminCookieHeader } from "@/lib/admin-auth"

export async function POST(request: Request) {
  const { pin } = await request.json()
  const correctPin = process.env.ADMIN_PIN || "1831"

  if (pin === correctPin) {
    const token = generateToken()
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": adminCookieHeader(token),
      },
    })
  }

  return Response.json({ error: "Wrong PIN" }, { status: 401 })
}
