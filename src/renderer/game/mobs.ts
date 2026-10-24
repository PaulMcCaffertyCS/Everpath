import type { MobSpecies, MobBase, Mob, Player } from "../../shared/types";
import { generateUuid } from "../../utils/UuidUtils";

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
      width: 40,
      height: 34
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
      width: 26,
      height: 32
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
      width: 24,
      height: 22
    }
  }
}

function createGoblin(player: Player): Mob {
  const uuid = generateUuid();
  return {
    id: uuid,
    base: mobDefinitions["goblin"],
    name: uuid,
    position: player.position.shiftY(10),
    direction: "up",
      
    interactions: {
      taming: {
        isTamed: false
      }
    }
  }
}

function createSlime(player: Player): Mob {
  const uuid = generateUuid();
  return {
    id: uuid,
    base: mobDefinitions["slime"],
    name: uuid,
    position: player.position.shiftY(10),
    direction: "up",
      
    interactions: {
      taming: {
        isTamed: false
      }
    }
  }
}

export { mobDefinitions };
export { createGoblin, createSlime };