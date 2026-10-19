import { useEffect, useState } from "react";
import GameCanvas from "./components/GameCanvas";
import GameEngine from "./game/engine";
import { createNewGame } from "./game/state";
import { decryptSave, encryptSave } from "./game/save";
import "./styles/app.css";

export default function App() {
  const [engine] = useState(() => new GameEngine(createNewGame()));
  const [, forceRender] = useState(0);
  const [status, setStatus] = useState("New adventure");
  const [ password, setPassword] = useState("");

  useEffect(() => {
    const renderInterval = window.setInterval(() => {
      return forceRender(value => value + 1)
    }, 250);

    return () => clearInterval(renderInterval);
  }, []);

  const state = engine.state;

  const xpNeeded = state.player.level * 25;

  async function exportSave() {
    if (!password) {
      setStatus("Enter a save password first.");
      return;
    }

    const save = await encryptSave(state, password);
    // TODO: Include datetime in save name. E.g. "everpath-save_10-16-2026_3-45-pm.txt"
    const path = await window.electronAPI.saveTextFile("everpath-save.txt", save);

    setStatus(path ? `Saved: ${path}` : "Export cancelled");
  }

  async function importSave() {
    if (!password) {
      setStatus("Enter the save password first.");
      return;
    }

    try {
      const text = await window.electronAPI.openTextFile();
      if (!text) {
        return;
      }

      const loaded = await decryptSave(text, password);
      engine.state = loaded;
      setStatus("Save imported.");
    } catch {
      setStatus("Could not decrypt that save.");
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>
            Everpath
          </h1>

          <p>
            Code-first procedural RPG
          </p>
        </div>

        <div className="save-tools">
          <input
            type="password"
            placeholder="Save password"
            value={password}
            onChange={event =>
              setPassword(
                event.target.value
              )
            }
          />

          <button
            onClick={exportSave}
          >
            Export .txt
          </button>

          <button
            onClick={importSave}
          >
            Import .txt
          </button>
        </div>
      </header>

      <section className="layout">
        <aside className="panel">
          <h2>
            {state.player.name}
          </h2>

          <div className="muted">
            {state.player.race}{" "}
            {state.player.classes}
          </div>

          <div className="stat">
            <span>
              Level
            </span>

            <strong>
              {state.player.level}
            </strong>
          </div>

          <div className="bar">
            <i
              style={{
                width: `${Math.min(100, state.player.experience / xpNeeded * 100)}%`
              }}
            />
          </div>

          <div className="muted">
            XP{" "}
            {Math.floor(state.player.experience)}{" "} / {xpNeeded}
          </div>

          <hr />

          <h3>
            Skills
          </h3>

          {Object.entries(state.player.skills).map(
            ([name, value]) => (
              <div
                className="stat"
                key={name}
              >
                <span>
                  {name}
                </span>

                <strong>
                  {value}
                </strong>
              </div>
            )
          )}

          <hr />

          <div className="muted">
            World seed
          </div>

          <code>
            {state.world.seed}
          </code>

          <div className="muted">
            Chunks generated
          </div>

          <strong>
            {
              Object.keys(
                state.world
                  .discovered
              ).length
            }
          </strong>
        </aside>

        <section className="game-area">
          <GameCanvas
            engine={engine}
          />

          <div className="status">
            {status}
          </div>

          <div className="help">
            WASD / Arrow Keys to explore
          </div>
        </section>
      </section>
    </main>
  );
}