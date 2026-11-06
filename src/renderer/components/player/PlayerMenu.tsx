import "./player-menu.css";
import type { GameState } from "../../../shared/types"
import { characterSpriteDown } from "../../../utils/ImageUtils";
import StatsMenu from "./StatsMenu";
import { useState } from "react";

const MAX_COLUMNS = 6;

interface PlayerMenuProps {
  gameState: GameState;
  onImportSave: (gameState: GameState) => void;
  showPlayerMenu: boolean;
  setShowPlayerMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const PlayerMenu = ({ gameState, onImportSave, showPlayerMenu, setShowPlayerMenu }: PlayerMenuProps) => {
  const [showStatsMenu, setShowStatsMenu] = useState(false);
  const player = gameState.player;

  const smallList = ["one", "two", "three"];
  const bigList = [
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fiveteen", "sixteen", "seventeen", "eightteen", "nineteen", "twenty",
    "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five"
  ];
  const actualList = ["stats", "skills", "classes"];
  const items = actualList;

  const columnCount = Math.min(Math.max(items.length, 1), MAX_COLUMNS);

  const onClickCloseButton = () => {
    setShowPlayerMenu(false);
  }

  const onClickItem = (item: string) => {
    if (item === "stats") {
      setShowPlayerMenu(false);
      setShowStatsMenu(true);
    }
  }

  return (
    <>
      <div className={`player-menu-panel ${showPlayerMenu ? "open" : ""}`}>
        <button
          className="player-menu-close"
          type="button"
          aria-label="Close player menu"
          onClick={onClickCloseButton}
        >
          ×
        </button>
        <div
          className="player-menu"
          style={{
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            scrollbarWidth: "none"
          }}
        >
          {items.map((item, index) => {
            return <div
              key={`item-${index}`}
              className="player-menu-item"
              onClick={() => onClickItem(item)}
            >
              <img
                className="player-menu-item-icon"
                src={characterSpriteDown}
                alt=""
              />
              <h5>{item}</h5>
            </div>
          })}
        </div>
      </div>
      <StatsMenu
        gameState={gameState}
        onImportSave={onImportSave}
        setShowPlayerMenu={setShowPlayerMenu}
        showStatsMenu={showStatsMenu}
        setShowStatsMenu={setShowStatsMenu}
      />
    </>
  )
}

export default PlayerMenu;