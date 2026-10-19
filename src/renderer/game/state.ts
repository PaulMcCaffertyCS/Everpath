import type { Direction, GameState } from "../../shared/types";

function createNewGame(): GameState {
  const now = Date.now();

  return {
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    player: {
      name: "Hero",
      race: "human",
      classes: ["swordsman"],
      level: 1,
      experience: 0,
      hp: 30,
      maxHp: 30,
      mana: 0,
      maxMana: 0,
      position: {
        x: 12,
        y: 12
      },
      direction: "down",
      discoveredTownCount: 0,
      skills: {
        swordsmanship: 1,
        exploration: 1,
        manaStudy: 0
      }
    },
    world: {
      seed: Math.floor(Math.random() * 0xffffffff),
      chunkSize: 24,
      discovered: {},
      currentChunkKey: "0,0"
    }
  };
}

export { createNewGame };