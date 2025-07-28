import { app, BrowserWindow } from "electron";
import serve from "electron-serve";
import path from "path";

const __dirname = path.dirname(
  new URL(import.meta.url).pathname.substring(
    process.platform === "win32" ? 1 : 0
  )
);

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, "../../out"),
    })
  : null;

let mainWindow;

const createMainWindow = (splashWindow) => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // <-- Use the bundled .js file
    },
  });
  // Simulate loading progress
  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 10, 90);
    // Send progress to the splash window, which we know exists
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.webContents.send("update-progress", progress);
    }
  }, 200);

  mainWindow.webContents.on("did-finish-load", () => {
    clearInterval(interval);
    splashWindow.webContents.send("progress-update", 100);

    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
      mainWindow.show();
    }, 500);
  });

  if (app.isPackaged) {
    appServe(mainWindow).then(() => {
      mainWindow.loadURL("app://-");
    });
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.on("did-fail-load", () => {
      mainWindow.webContents.reloadIgnoringCache();
    });
  }
};

const createSplashWindow = () => {
  const splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // <-- Use the bundled .js file
    },
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html"));

  // Optional: Open DevTools for the splash screen to see console messages during development
  //   splashWindow.webContents.openDevTools({ mode: "detach" });

  // Create the main window ONLY after the splash screen is ready
  splashWindow.webContents.on("did-finish-load", () => {
    createMainWindow(splashWindow);
  });
};

app.on("ready", () => {
  createSplashWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
