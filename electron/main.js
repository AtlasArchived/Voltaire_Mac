const { app, BrowserWindow, dialog } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const http = require('http')
const fs = require('fs')

const BACKEND_PORT = 8000
const FRONTEND_PORT = 3000

/** Project / packaged app root (electron lives in electron/) */
const appRoot = path.resolve(__dirname, '..')
const appFrontendDir = path.join(appRoot, 'frontend')
const appIconPath = path.join(appFrontendDir, 'public', 'icons', 'icon-512.png')

let backendProc = null
let frontendProc = null
let mainWindow = null
let quitting = false

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
  process.exit(0)
}

function loadDotEnv(dir) {
  if (!dir) return
  const p = path.join(dir, '.env')
  if (!fs.existsSync(p)) return
  const text = fs.readFileSync(p, 'utf8')
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (key && process.env[key] === undefined) process.env[key] = val
  }
}

function run(cmd, args, cwd, env) {
  return spawn(cmd, args, {
    cwd,
    env: env || process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function waitForUrl(url, timeoutMs = 30000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const probe = () => {
      const req = http.get(url, (res) => {
        res.resume()
        if (res.statusCode && res.statusCode < 500) {
          resolve(true)
        } else if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`))
        } else {
          setTimeout(probe, 400)
        }
      })
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`))
        } else {
          setTimeout(probe, 400)
        }
      })
      req.setTimeout(2000, () => req.destroy())
    }
    probe()
  })
}

function killProc(proc) {
  if (!proc || proc.killed) return
  try {
    proc.kill('SIGTERM')
  } catch {}
}

function wireLogs(name, proc) {
  if (!proc) return
  proc.stdout?.on('data', (d) => console.log(`[${name}] ${d.toString().trimEnd()}`))
  proc.stderr?.on('data', (d) => console.error(`[${name}] ${d.toString().trimEnd()}`))
}

async function startServices() {
  const external = process.env.VOLTAIRE_EXTERNAL_SERVER === '1'
  if (external) {
    await waitForUrl(`http://127.0.0.1:${BACKEND_PORT}/api/health`, 30000)
    await waitForUrl(`http://127.0.0.1:${FRONTEND_PORT}`, 45000)
    return
  }

  backendProc = run(
    'python3',
    ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', String(BACKEND_PORT)],
    appRoot
  )
  wireLogs('backend', backendProc)

  const hasBuild = fs.existsSync(path.join(appFrontendDir, '.next', 'BUILD_ID'))
  const frontArgs = hasBuild ? ['run', 'start'] : ['run', 'dev']
  const feEnv = {
    ...process.env,
    NODE_ENV: hasBuild ? 'production' : process.env.NODE_ENV || 'development',
  }
  frontendProc = run('npm', frontArgs, appFrontendDir, feEnv)
  wireLogs('frontend', frontendProc)

  await waitForUrl(`http://127.0.0.1:${BACKEND_PORT}/api/health`, 30000)
  await waitForUrl(`http://127.0.0.1:${FRONTEND_PORT}`, 45000)
}

async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    title: 'Voltaire',
    icon: appIconPath,
    autoHideMenuBar: true,
    backgroundColor: '#0d1117',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  })

  await mainWindow.loadURL(`http://127.0.0.1:${FRONTEND_PORT}`)
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('before-quit', () => {
  quitting = true
  killProc(frontendProc)
  killProc(backendProc)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && !quitting) createMainWindow().catch(() => {})
})

app.whenReady().then(async () => {
  try {
    if (app.isPackaged) {
      process.env.VOLTAIRE_DATA_DIR = app.getPath('userData')
    }
    loadDotEnv(appRoot)
    loadDotEnv(app.getPath('userData'))

    if (process.platform === 'darwin' && app.dock) {
      try {
        app.dock.setIcon(appIconPath)
      } catch (_) {}
    }
    await startServices()
    await createMainWindow()
  } catch (err) {
    dialog.showErrorBox(
      'Voltaire failed to start',
      `${err?.message || err}\n\nMake sure Python3 and Node are installed, then try again.`
    )
    app.quit()
  }
})
