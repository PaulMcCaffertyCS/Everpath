import { CHUNK_TILES } from "../../shared/declarations";
import { PLAYER_SIZE } from "../../shared/types";
import type { GameState } from "../../shared/types";
import SimplePoint from "../../utils/typescript/SimplePoint";
import TileRect from "../../utils/typescript/TileRect";

function createNewGame(): GameState {
  const now = Date.now();

  return {
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    player: {
      name: "Tester",
      race: "human",
      classes: ["swordsman"],
      level: 1,
      experience: 0,
      hp: 30,
      attack: {
        strength: 1,
        range: 1,
        speed: 1,
        type: "physical"
      },
      defense: {
        physical: 0,
        magical: 0
      },
      mana: 0,
      movementSpeed: 6,
      position: new SimplePoint(12, 12),
      direction: "down",
      discoveredTownCount: 0,
      skills: {
        swordsmanship: 1,
        exploration: 1,
        manaStudy: 0
      },
      rendering: {
        size: PLAYER_SIZE,
        hitbox: TileRect.fromPointAndSize(new SimplePoint(0, 0), PLAYER_SIZE)
      }
    },
    mobs: [],
    world: {
      seed: Math.floor(Math.random() * 0xffffffff),
      chunkSize: CHUNK_TILES,
      discovered: {},
      currentChunkKey: "0,0"
    }
  };
}

export { createNewGame };