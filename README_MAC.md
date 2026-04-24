# Voltaire on Mac

## Quick Start (5 minutes)

### Step 1 — Copy the Voltaire folder to your Mac
Put the `voltaire` folder anywhere you like — Desktop, Documents, wherever.

### Step 2 — Make the scripts executable
Open Terminal (press `⌘ Space`, type "Terminal") and run:
```bash
chmod +x ~/Desktop/voltaire/start.sh
chmod +x ~/Desktop/voltaire/tunnel.sh
chmod +x ~/Desktop/voltaire/install_mac.sh
```
Replace `~/Desktop/voltaire` with wherever you put the folder.

### Step 3 — Run the setup script (first time only)
```bash
~/Desktop/voltaire/install_mac.sh
```
This installs Python, Node.js, and all packages automatically. Takes ~5 minutes. Only needed once.

### Step 4 — Add your Gemini API key
1. Go to https://aistudio.google.com → Get API Key → free tier
2. Open `voltaire/.env` in any text editor
3. Add your key: `CATO_GEMINI_KEY=your_key_here`

### Step 5 — Launch Voltaire
```bash
~/Desktop/voltaire/start.sh
```
Or double-click `start.sh` in Finder.

Browser opens automatically at **http://localhost:3000**

---

## Access from your phone (same WiFi)

After `start.sh` shows your local IP (e.g. `192.168.1.5`), open:
```
http://192.168.1.5:3000
```
on your phone while connected to the same WiFi.

## Access from anywhere (Cloudflare Tunnel)

`start.sh` now auto-starts a Cloudflare tunnel by default and prints:
```bash
Anywhere: https://xxx-xxx.trycloudflare.com
```
Open that URL on your phone from any network, as long as Voltaire is running on your Mac.

Manual mode (optional):
```bash
~/Desktop/voltaire/tunnel.sh
```
Disable auto-tunnel for one launch:
```bash
VOLTAIRE_ANYWHERE=0 ./start.sh
```

---

## Requirements

| Tool | Version | Install |
|---|---|---|
| Python | 3.10+ | `brew install python` or python.org |
| Node.js | 18+ LTS | `brew install node` or nodejs.org |
| Homebrew | any | `brew.sh` (optional but easiest) |

Homebrew is a free package manager for Mac — makes installing Python and Node a single command. The setup script installs it automatically if you don't have it.

---

## Troubleshooting

**"Permission denied" when running start.sh**
```bash
chmod +x start.sh && ./start.sh
```

**"Python not found"**
```bash
brew install python
# or download from python.org
```

**"Node not found"**
```bash
brew install node
# or download LTS from nodejs.org
```

**"Cannot reach backend"**
Make sure both Terminal windows are open (backend + frontend). Check that port 8000 isn't blocked.

**"Module not found" error**
```bash
python3 -m pip install fastapi "uvicorn[standard]" google-generativeai --break-system-packages
```

**Apple Silicon Mac (M1/M2/M3)**
Everything works natively. Homebrew installs to `/opt/homebrew/` on Apple Silicon — the setup script handles this automatically.

---

## Stopping Voltaire

Close the two Terminal windows that `start.sh` opened (the backend and frontend windows). Or press `Ctrl+C` in each.
