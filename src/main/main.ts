// "IPC" in `ipcMain` stands for "Inter-Process Communication"
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

function createWindow() {
  const window = new BrowserWindow({
    width: 1920,
    height: 1200,
    backgroundColor: "#111318",
    webPreferences: {
      preload: path.join(
        __dirname,
        "../preload/preload.js"
      ),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (app.isPackaged) {
    window.loadFile(
      path.join(
        __dirname,
        "../../dist/index.html"
      )
    );
  } else {
    console.log("Load window in url");
    window.loadURL(
      "http://127.0.0.1:5173"
    );
  }
}

ipcMain.handle(
  "save-text-file",
  async (
    _event,
    defaultName: string,
    contents: string
  ) => {
    const result = await dialog.showSaveDialog({
      title: "Export Save",
      defaultPath: defaultName,
      filters: [
        {
          name: "Adventure Save",
          extensions: ["txt"]
        }
      ]
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    await fs.writeFile(result.filePath, contents, "utf8");
    return result.filePath;
  }
);

ipcMain.handle(
  "open-text-file",
  async () => {
    const result = await dialog.showOpenDialog({
      title: "Import Save",
      properties: ["openFile"],
      filters: [
        {
          name: "Adventure Save",
          extensions: ["txt"]
        }
      ]
    });

    return (result.canceled || !result.filePaths[0]) ? null : fs.readFile(result.filePaths[0], "utf8");
  }
);

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on(
  "window-all-closed",
  () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }
);