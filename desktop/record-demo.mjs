import puppeteer from 'puppeteer'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync, existsSync, rmSync, copyFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const outputDir = join(root, 'demo-output')
const screenshotsDir = join(outputDir, 'screenshots-v1.6.0')
const demoProject = join(outputDir, 'ContextVault Demo Workspace')
const videoPath = join(outputDir, 'contextvault-desktop-v1.6.0.webm')
const mp4Path = join(outputDir, 'contextvault-desktop-v1.6.0.mp4')
const landingVideoPath = join(root, 'landing', 'public', 'demo', 'contextvault-desktop-demo.mp4')
const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg'
const debugPort = process.env.CONTEXTVAULT_DEBUG_PORT || '9333'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function prepareDemoProject() {
  rmSync(demoProject, { recursive: true, force: true })
  mkdirSync(demoProject, { recursive: true })
  const initialized = spawnSync(process.execPath, [join(root, 'scripts', 'vault-terminal.mjs'), 'init'], {
    cwd: demoProject,
    encoding: 'utf8',
  })
  if (initialized.status !== 0) throw new Error(initialized.stderr || 'Unable to initialize demo vault.')
}

async function snapshot(page, name) {
  await page.screenshot({ path: join(screenshotsDir, `${name}.png`) })
}

async function route(page, hash, pause = 700) {
  await page.evaluate((next) => { window.location.hash = next }, hash)
  await sleep(pause)
}

async function clickButton(page, text) {
  const clicked = await page.evaluate((label) => {
    const target = [...document.querySelectorAll('button')]
      .find((element) => element.textContent?.replace(/\s+/g, ' ').trim() === label)
    if (!target) return false
    target.click()
    return true
  }, text)
  if (!clicked) throw new Error(`Could not find button: ${text}`)
  await sleep(650)
}

async function addEvent(page, type, content) {
  await clickButton(page, type)
  await page.$eval('textarea', (element) => { element.value = '' })
  await page.type('textarea', content, { delay: 18 })
  await clickButton(page, `Add ${type}`)
}

const ffmpegAvailable = existsSync(ffmpegPath) || spawnSync(ffmpegPath, ['-version'], { stdio: 'ignore' }).status === 0
if (!ffmpegAvailable) throw new Error('ffmpeg was not found. Add it to PATH or set FFMPEG_PATH.')

rmSync(screenshotsDir, { recursive: true, force: true })
mkdirSync(screenshotsDir, { recursive: true })
prepareDemoProject()

const browser = await puppeteer.connect({
  browserURL: `http://127.0.0.1:${debugPort}`,
  defaultViewport: null,
})

let originalProject = ''

try {
  const pages = await browser.pages()
  const page = pages.find((candidate) => candidate.url().startsWith('file:')) || pages[0]
  if (!page) throw new Error('ContextVault window was not found.')

  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 })
  await page.bringToFront()
  originalProject = await page.evaluate(() => window.contextVault.getProjectPath())
  await page.evaluate(async (projectPath) => {
    await window.contextVault.updateSettings({ projectPath })
  }, demoProject)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await route(page, '#/')

  const recorder = await page.screencast({ path: videoPath, ffmpegPath })

  await snapshot(page, '01-dashboard-first-run')
  await sleep(1600)

  await clickButton(page, 'Start recording')
  await snapshot(page, '02-recorder-setup')
  await page.type('input[placeholder="Example: Fix authentication redirect"]', 'Ship the multi-project recorder', { delay: 35 })
  await page.select('main select', 'codex')
  await sleep(700)
  await clickButton(page, 'Start recording')
  await snapshot(page, '03-recorder-active')

  await addEvent(page, 'User', 'Make recording obvious and let people switch between project vaults.')
  await addEvent(page, 'Agent', 'Added a native recorder, onboarding, and a persistent project switcher.')
  await addEvent(page, 'Decision', 'Keep Desktop and CLI on the same local Markdown session format.')
  await addEvent(page, 'Task', 'Publish the v1.6.0 Windows and Linux installers.')
  await addEvent(page, 'Problem', 'Old session metadata comments appeared in the visible timeline; parser fixed.')
  await snapshot(page, '04-recorder-events')
  await sleep(1400)

  await clickButton(page, 'Finish & save')
  await page.waitForFunction(() => window.location.hash.startsWith('#/sessions/'), { timeout: 15000 })
  await snapshot(page, '05-session-detail')
  await sleep(1500)

  await route(page, '#/sessions')
  await snapshot(page, '06-sessions')
  await sleep(1200)

  await route(page, '#/settings')
  await snapshot(page, '07-multi-project-settings')
  await sleep(1600)

  await route(page, '#/')
  await snapshot(page, '08-dashboard-complete')
  await sleep(1200)

  await recorder.stop()

  const conversion = spawnSync(ffmpegPath, [
    '-y', '-i', videoPath,
    '-vf', 'scale=1280:720',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '19',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-an', mp4Path,
  ], { stdio: 'pipe' })
  if (conversion.status !== 0) throw new Error(conversion.stderr.toString())

  copyFileSync(mp4Path, landingVideoPath)
  console.log(`Recorded ${videoPath}`)
  console.log(`Campaign MP4 ${mp4Path}`)
  console.log(`Landing MP4 ${landingVideoPath}`)
  console.log(`Screenshots ${screenshotsDir}`)
} finally {
  try {
    const page = (await browser.pages())[0]
    if (page && originalProject) {
      await page.evaluate(async ({ originalProject, demoProject }) => {
        await window.contextVault.switchProject(originalProject)
        await window.contextVault.removeProject(demoProject)
      }, { originalProject, demoProject })
    }
  } catch (error) {
    console.error('Demo project cleanup in Desktop settings failed:', error)
  }
  browser.disconnect()
  rmSync(demoProject, { recursive: true, force: true })
}
