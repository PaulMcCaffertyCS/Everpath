import SimplePoint from "../utils/typescript/SimplePoint.js";
import SimpleShape from "../utils/typescript/SimpleShape.js";
import SimpleSize from "../utils/typescript/SimpleSize.js";
import type TileCircle from "../utils/typescript/TileCircle.js";
import type TileRect from "../utils/typescript/TileRect.js";
import { zipToRecord } from "../utils/typescript/TypeScript.js";

/**
 * Const Declarations
 */
const PLAYER_SIZE = new SimpleSize(26, 32);
const PLAYER_HITBOX: SimpleShape = new SimpleShape("rectangle");
const MOB_SIZES: Record<MobSpecies, SimpleSize> = {
  "dragon": new SimpleSize(70, 52),
  "goblin": new SimpleSize(26, 32),
  "slime": new SimpleSize(24, 22)
};
const MOB_HITBOXES: Record<MobSpecies, SimpleShape> = {
  "dragon": new SimpleShape("rectangle"),
  "goblin": new SimpleShape("rectangle"),
  "slime": new SimpleShape("circle")
}
const PLAYER_RADIUS = 0.3;
const MOB_RADIUS = 0.28;

/**
 * Character Typing
 */
type CharacterRace = "beastman" | "elf" | "human" | "orc" | "troll" | "undead";

type CharacterRaceBeastmanVariant = "cat" | "dog" | "pig" | "wolf";

type CharacterRaceElfVariant = "dark" | "high";

type CharacterRaceUndeadVariant = "skeleton" | "vampire";

type CharacterClass = "alchemist" | "archer" | "assassin" | "farmer" | "herbalist" | "mage" | "ranger" | "rogue" | "scholar" | "thief" | "swordsman";

/**
 * Player Typing
 */
type Direction = "up" | "down" | "left" | "right";

type AttackType = "magical" | "physical";

type Attack = {
  strength: number;
  range: number;
  speed: number;
  type: AttackType;
}

type Defense = {
  physical: number;
  magical: number;
}


/**
 * Mob Typing
 */
type MobSpecies = "dragon" | "goblin" | "slime";

type MobDragonVariant = "fire" | "ice";

type MobGoblinVariant = "grunt" | "king" | "queen";

type MobClass = "archer" | "gatherer" | "hunter" | "warrior";

type MobLanguage = "dragonese" | "goblinese";

type MobAction = "attacking" | "chasing" | "idle" | "patrolling" | "wandering";

type MobBehavior = "idiot" | "patrol" | "wander";

type MobRelationship = "complicated" | "friendly" | "hostile";

type TamingDifficulty = "sayhi" | "easy" | "moderate" | "hard" | "extreme" | "deathly";

type TamingMethod = "fight" | "gifts" | "help" | "insult" | "taunt";

type MobAI = {
  wanderDirection: SimplePoint;
  wanderTimeRemaining: number;
  pauseTimeRemaining: number;
}

type MobSpawnRule = {
  speciesId: MobSpecies;
  weight: number;
  maxPerChunk: number;
}

/**
 * Town Typing
 */
type BuildingType = "house" | "hut" | "mansion";

type ShopType = "alchemy" | "dark" | "farm" | "forge" | "general" | "herbal" | "magic" | "music" | "restaurant" | "smithy";

/**
 * Biome Typing
 */
const biomes = ["dragontopia", "forest", "hills", "lake", "meadow", "mountains", "ruins", "swamp"] as const;
type BiomeType = typeof biomes[number];

const biomeColors = ["#29d9f0", "#24452f", "#4a4630", "#02678f", "#38533a", "#83807e", "#353338", "#293c36"] as const;
type BiomeColor = typeof biomeColors[number];

const biomeToColor: Record<BiomeType, BiomeColor> = zipToRecord(biomes, biomeColors);

interface Player {
  name: string;
  race: CharacterRace;
  variant?: CharacterRaceBeastmanVariant | CharacterRaceElfVariant | CharacterRaceBeastmanVariant;
  classes: CharacterClass[];
  level: number;
  experience: number;
  hp: number;
  attack: Attack;
  defense: Defense;
  mana: number;
  movementSpeed: number;
  position: SimplePoint;
  direction: Direction,
  discoveredTownCount: number;
  skills: Record<string, number>;
  rendering: {
    size: SimpleSize;
    hitbox: TileCircle | TileRect;
  }
}

/**
 * Mob Defining
 */
interface MobBase {
  species: MobSpecies;
  classes: MobClass[];
  level: number;
  hp: number;
  attack: Attack;
  defense: Defense;
  mana: number;
  movementSpeed: number;
  aggroRange: number;
  action: MobAction;
  behavior: MobBehavior;

  interactions: {
    relationship: MobRelationship;
    communication: {
      available: boolean;
      language?: MobLanguage;
    };
    taming: {
      available: boolean;
      difficulty?: TamingDifficulty;
      method?: TamingMethod;
    };
  };

  rendering: {
    size: SimpleSize;
    hitbox: TileCircle | TileRect;
  };
}

interface Mob {
  id: string;
  base: MobBase;
  name: string;
  position: SimplePoint;
  direction: Direction;
  ai?: MobAI;
  
  interactions: {
    taming: {
      isTamed: boolean;
    }
  }
}

/**
 * World Defining
 */
interface WorldState {
  seed: number;
  chunkSize: number;
  discovered: Record<string, Chunk>;
  currentChunkKey: string;
}

interface Chunk {
  key: string;
  cx: number;
  cy: number;
  biome: BiomeType;
  difficulty: number;
  tiles: number[];
  towns: Town[];
  encounters: Encounter[];
  mobs: Mob[];
}

interface Town {
  id: string;
  name: string;
  x: number;
  y: number;
  generationIndex: number;
  shops: ShopType[];
}

interface Encounter {
  id: string;
  x: number;
  y: number;
  level: number;
  kind: "normal" | "escaped";
}

/**
 * Game Defining
 */
interface GameState {
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
  player: Player;
  mobs: Mob[];
  world: WorldState;
}

// Consts
export { PLAYER_SIZE, PLAYER_HITBOX, MOB_SIZES, MOB_HITBOXES, PLAYER_RADIUS, MOB_RADIUS };

// Values
export { biomes, biomeColors, biomeToColor };

// Types
export type {
  CharacterRace, CharacterRaceBeastmanVariant, CharacterRaceElfVariant, CharacterRaceUndeadVariant, CharacterClass,
  Direction, AttackType, Attack,
  MobSpecies, MobDragonVariant, MobGoblinVariant, MobClass, MobLanguage, MobBehavior, MobRelationship, TamingDifficulty, TamingMethod, MobSpawnRule,
  BuildingType, ShopType,
  BiomeType
};

// Interfaces
export type { Player, MobBase, Mob, WorldState, Chunk, Town, Encounter, GameState };