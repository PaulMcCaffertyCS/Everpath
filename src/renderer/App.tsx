import "./styles/app.css";
import { useEffect, useState } from "react";
import GameCanvas from "./components/GameCanvas";
import PlayerMenu from "./components/player/PlayerMenu";
import GameEngine from "./game/engine";
import { createNewGame } from "./game/state";
import { slimeSpriteDown } from "../utils/ImageUtils";

export default function App() {
  const [engine] = useState(() => new GameEngine(createNewGame()));
  const [, forceRender] = useState(0);
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);

  useEffect(() => {
    const renderInterval = window.setInterval(() => {
      return forceRender(value => value + 1)
    }, 250);

    return () => clearInterval(renderInterval);
  }, []);

  const state = engine.state;

  return (
    <main className="app">
      <div className="game-canvas">
        <GameCanvas
          engine={engine}
          onSwipeOpenPlayerMenu={() => setShowPlayerMenu(true)}
        />
      </div>
      <div className="game-canvas-overlay">
        <PlayerMenu
          gameState={state}
          onImportSave={importedState => {
            engine.state = importedState;
            forceRender(value => value + 1);
          }}
          showPlayerMenu={showPlayerMenu}
          setShowPlayerMenu={setShowPlayerMenu}
        />

        {/* <header className="topbar">
          <div>
            <h1>
              Everpath
            </h1>

            <p>d
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
              {Object.keys(state.world.discovered).length}
            </strong>

            <div className="muted top-margin">
              Chunk biome
            </div>

            <strong>
              {function () {
                const playerPosition = state.player.position;
                const cx = Math.floor(playerPosition.x / CHUNK_TILES);
                const cy = Math.floor((playerPosition.y + 0.75) / CHUNK_TILES);
                const chunk = state.world.discovered[`${cx},${cy}`];
                if (!chunk) {
                  setStatus(`chunk [${cx},${cy}] does not exist`);
                  return "ERROR";
                }

                return chunk.biome;
              }()}
            </strong>
          </aside>

          <section className="game-area">
            <div className="status">
              {status}
            </div>

            <div className="help">
              WASD / Arrow Keys to explore
            </div>
          </section>
        </section> */}
      </div>
    </main>
  );
}