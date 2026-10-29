import { MOB_SIZES } from "../../shared/types.js";
import type { MobSpecies, MobBase } from "../../shared/types.js";
import SimplePoint from "../../utils/typescript/SimplePoint.js";
import TileCircle from "../../utils/typescript/TileCircle.js";
import TileRect from "../../utils/typescript/TileRect.js";

const mobDefinitions: Record<MobSpecies, MobBase> = {
  dragon: {
    species: "dragon",
    classes: ["warrior"],
    level: 5,
    hp: 50,
    attack: {
      strength: 10,
      range: 8,
      speed: 1,
      type: "physical"
    },
    defense: {
      physical: 10,
      magical: 10
    },
    mana: 10,
    movementSpeed: 3,
    aggroRange: 8,
    action: "idle",
    behavior: "wander",

    interactions: {
      relationship: "hostile",
      communication: {
        available: true,
        language: "dragonese"
      },
      taming: {
        available: true,
        difficulty: "deathly",
        method: "fight"
      },
    },

    rendering: {
      size: MOB_SIZES.dragon,
      hitbox: TileRect.fromPointAndSize(new SimplePoint(0, 0), MOB_SIZES.dragon)
    }
  },
  goblin: {
    species: "goblin",
    classes: ["warrior"],
    level: 1,
    hp: 15,
    attack: {
      strength: 2,
      range: 1,
      speed: 1,
      type: "physical"
    },
    defense: {
      physical: 2,
      magical: 0
    },
    mana: 0,
    movementSpeed: 1,
    aggroRange: 6,
    action: "idle",
    behavior: "wander",
    
    interactions: {
      relationship: "hostile",
      communication: {
        available: true,
        language: "goblinese"
      },
      taming: {
        available: false
      }
    },

    rendering: {
      size: MOB_SIZES.goblin,
      hitbox: TileRect.fromPointAndSize(new SimplePoint(0, 0), MOB_SIZES.goblin)
    }
  },
  slime: {
    species: "slime",
    classes: ["gatherer"],
    level: 1,
    hp: 10,
    attack: {
      strength: 1,
      range: 1,
      speed: 1,
      type: "physical"
    },
    defense: {
      physical: 1,
      magical: 1
    },
    mana: 1,
    movementSpeed: 1.1,
    aggroRange: 4,
    action: "idle",
    behavior: "wander",
    
    interactions: {
      relationship: "friendly",
      communication: {
        available: false
      },
      taming: {
        available: true,
        difficulty: "sayhi",
        method: "gifts"
      }
    },

    rendering: {
      size: MOB_SIZES.slime,
      hitbox: TileCircle.fromPointAndSize(new SimplePoint(0, 0), MOB_SIZES.slime)
    }
  }
}

export { mobDefinitions };