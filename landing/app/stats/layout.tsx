import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Desktop Download Stats - ContextVault',
  description: 'Public, privacy-friendly download statistics for ContextVault Desktop releases.',
}

export default function StatsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
