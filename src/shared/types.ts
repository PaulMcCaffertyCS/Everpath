/**
 * Character Typing
 */
type CharacterRace =  "beastman" | "elf" | "human" | "orc" | "troll" | "undead";

type CharacterRaceBeastmanSubspecies = "cat" | "dog" | "pig" | "wolf";

type CharacterRaceElfSubspecies = "dark" | "high";

type CharacterRaceUndeadSubspecies = "skeleton" | "vampire";

type CharacterClass = "alchemist" | "archer" | "assassin" | "farmer" | "herbalist" | "mage" | "ranger" | "rogue" | "scholar" | "thief" | "swordsman";

/**
 * Player Typing
 */
type Direction = "up" | "down" | "left" | "right";

/**
 * Shop Typing
 */
type ShopType = "alchemy" | "dark" | "farm" | "forge" | "general" | "herbal" | "magic" | "music" | "restaurant" | "smithy";

/**
 * Biome Typing
 */
const biomes = ["forest", "hills", "lake", "meadow", "swamp", "ruins"] as const;
type BiomeType = typeof biomes[number];

/**
 * Player Defining
 */
interface Position {
  x: number;
  y: number;
}

interface Player {
  name: string;
  race: CharacterRace;
  classes: CharacterClass[];
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  position: Position;
  direction: Direction,
  discoveredTownCount: number;
  skills: Record<string, number>;
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
  world: WorldState;
}

// Values
export { biomes };

// Types
export type { CharacterRace, CharacterRaceBeastmanSubspecies, CharacterRaceElfSubspecies, CharacterRaceUndeadSubspecies, CharacterClass, Direction, ShopType, BiomeType };

// Interfaces
export type { Position, Player, WorldState, Chunk, Town, Encounter, GameState };