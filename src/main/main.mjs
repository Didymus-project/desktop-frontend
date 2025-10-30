import { app, BrowserWindow } from "electron";
import serve from "electron-serve";
import path from "path";

const PROTOCOL = "didymus";

const __dirname = path.dirname(
  new URL(import.meta.url).pathname.substring(
    process.platform === "win32" ? 1 : 0
  )
);

if (!app.isDefaultProtocolClient(PROTOCOL)) {
  // If we are in development, we need to pass the execPath and args
  // to ensure Electron, not the app, is registered.
  const args = [];
  if (!app.isPackaged && process.platform === "win32") {
    args.push(path.resolve(process.argv[1]));
  }
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args);
}

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, "../../out"),
    })
  : null;

let mainWindow;

let createMainWindow = (splashRef) => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // Simulate loading progress
  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 10, 90);
    // Send progress to the splash window, which we know exists
    if (splashRef && !splashRef.isDestroyed()) {
      splashRef.webContents.send("update-progress", progress);
    } else {
      clearInterval(interval);
    }
  }, 200);

  mainWindow.once("ready-to-show", () => {
    clearInterval(interval); // Ensure interval is stopped

    // Try to send final progress and close splash
    if (splashRef && !splashRef.isDestroyed()) {
      try {
        splashRef.webContents.send("progress-update", 100);
        // Close splash *before* showing main window
        splashRef.close();
      } catch (error) {
        console.error("Error sending final progress or closing splash:", error);
        // Proceed to show main window even if splash interaction failed
      }
    }
    // Show the main window regardless of splash status at this point
    mainWindow.show();
  });

  if (app.isPackaged) {
    appServe(mainWindow).then(() => {
      mainWindow.loadURL("app://-");
    });
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        console.error(
          `Main window failed to load: ${errorDescription} (Code: ${errorCode})`
        );
      }
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

let createSplashWindow = () => {
  let splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html"));

  // Show splash only when it's ready
  splashWindow.once("ready-to-show", () => {
    splashWindow.show();
    // Create the main window, passing the splash reference
    createMainWindow(splashWindow);
  });

  // Handle splash closure
  splashWindow.on("closed", () => {
    splashWindow = null; // Clear reference
    // If main window exists but isn't visible (e.g., splash closed early), show it.
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      console.warn(
        "Splash closed before main window ready. Force showing main window."
      );
      mainWindow.show();
    }
  });
};

let deeplinkUrl = null; // Store the URL if app launched via protocol

// Handle the protocol link activation
const handleDeepLink = (url) => {
  if (!url || !url.startsWith(`${PROTOCOL}://`)) {
    return;
  }
  console.log("Received deep link:", url);
  deeplinkUrl = url; // Store it

  // If the main window exists, send the URL to it
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("deep-link-received", url);
    mainWindow.focus(); // Bring window to front
    deeplinkUrl = null; // Reset after sending
  }
  // If the window doesn't exist yet (app was closed), createSplashWindow will eventually
  // create mainWindow, and we'll send the URL once mainWindow is ready (modified below)
};

// Ensure only one instance runs and pass protocol URL if launched again
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, maybe via protocol link.
    // Find the URL in command line args
    const url = commandLine.find((arg) => arg.startsWith(`${PROTOCOL}://`));
    if (url) {
      handleDeepLink(url);
    } else if (mainWindow) {
      // Just focus the existing window if launched without a URL
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// macOS specific event for opening URL
app.on("open-url", (event, url) => {
  event.preventDefault(); // Prevent default browser behavior
  handleDeepLink(url);
});

// Modify createMainWindow to send the stored deeplinkUrl if it exists
const originalCreateMainWindow = createMainWindow; // Keep original reference
createMainWindow = (splashRef) => {
  originalCreateMainWindow(splashRef); // Call the original function

  // After window is created, check if we have a pending deeplinkUrl
  if (deeplinkUrl && mainWindow && !mainWindow.isDestroyed()) {
    // Send it once the content is loaded to be safe
    mainWindow.webContents.once("did-finish-load", () => {
      if (mainWindow && !mainWindow.isDestroyed() && deeplinkUrl) {
        console.log("Sending stored deep link to renderer:", deeplinkUrl);
        mainWindow.webContents.send("deep-link-received", deeplinkUrl);
        deeplinkUrl = null; // Reset after sending
      }
    });
  }
};

// --- End Custom Protocol Handling ---

app.on("ready", () => {
  createSplashWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    // Decide whether to show splash again or just main window
    createSplashWindow(); // Or createMainWindow(null) if splash is only for first launch
  }
});
