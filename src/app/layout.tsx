import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "../../styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://dev-quest-swart.vercel.app"),
  title: "DevQuest - Where Developers Compete, Contribute and Hunt Bounties",
  description:
    "Make open-source contributions, discover bounty-paying issue/repositories and rank among developers across the globe.",
  generator: "dev-quest-swart.vercel.app",
  openGraph: {
    title: "DevQuest - Where Developers Compete, Contribute and Hunt Bounties",
    description:
      "Make open-source contributions, discover bounty-paying issues and rank among developers across the globe.",
    url: "https://dev-quest-swart.vercel.app",
    siteName: "DevQuest",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "DevQuest Preview Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "DevQuest - Where Developers Compete, Contribute and Hunt Bounties",
    description:
      "Join DevQuest: contribute, compete, and earn bounties with developers worldwide.",
    images: ["/preview.png"],
    creator: "@CalmNrd",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
