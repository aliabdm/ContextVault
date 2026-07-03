import { NextResponse } from 'next/server'
import { getDesktopDownloadStats } from '@/lib/github-download-stats'

export const revalidate = 3600

export async function GET() {
  try {
    const stats = await getDesktopDownloadStats()
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Unable to load GitHub download statistics', error)
    return NextResponse.json(
      { error: 'Download statistics are temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'public, s-maxage=60' } },
    )
  }
}
