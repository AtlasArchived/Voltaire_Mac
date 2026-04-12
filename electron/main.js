const { app, BrowserWindow, dialog } = require('electron')
const { spawn } = require('child_process')
const path = require('path')
const http = require('http')

const ROOT = path.resolve(__dirname, '..')
const FRONTEND_DIR = path.join(ROOT, 'frontend')
const APP_ICON = path.join(FRONTEND_DIR, 'public', 'icons', 'icon-512.png')
const BACKEND_PORT = 8000
const FRONTEND_PORT = 3000

let backendProc = null
let frontendProc = null
let mainWindow = null
let quitting = false

function run(cmd, args, cwd) {
  return spawn(cmd, args, {
    cwd,
    env: process.env,
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

  backendProc = run('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', String(BACKEND_PORT)], ROOT)
  wireLogs('backend', backendProc)

  // Start frontend in production if build exists, otherwise dev mode.
  const hasBuild = require('fs').existsSync(path.join(FRONTEND_DIR, '.next', 'BUILD_ID'))
  const frontArgs = hasBuild ? ['run', 'start'] : ['run', 'dev']
  frontendProc = run('npm', frontArgs, FRONTEND_DIR)
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
    icon: APP_ICON,
    autoHideMenuBar: true,
    backgroundColor: '#0d1117',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  })

  await mainWindow.loadURL(`http://127.0.0.1:${FRONTEND_PORT}`)
}

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
    if (process.platform === 'darwin' && app.dock) {
      try {
        app.dock.setIcon(APP_ICON)
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
