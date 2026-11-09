// "IPC" in `ipcMain` stands for "Inter-Process Communication"
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

function createWindow() {
  const window = new BrowserWindow({
    width: 1920,
    height: 1080,
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

  const menuTemplate: Array<Electron.MenuItemConstructorOptions | Electron.MenuItem> = [
    {
      label: "File",
      submenu: [
        { role: "quit" }
      ]
    },
    {
      label: "Debug",
      submenu: [
        {
          label: "DEVELOPER ONLY",
          type: "header"
        },
        {
          label: "Game Breaking May Occur",
          type: "normal"
        },
        {
          label: "Toggle Hitboxes",
          type: "checkbox",
          checked: false,
          accelerator: "CmdOrCtrl+H",
          click: (menuItem) => {
            window.webContents.send("toggle-hitboxes", menuItem.checked);
          }
        }
      ]
    },
    // {
    //   label: "Edit",
    //   submenu: [
    //     { role: "undo" },
    //     { role: "redo" },
    //     { type: "separator" },
    //     { role: "cut" },
    //     { role: "copy" },
    //     { role: "paste" },
    //     { role: "delete" },
    //     { type: "separator" },
    //     { role: "selectAll" }
    //   ]
    // },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" }, // Actual Size
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { role: "close" }
      ]
    },
    {
      label: "Help",
      submenu: [
        { role: "about" },
        // { role: "learnMore" }, // Doesn't Exist - Electron preset
        // { role: "documentation" }, // Doesn't Exist - Electorn preset
        // { role: "communityDiscussions"}, // Doesn't Exist - Electron preset
        // { role: "searchIssues"}, // Doesn't Exist - Electron preset
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

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