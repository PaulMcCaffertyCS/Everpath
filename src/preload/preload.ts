import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld(
  "electronAPI",
  {
    saveTextFile: (
      defaultName: string,
      contents: string
    ) => {
      return ipcRenderer.invoke(
        "save-text-file",
        defaultName,
        contents
      );
    },

    openTextFile: () => {
      return ipcRenderer.invoke(
        "open-text-file"
      );
    }
  }
);