import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { FeedbackButton } from "@/components/feedback-button"
import { AccessGate } from "@/components/access-gate"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Darvis – Kalkulace stěhování",
  description: "Digitální kalkulace stěhování pro servisní firmy",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AccessGate>
          {children}
          <FeedbackButton />
        </AccessGate>
      </body>
    </html>
  )
}
