import { hashString, mulberry32 } from "./seed";
import { mobDefinitions } from "./mobs";
import { biomes } from "../../shared/types";
import type { Mob, MobSpawnRule, BiomeType, Chunk, GameState, Encounter, Town } from "../../shared/types";
import { randomInt } from "../../utils/MathUtils";
import { capitalize } from "../../utils/StringUtils";
import SimplePoint from "../../utils/typescript/SimplePoint";

const TILE_SIZE = 24;
const CHUNK_TILES = 24;

const mobSpawnRules: Record<BiomeType, MobSpawnRule[]> = {
  astridland: [
    {
      speciesId: "dragon",
      weight: 10,
      maxPerChunk: 3
    }
  ],
  forest: [
    {
      speciesId: "goblin",
      weight: 3,
      maxPerChunk: 3
    },
    {
      speciesId: "slime",
      weight: 5,
      maxPerChunk: 4
    }
  ],
  hills: [],
  lake: [],
  meadow: [
    {
      speciesId: "slime",
      weight: 3,
      maxPerChunk: 2
    }
  ],
  mountains: [],
  swamp: [
    {
      speciesId: "slime",
      weight: 8,
      maxPerChunk: 5
    }
  ],
  ruins: []
};

function chunkKey(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

function difficultyForChunk(state: GameState, cx: number, cy: number): number {
  const distance = Math.max(Math.abs(cx), Math.abs(cy));
  const progression = Math.floor(distance * 1.35);
  return Math.max(1, state.player.level + progression);
}

function townName(rng: () => number, generationIndex: number): string {
  const beginnings = [
    "Ash",
    "Elder",
    "Green",
    "Raven",
    "Silver",
    "Thorn",
    "Willow",
    "Stone",
    "Dawn",
    "Mist"
  ];

  const endings = [
    "brook",
    "fall",
    "haven",
    "mere",
    "watch",
    "ford",
    "hollow",
    "rest",
    "vale",
    "wick"
  ];

  const beginning = beginnings[Math.floor(rng() * beginnings.length)];
  const ending = endings[Math.floor(rng() * endings.length)];

  return generationIndex === 1 ? `${beginning}${ending}` : `${capitalize(ending)}${beginning.toLowerCase()}`;
}

function generateMobs(
  key: string,
  cx: number,
  cy: number,
  biome: BiomeType,
  tiles: number[],
  rng: () => number
): Mob[] {
  const rules = mobSpawnRules[biome] ?? [];

  if (rules.length === 0) {
    return [];
  }

  const maxMobs = randomInt(rng, 2, 6);
  const counts: Record<string, number> = {};
  const mobs: Mob[] = [];

  // Only spawn on ordinary ground tiles.
  const validTiles = tiles
    .map((tile, index) => ({ tile, index }))
    .filter(({ tile }) => tile === 0)
    .map(({ index }) => index);

  if (validTiles.length === 0) {
    return [];
  }

  for (let i = 0; i < maxMobs; i++) {
    const eligibleRules = rules.filter(rule => (counts[rule.speciesId] ?? 0) < rule.maxPerChunk);
    if (eligibleRules.length === 0) {
      break;
    }

    const totalWeight = eligibleRules.reduce((sum, rule) => sum + rule.weight, 0);
    let roll = rng() * totalWeight;

    const selectedRule = eligibleRules.find(rule => {
      roll -= rule.weight;
      return roll < 0;
    }) ?? eligibleRules[eligibleRules.length - 1];

    const definition = mobDefinitions[selectedRule.speciesId];
    if (!definition) {
      continue;
    }

    const tileIndex = randomInt(rng, 0, validTiles.length - 1);
    const spawnIndex = validTiles.splice(tileIndex, 1)[0];
    const x = spawnIndex % CHUNK_TILES;
    const y = Math.floor(spawnIndex / CHUNK_TILES);

    const mob: Mob = {
      id: `${key}-mob-${i}`,
      base: structuredClone(mobDefinitions[selectedRule.speciesId]),
      name: `${key}-mob-${i}`,
      // World position, not chunk-local position.
      position: new SimplePoint(cx * CHUNK_TILES + x, cy * CHUNK_TILES + y),
      direction: "down",

      interactions: {
        taming: {
          isTamed: false
        }
      }
    };
    // To create random, mob.base.${value} needs updated here
    // mob.base.movementSpeed = 1.1 + Math.random() * 3;

    mobs.push(mob);
    counts[definition.species] = (counts[definition.species] ?? 0) + 1;
  }

  return mobs;
}

function generateChunk(state: GameState, cx: number, cy: number): Chunk {
  const key = chunkKey(cx, cy);
  const rng = mulberry32(
    hashString(`${state.world.seed}:${key}`)
  );

  const biome = biomes[
    Math.floor(
      rng() * biomes.length
    )
  ];

  const difficulty = difficultyForChunk(state, cx, cy);
  const tiles: number[] = [];

  for (let i = 0; i < CHUNK_TILES * CHUNK_TILES; i++) {
    const noise = rng();
    tiles.push(noise < 0.08 ? 1 : noise < 0.12 ? 2 : 0);
  }

  const towns: Town[] = [];

  if (rng() < 0.14) {
    const generationIndex = state.player.discoveredTownCount + 1;

    towns.push({
      id: `${key}-town`,
      name: townName(rng, generationIndex),
      x: Math.floor(rng() * (CHUNK_TILES - 6)) + 3,
      y: Math.floor(rng() * (CHUNK_TILES - 6)) + 3,
      generationIndex: generationIndex,
      shops: ["smithy"]
    });
  }

  const encounters: Encounter[] = [];
  const encounterCount = 4 + Math.floor(rng() * 5);

  for (let i = 0; i < encounterCount; i++) {
    const escaped = rng() < 0.0001;

    encounters.push({
      id: `${key}-encounter-${i}`,
      x: Math.floor(rng() * CHUNK_TILES),
      y: Math.floor(rng() * CHUNK_TILES),
      level: escaped ? difficulty + 8 + Math.floor(rng() * 8)
        : Math.max(1, difficulty + Math.floor(rng() * 5) - 2),
      kind: escaped ? "escaped" : "normal"
    });
  }

  const mobs = generateMobs(key, cx, cy, biome, tiles, rng);

  return {
    key,
    cx,
    cy,
    biome,
    difficulty,
    tiles,
    towns,
    encounters,
    mobs
  };
}

function ensureChunk(state: GameState, cx: number, cy: number): Chunk {
  const key = chunkKey(cx, cy);
  const existing = state.world.discovered[key];

  if (existing) {
    return existing;
  }

  const generated = generateChunk(state, cx, cy);
  state.world.discovered[key] = generated;
  return generated;
}

function ensureAroundPlayer(state: GameState) {
  const cx = Math.floor(state.player.position.x / CHUNK_TILES);
  const cy = Math.floor(state.player.position.y / CHUNK_TILES);
  state.world.currentChunkKey = chunkKey(cx, cy);

  for (let y = cy - 1; y <= cy + 1; y++) {
    for (let x = cx - 1; x <= cx + 1; x++) {
      ensureChunk(state, x, y);
    }
  }
}

export { TILE_SIZE, CHUNK_TILES };
export { chunkKey, difficultyForChunk, ensureChunk, ensureAroundPlayer };