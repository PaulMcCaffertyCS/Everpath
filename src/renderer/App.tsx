import "./styles/app.css";
import { useEffect, useState } from "react";
import GameCanvas from "./components/GameCanvas";
import PlayerMenu from "./components/player/PlayerMenu";
import GameEngine from "./game/engine";
import { createNewGame } from "./game/state";
import DebugOverlay from "./components/DebugOverlay";

export default function App() {
  const [engine] = useState(() => new GameEngine(createNewGame()));
  const [, forceRender] = useState(0);
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);

  useEffect(() => {
    const hitboxesUnsubscribe = window.electronAPI.onToggleHitboxes((isChecked: boolean) => {
      engine.showHitboxes = isChecked;
    });

    const townBoundsUnsubscribe = window.electronAPI.onToggleTownBoundaries((isChecked: boolean) => {
      engine.showTownBounds = isChecked;
    });

    const overlayUnsubscribe = window.electronAPI.onToggleDebugOverlay((isChecked: boolean) => {
      setShowDebugOverlay(isChecked);
    });

    const renderInterval = window.setInterval(() => {
      return forceRender(value => value + 1)
    }, 250);

    return () => {
      hitboxesUnsubscribe();
      townBoundsUnsubscribe();
      overlayUnsubscribe();
      clearInterval(renderInterval);
    }
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
        <DebugOverlay
          world={state.world}
          player={state.player}
          showDebugOverlay={showDebugOverlay}
        />
        <PlayerMenu
          gameState={state}
          onImportSave={importedState => {
            engine.state = importedState;
            forceRender(value => value + 1);
          }}
          showPlayerMenu={showPlayerMenu}
          setShowPlayerMenu={setShowPlayerMenu}
        />
      </div>
    </main>
  );
}