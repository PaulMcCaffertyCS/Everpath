"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    saveTextFile: (defaultName, contents) => {
        return electron_1.ipcRenderer.invoke("save-text-file", defaultName, contents);
    },
    openTextFile: () => {
        return electron_1.ipcRenderer.invoke("open-text-file");
    }
});
