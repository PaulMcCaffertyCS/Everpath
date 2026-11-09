import { useEffect, useState } from "react";
import type { GameState } from "../../../shared/types";
import { decryptSave, encryptSave } from "../../game/save";
import "./settings-menu.css";

interface Settings {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  showDamageNumbers: boolean;
}

const SETTINGS_STORAGE_KEY = "everpath-settings";
const DEFAULT_SETTINGS: Settings = {
  musicEnabled: true,
  soundEffectsEnabled: true,
  showDamageNumbers: true
};

function isSettings(value: unknown): value is Settings {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "musicEnabled" in value
    && typeof value.musicEnabled === "boolean"
    && "soundEffectsEnabled" in value
    && typeof value.soundEffectsEnabled === "boolean"
    && "showDamageNumbers" in value
    && typeof value.showDamageNumbers === "boolean";
}

interface SettingsMenuProps {
  showSettingsMenu: boolean;
  gameState: GameState;
  onImportSave: (gameState: GameState) => void;
  onBack: () => void;
  onClose: () => void;
}

const SettingsMenu = ({ showSettingsMenu, gameState, onImportSave, onBack, onClose }: SettingsMenuProps) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    try {
      const savedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings === null) {
        return;
      }

      const parsedSettings: unknown = JSON.parse(savedSettings);
      if (!isSettings(parsedSettings)) {
        setStatus("Saved settings could not be loaded.");
        return;
      }

      setSettings(parsedSettings);
    } catch (error) {
      console.error("Could not load settings.", error);
      setStatus("Could not load saved settings.");
    }
  }, []);

  function saveSettings() {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setStatus("Settings saved.");
    } catch (error) {
      console.error("Could not save settings.", error);
      setStatus("Could not save settings.");
    }
  }

  async function exportSave() {
    if (!password) {
      setStatus("Enter a save password first.");
      return;
    }

    try {
      const encryptedSave = await encryptSave(gameState, password);
      const path = await window.electronAPI.saveTextFile("everpath-save.txt", encryptedSave);
      setStatus(path ? `Save exported: ${path}` : "Export cancelled.");
    } catch (error) {
      console.error("Could not export save.", error);
      setStatus("Could not export save.");
    }
  }

  async function importSave() {
    if (!password) {
      setStatus("Enter a save password first.");
      return;
    }

    try {
      const text = await window.electronAPI.openTextFile();
      if (!text) {
        setStatus("Import cancelled.");
        return;
      }

      const importedGameState = await decryptSave(text, password);
      onImportSave(importedGameState);
      setStatus("Save imported.");
    } catch (error) {
      console.error("Could not import save.", error);
      setStatus("Could not decrypt or import that save.");
    }
  }

  return (
    <section className={`settings-menu-panel ${showSettingsMenu ? "open" : ""}`} aria-label="Settings">
      {/* <button
        className="settings-menu-back"
        type="button"
        aria-label="Back to stats"
        onClick={onBack}
      >
        {"<"}
      </button> */}
      <button
        className="settings-menu-close"
        type="button"
        aria-label="Close settings and stats"
        onClick={onBack}
      >
        ×
      </button>
      <div className="settings-menu-content" style={{ scrollbarWidth: "none" }}>
        <label className="settings-menu-password">
          <span>Save password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={event => {
              setPassword(event.target.value);
              setStatus("");
            }}
          />
        </label>
        <section className="settings-menu-save-section" aria-labelledby="save-section-heading">
          <h2 id="save-section-heading">Save</h2>
          <div className="settings-menu-save-actions">
            <button type="button" onClick={importSave}>Import save</button>
            <button type="button" onClick={exportSave}>Export save</button>
          </div>
        </section>
        <hr />
        <h2>Settings</h2>
        <label className="settings-menu-option">
          <span>Music (placeholder)</span>
          <input
            type="checkbox"
            checked={settings.musicEnabled}
            onChange={event => {
              setSettings(current => ({ ...current, musicEnabled: event.target.checked }));
              setStatus("");
            }}
          />
        </label>
        <label className="settings-menu-option">
          <span>Sound effects (placeholder)</span>
          <input
            type="checkbox"
            checked={settings.soundEffectsEnabled}
            onChange={event => {
              setSettings(current => ({ ...current, soundEffectsEnabled: event.target.checked }));
              setStatus("");
            }}
          />
        </label>
        <label className="settings-menu-option">
          <span>Show damage numbers (placeholder)</span>
          <input
            type="checkbox"
            checked={settings.showDamageNumbers}
            onChange={event => {
              setSettings(current => ({ ...current, showDamageNumbers: event.target.checked }));
              setStatus("");
            }}
          />
        </label>
        <div className="settings-menu-save-area">
          <span className="settings-menu-status" role="status">{status}</span>
          <button className="settings-menu-save" type="button" onClick={saveSettings}>
            Save settings
          </button>
        </div>
      </div>
    </section>
  );
};

export default SettingsMenu;
