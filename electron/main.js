const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;
const PORT = process.env.JARVIS_PORT || 3000;
const DEV_URL = `http://localhost:${PORT}`;

let mainWindow = null;
let nextProcess = null;

function startNextServer() {
  return new Promise((resolve, reject) => {
    const nextBin = path.join(
      __dirname,
      "..",
      "node_modules",
      ".bin",
      process.platform === "win32" ? "next.cmd" : "next"
    );
    nextProcess = spawn(nextBin, ["start", "-p", String(PORT)], {
      cwd: path.join(__dirname, ".."),
      stdio: "pipe",
      shell: process.platform === "win32",
    });

    nextProcess.stdout.on("data", (data) => {
      const text = data.toString();
      process.stdout.write(text);
      if (text.includes("Ready") || text.includes("ready")) resolve();
    });
    nextProcess.stderr.on("data", (data) => process.stderr.write(data.toString()));
    nextProcess.on("error", reject);

    // fallback resolve in case "Ready" string format changes
    setTimeout(resolve, 4000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: !isDev,
    frame: isDev,
    backgroundColor: "#0A0A0C",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(DEV_URL);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  if (!isDev) {
    await startNextServer();
  }

  createWindow();

  globalShortcut.register("Escape", () => {
    if (mainWindow?.isFullScreen()) mainWindow.setFullScreen(false);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  if (nextProcess) nextProcess.kill();
});
