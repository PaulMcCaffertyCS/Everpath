import "./stats-menu.css";
import type { GameState } from "../../../shared/types"
import { characterSpriteDown } from "../../../utils/ImageUtils";
import { useState } from "react";
import SettingsMenu from "./SettingsMenu";

interface StatsMenuProps {
  gameState: GameState;
  onImportSave: (gameState: GameState) => void;
  setShowPlayerMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showStatsMenu: boolean;
  setShowStatsMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const StatsMenu = ({ gameState, onImportSave, setShowPlayerMenu, showStatsMenu, setShowStatsMenu }: StatsMenuProps) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const player = gameState.player;
  const experienceNeeded = player.level * 25;
  const experiencePercent = Math.min(
    100,
    Math.max(0, (player.experience / experienceNeeded) * 100)
  );

  const onClickBackButton = () => {
    setShowStatsMenu(false);
    setShowPlayerMenu(true);
  }

  const onClickCloseButton = () => {
    setShowStatsMenu(false);
  }

  return (
    <>
      <div className={`stats-menu-panel ${showStatsMenu ? "open" : ""}`}>
        <button
          className="stats-menu-back"
          type="button"
          aria-label="Go back"
          onClick={onClickBackButton}
        >
          {"<"}
        </button>
        <button
          className="stats-menu-close"
          type="button"
          aria-label="Close stats menu"
          onClick={onClickCloseButton}
        >
          ×
        </button>
        <div className="stats-menu">
          <div className="stats-menu-header">
            <img
              className="stats-menu-avatar"
              src={characterSpriteDown}
              alt={`${player.name} avatar`}
            />
            <div className="stats-menu-player-info">
              <div className="stats-menu-player-name">{player.name}</div>
              <div className="stats-menu-player-race">{player.race}</div>
            </div>
          </div>
          <div className="stats-menu-footer">
            <div className="stats-menu-leveling">
              <div className="stats-menu-level">Level {player.level}</div>
              <div className="stats-menu-experience">
                <div
                  className="stats-menu-xp"
                  role="progressbar"
                  aria-label="Experience"
                  aria-valuemin={0}
                  aria-valuemax={experienceNeeded}
                  aria-valuenow={Math.min(player.experience, experienceNeeded)}
                >
                  <div
                    className="stats-menu-xp-fill"
                    style={{ width: `${experiencePercent}%` }}
                  />
                </div>
                <span className="stats-menu-xp-label">
                  {Math.floor(player.experience)} / {experienceNeeded} XP
                </span>
              </div>
            </div>
            <button
              className="stats-menu-settings"
              type="button"
              onClick={() => setShowSettingsMenu(true)}
              aria-label="Open settings"
            >
              ⚙
            </button>
          </div>
        </div>
      </div>
      <SettingsMenu
        showSettingsMenu={showSettingsMenu}
        gameState={gameState}
        onImportSave={onImportSave}
        onBack={() => setShowSettingsMenu(false)}
        onClose={() => {
          setShowSettingsMenu(false);
          setShowStatsMenu(false);
        }}
      />
    </>
  )
}

export default StatsMenu;