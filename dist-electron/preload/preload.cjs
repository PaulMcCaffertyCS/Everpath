"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    saveTextFile: (defaultName, contents) => {
        return electron_1.ipcRenderer.invoke("save-text-file", defaultName, contents);
    },
    openTextFile: () => {
        return electron_1.ipcRenderer.invoke("open-text-file");
    },
    onToggleHitboxes: (callback) => {
        const subscription = (_event, show) => callback(show);
        electron_1.ipcRenderer.on("toggle-hitboxes", subscription);
        return () => {
            electron_1.ipcRenderer.removeListener("toggle-hitboxes", subscription);
        };
    },
    onToggleTownBoundaries: (callback) => {
        const subscription = (_event, show) => callback(show);
        electron_1.ipcRenderer.on("toggle-town-boundaries", subscription);
        return () => {
            electron_1.ipcRenderer.removeListener("toggle-town-boundaries", subscription);
        };
    },
    onToggleDebugOverlay: (callback) => {
        const subscription = (_event, show) => callback(show);
        electron_1.ipcRenderer.on("toggle-debug-overlay", subscription);
        return () => {
            electron_1.ipcRenderer.removeListener("toggle-debug-overlay", subscription);
        };
    }
});
