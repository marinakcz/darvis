import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { pin } = await request.json()
  const correctPin = process.env.ADMIN_PIN || "1831"

  if (pin === correctPin) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Wrong PIN" }, { status: 401 })
}
