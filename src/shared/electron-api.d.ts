export {};

declare global {
  interface Window {
    electronAPI: {
      saveTextFile: (defaultName: string, contents: string) => Promise<string | null>;
      openTextFile: () => Promise<string | null>;
    };
  }
}