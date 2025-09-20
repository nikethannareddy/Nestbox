import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { ClientWrapper } from "@/components/layout/client-wrapper"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  preload: false, // Disable automatic preloading
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  preload: false, // Disable automatic preloading
})

export const metadata: Metadata = {
  title: "NestBox - Community Bird Conservation",
  description: "Connect with your community to help local birds through nest box monitoring and conservation efforts.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Preload fonts with proper attributes */}
        <link
          rel="preload"
          href={spaceGrotesk.url}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href={dmSans.url}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}
