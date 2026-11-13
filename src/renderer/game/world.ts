import { hashString, mulberry32 } from "./seed.js";
import { mobDefinitions } from "./mobs.js";
import { BUILDING_HEIGHT, BUILDING_WIDTH, TILE_SIZE, CHUNK_TILES } from "../../shared/declarations.js";
import { biomes, MOB_HITBOXES } from "../../shared/types.js";
import type {
  BuildingType, Dungeon, Mob, MobSpawnRule, BiomeType, Chunk, GameState, Encounter, ShopType, Town, TownBounds, TownBuilding, TownPurpose
} from "../../shared/types.js";
import { randomInt } from "../../utils/MathUtils.js";
import { capitalize } from "../../utils/StringUtils.js";
import SimplePoint from "../../utils/typescript/SimplePoint.js";
import TileRect from "../../utils/typescript/TileRect.js";
import TileCircle from "../../utils/typescript/TileCircle.js";

const mobSpawnRules: Record<BiomeType, MobSpawnRule[]> = {
  dragontopia: [
    {
      speciesId: "dragon",
      weight: 8,
      maxPerChunk: 1
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

type TownServiceBuilding = Exclude<BuildingType, "dungeon" | "guildHall" | "houseOneStory" | "houseTwoStory" | "townhall">;

const townPurposes: TownPurpose[] = [
  "agricultural",
  "commercial",
  "frontier",
  "guild",
  "residential",
  "scholarly"
];

const townServiceBuildings: Record<TownPurpose, TownServiceBuilding[]> = {
  agricultural: ["farmingSupplies", "stable", "market", "inn", "generalStore", "restaurant"],
  commercial: ["market", "bank", "generalStore", "inn", "restaurant", "blacksmith"],
  frontier: ["adventurerHall", "armory", "blacksmith", "chapel", "generalStore", "stable"],
  guild: ["adventurerHall", "armory", "library", "inn", "blacksmith", "magicShop"],
  residential: ["inn", "generalStore", "market", "chapel", "stable", "bank"],
  scholarly: ["library", "chapel", "magicShop", "potions", "bank", "inn"]
};

const townServiceShops: Partial<Record<TownServiceBuilding, ShopType>> = {
  adventurerHall: "general",
  armory: "forge",
  bank: "general",
  blacksmith: "smithy",
  chapel: "herbal",
  farmingSupplies: "farm",
  generalStore: "general",
  inn: "restaurant",
  library: "magic",
  magicShop: "magic",
  market: "general",
  potions: "alchemy",
  restaurant: "restaurant",
  stable: "general"
};

const TOWN_BOUNDARY_MARGIN = 2;

function calculateTownBounds(
  cx: number,
  cy: number,
  townX: number,
  townY: number,
  buildings: TownBuilding[],
  dungeon?: Dungeon
): TownBounds {
  const chunkX = cx * CHUNK_TILES;
  const chunkY = cy * CHUNK_TILES;
  const halfWidth = BUILDING_WIDTH / TILE_SIZE / 2;
  const halfHeight = BUILDING_HEIGHT / TILE_SIZE / 2;
  const buildingCenters = buildings.map(building => ({
    x: chunkX + townX + building.x,
    y: chunkY + townY + building.y
  }));

  if (dungeon) {
    buildingCenters.push({
      x: chunkX + dungeon.x,
      y: chunkY + dungeon.y
    });
  }

  return {
    minX: Math.min(...buildingCenters.map(center => center.x - halfWidth)) - TOWN_BOUNDARY_MARGIN,
    minY: Math.min(...buildingCenters.map(center => center.y - halfHeight)) - TOWN_BOUNDARY_MARGIN,
    maxX: Math.max(...buildingCenters.map(center => center.x + halfWidth)) + TOWN_BOUNDARY_MARGIN,
    maxY: Math.max(...buildingCenters.map(center => center.y + halfHeight)) + TOWN_BOUNDARY_MARGIN
  };
}

function chooseTownServiceBuildings(
  rng: () => number,
  purpose: TownPurpose,
  count: number
): TownServiceBuilding[] {
  const available = [...townServiceBuildings[purpose]];
  const selected: TownServiceBuilding[] = [];

  while (selected.length < count) {
    const index = randomInt(rng, 0, available.length - 1);
    selected.push(available.splice(index, 1)[0]);
  }

  return selected;
}

function townBuildingOffsets(rng: () => number, count: number): Array<{ x: number; y: number }> {
  const offsets: Array<{ x: number; y: number }> = [];

  for (let y = -6; y <= 6; y += 3) {
    for (let x = -6; x <= 6; x += 3) {
      if (x !== 0 || y !== 0) {
        offsets.push({ x, y });
      }
    }
  }

  for (let i = offsets.length - 1; i > 0; i--) {
    const swapIndex = randomInt(rng, 0, i);
    [offsets[i], offsets[swapIndex]] = [offsets[swapIndex], offsets[i]];
  }

  return offsets.slice(0, count);
}

function generateTown(
  key: string,
  cx: number,
  cy: number,
  rng: () => number,
  generationIndex: number
): { town: Town; dungeon?: Dungeon } {
  const id = `${key}-town`;
  const purpose = townPurposes[randomInt(rng, 0, townPurposes.length - 1)];
  const houseCount = randomInt(rng, 5, 8);
  const hasDungeon = rng() < 0.18;
  const guildHallLimit = Math.min(3, houseCount - 2 - Number(hasDungeon));
  const guildHallCount = randomInt(rng, 0, guildHallLimit);
  const maxServiceCount = Math.min(4, houseCount - 1 - guildHallCount - Number(hasDungeon));
  const serviceCount = randomInt(rng, 1, maxServiceCount);
  const serviceBuildings = chooseTownServiceBuildings(rng, purpose, serviceCount);

  const townX = randomInt(rng, 8, CHUNK_TILES - 9);
  const townY = randomInt(rng, 8, CHUNK_TILES - 9);
  const buildings: TownBuilding[] = [{
    id: `${id}-townhall`,
    type: "townhall",
    x: 0,
    y: 0
  }];
  const additionalTypes: TownBuilding["type"][] = [
    ...Array.from({ length: guildHallCount }, () => "guildHall" as const),
    ...serviceBuildings,
    ...Array.from({ length: houseCount }, () => rng() < 0.5 ? "houseOneStory" as const : "houseTwoStory" as const)
  ];
  const offsets = townBuildingOffsets(rng, additionalTypes.length + Number(hasDungeon));
  let dungeon: Dungeon | undefined;

  additionalTypes.forEach((type, index) => {
    const offset = offsets[index];
    buildings.push({
      id: `${id}-${type}-${index}`,
      type,
      x: offset.x,
      y: offset.y
    });
  });

  if (hasDungeon) {
    const offset = offsets[offsets.length - 1];
    dungeon = {
      id: `${id}-dungeon`,
      townId: id,
      x: townX + offset.x,
      y: townY + offset.y
    };
  }

  const serviceShops = serviceBuildings
    .map(building => townServiceShops[building])
    .filter((shop): shop is ShopType => shop !== undefined);

  const town: Town = {
    id,
    name: townName(rng, generationIndex),
    x: townX,
    y: townY,
    generationIndex,
    shops: [...new Set(serviceShops)],
    purpose,
    buildings,
    bounds: calculateTownBounds(cx, cy, townX, townY, buildings, dungeon)
  };

  return {
    town,
    dungeon
  };
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

  // for (let i = 0; i < CHUNK_TILES * CHUNK_TILES; i++) {
  //   const noise = rng();
  //   tiles.push(noise < 0.08 ? 1 : noise < 0.12 ? 2 : 0);
  // }

  const towns: Town[] = [];
  const dungeons: Dungeon[] = [];

  if (biome !== "lake" && rng() < 0.14) {
    const generationIndex = state.player.discoveredTownCount + 1;
    const generatedTown = generateTown(key, cx, cy, rng, generationIndex);
    towns.push(generatedTown.town);

    if (generatedTown.dungeon) {
      dungeons.push(generatedTown.dungeon);
    }
  } else if (rng() < 0.02) {
    dungeons.push({
      id: `${key}-wild-dungeon`,
      x: randomInt(rng, 0, CHUNK_TILES - 1),
      y: randomInt(rng, 0, CHUNK_TILES - 1)
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
    dungeons,
    encounters,
    mobs
  };
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
  const validTiles = tiles.length === 0
    ? Array.from({ length: TILE_SIZE * CHUNK_TILES }, (_, index) => index)
    : tiles
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

    mob.base.rendering.hitbox = MOB_HITBOXES[mob.base.species].isBox() ?
      TileRect.fromPointAndSize(mob.position, mob.base.rendering.size) :
      TileCircle.fromPointAndSize(mob.position, mob.base.rendering.size);
    
    mobs.push(mob);
    counts[definition.species] = (counts[definition.species] ?? 0) + 1;
  }

  return mobs;
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

export { calculateTownBounds, chunkKey, difficultyForChunk, ensureChunk, ensureAroundPlayer };