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
    },

    onToggleHitboxes: (callback: (show: boolean) => void) => {
      const subscription = (_event: any, show: boolean) => callback(show);
      ipcRenderer.on("toggle-hitboxes", subscription);

      return () => {
        ipcRenderer.removeListener("toggle-hitboxes", subscription);
      };
    }
  }
);