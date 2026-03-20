import type { Metadata, Viewport } from "next"
import "./globals.css"
import { FeedbackButton } from "@/components/feedback-button"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
}

export const metadata: Metadata = {
  title: "Darvis – Kalkulace stěhování",
  description: "Digitální kalkulace stěhování pro servisní firmy",
  manifest: "/manifest.json",
  icons: {
    apple: "/logo.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Darvis",
    statusBarStyle: "black-translucent",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="cs" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <FeedbackButton />
      </body>
    </html>
  )
}
