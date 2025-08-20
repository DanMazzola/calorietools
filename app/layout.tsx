import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CalorieTools',
  description: 'Simple MVP calorie calculator built with Next.js 14 and Tailwind CSS.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className="min-h-full antialiased text-gray-900">
        {children}
      </body>
    </html>
  )
}

