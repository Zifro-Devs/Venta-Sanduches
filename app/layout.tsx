import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#c75b2a',
}

export const metadata: Metadata = {
  title: 'Uy Qué Cubano - Control de Ventas',
  description: 'Sistema de control de ventas de Uy Qué Cubano',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo-mini.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo-mini.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo-mini.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo-mini.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
