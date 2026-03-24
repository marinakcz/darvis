import { type NextRequest, NextResponse } from "next/server"

export default function proxy(request: NextRequest) {
  // Embed mode — set cookie for sub-navigations in clientzone iframe
  const embedCookie = request.cookies.get("darvis-embed")
  if (request.nextUrl.searchParams.get("embed") === "1" || embedCookie?.value === "1") {
    const response = NextResponse.next()
    if (!embedCookie) {
      response.cookies.set("darvis-embed", "1", { path: "/", maxAge: 60 * 60 * 24 })
    }
    return response
  }

  return NextResponse.next()
}
