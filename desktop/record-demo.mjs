import puppeteer from 'puppeteer'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const outputDir = join(root, 'demo-output')
const screenshotsDir = join(outputDir, 'screenshots')
const videoPath = join(outputDir, 'contextvault-desktop-demo.webm')
const mp4Path = join(outputDir, 'contextvault-desktop-demo.mp4')
const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg'
const debugPort = process.env.CONTEXTVAULT_DEBUG_PORT || '9333'

mkdirSync(screenshotsDir, { recursive: true })

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function snapshot(page, name) {
  await page.screenshot({ path: join(screenshotsDir, `${name}.png`) })
}

async function route(page, hash, pause = 900) {
  await page.evaluate((next) => { window.location.hash = next }, hash)
  await sleep(pause)
}

async function clickByText(page, text) {
  const clicked = await page.evaluate((label) => {
    const target = [...document.querySelectorAll('button')].find((element) => element.textContent?.trim().includes(label))
    if (!target) return false
    target.click()
    return true
  }, text)
  if (!clicked) throw new Error(`Could not find control: ${text}`)
  await sleep(900)
}

const ffmpegAvailable = existsSync(ffmpegPath) || spawnSync(ffmpegPath, ['-version'], { stdio: 'ignore' }).status === 0
if (!ffmpegAvailable) {
  throw new Error('ffmpeg was not found. Add it to PATH or set FFMPEG_PATH.')
}

const browser = await puppeteer.connect({
  browserURL: `http://127.0.0.1:${debugPort}`,
  defaultViewport: null,
})

try {
  const pages = await browser.pages()
  const page = pages.find((candidate) => candidate.url().includes('localhost:')) || pages[0]
  if (!page) throw new Error('ContextVault window was not found.')

  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
  await page.bringToFront()
  const recorder = await page.screencast({ path: videoPath, ffmpegPath })

  await route(page, '#/')
  await snapshot(page, '01-dashboard')
  await sleep(1400)

  await route(page, '#/sessions')
  await snapshot(page, '02-sessions')
  const openedMenu = await page.evaluate(() => {
    const button = document.querySelector('tbody button')
    if (!button) return false
    button.click()
    return true
  })
  if (openedMenu) {
    await clickByText(page, 'Open')
    await snapshot(page, '03-session-detail')
  }

  await route(page, '#/search')
  const search = await page.$('input[placeholder*="Search query"]')
  if (search) {
    await search.type('recorder', { delay: 55 })
    await page.select('select', 'decision')
    await clickByText(page, 'Search')
  }
  await snapshot(page, '04-search-results')

  await route(page, '#/prepare')
  const query = await page.$('input[placeholder*="next task"]')
  if (query) {
    await query.type('Continue the authentication middleware work', { delay: 45 })
    await clickByText(page, 'Generate Context Package')
  }
  await snapshot(page, '05-prepared-context')

  await route(page, '#/tools')
  await clickByText(page, 'Rebuild Index')
  await snapshot(page, '06-vault-tools')
  await clickByText(page, 'Update Memory')
  await snapshot(page, '07-project-memory')

  await route(page, '#/settings')
  await snapshot(page, '08-settings')
  await sleep(1400)

  await recorder.stop()
  const conversion = spawnSync(ffmpegPath, [
    '-y', '-i', videoPath,
    '-vf', 'crop=iw:iw*9/16,scale=1280:720',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-an', mp4Path,
  ], { stdio: 'pipe' })
  if (conversion.status !== 0) throw new Error(conversion.stderr.toString())
  console.log(`Recorded ${videoPath}`)
  console.log(`Campaign MP4 ${mp4Path}`)
  console.log(`Screenshots ${screenshotsDir}`)
} finally {
  browser.disconnect()
}
