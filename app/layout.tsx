import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "トランザクション体験アプリ",
  description: "PostgreSQLのトランザクション処理を体験的に学ぶアプリケーション",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>{children}</body>
    </html>
  )
}


import './globals.css'