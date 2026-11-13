import type { Direction } from "../shared/types";

/**
 * CHARACTER SPRITES
 */
import characterSpriteUp from "../../assets/sprites/character/character_back_up.png";
import characterSpriteDown from "../../assets/sprites/character/character_front_down.png";
import characterSpriteLeft from "../../assets/sprites/character/character_left.png";
import characterSpriteRight from "../../assets/sprites/character/character_right.png";

const characterSprites: string[] = [characterSpriteUp, characterSpriteDown, characterSpriteLeft, characterSpriteRight];

/**
 * NPC SPRITES
 */
// TODO

const npcSprites: string[] = [];

/**
 * MOB SPRITES
 */
import dragonSpriteUp from "../../assets/sprites/mobs/dragon_up.png";
import dragonSpriteDown from "../../assets/sprites/mobs/dragon_down.png";
import dragonSpriteLeft from "../../assets/sprites/mobs/dragon_left.png";
import dragonSpriteRight from "../../assets/sprites/mobs/dragon_right.png";

const dragonSprites: string[] = [dragonSpriteUp, dragonSpriteDown, dragonSpriteLeft, dragonSpriteRight];

import goblinSpriteUp from "../../assets/sprites/mobs/goblin_up.png";
import goblinSpriteDown from "../../assets/sprites/mobs/goblin_down.png";
import goblinSpriteLeft from "../../assets/sprites/mobs/goblin_left.png";
import goblinSpriteRight from "../../assets/sprites/mobs/goblin_right.png";

const goblinSprites: string[] = [goblinSpriteUp, goblinSpriteDown, goblinSpriteLeft, goblinSpriteRight];

import slimeSpriteUp from "../../assets/sprites/mobs/slime_up.png";
import slimeSpriteDown from "../../assets/sprites/mobs/slime_down.png";
import slimeSpriteLeft from "../../assets/sprites/mobs/slime_left.png";
import slimeSpriteRight from "../../assets/sprites/mobs/slime_right.png";

const slimeSprites: string[] = [slimeSpriteUp, slimeSpriteDown, slimeSpriteLeft, slimeSpriteRight];

/**
 * BUILDING SPRITES
 */
import adventurerHallSprite from "../../assets/sprites/buildings/building_adventurer_hall.png";
import armorySprite from "../../assets/sprites/buildings/building_armory.png";
import bankSprite from "../../assets/sprites/buildings/building_bank.png";
import blacksmithSprite from "../../assets/sprites/buildings/building_blacksmith.png";
import chapelSprite from "../../assets/sprites/buildings/building_chapel.png";
import dungeonSprite from "../../assets/sprites/buildings/building_dungeon.png";
import farmingSuppliesSprite from "../../assets/sprites/buildings/building_farming_supplies.png";
import generalStoreSprite from "../../assets/sprites/buildings/building_general_store.png";
import guildHallSprite from "../../assets/sprites/buildings/building_guild_hall.png";
import houseOneStorySprite from "../../assets/sprites/buildings/building_house_one_story.png";
import houseTwoStorySprite from "../../assets/sprites/buildings/building_house_two_story.png";
import innSprite from "../../assets/sprites/buildings/building_inn.png";
import librarySprite from "../../assets/sprites/buildings/building_library.png";
import magicShopSprite from "../../assets/sprites/buildings/building_magic_shop.png";
import marketSprite from "../../assets/sprites/buildings/building_market.png";
import potionsSprite from "../../assets/sprites/buildings/building_potions.png";
import restaurantSprite from "../../assets/sprites/buildings/building_restaurant.png";
import stableSprite from "../../assets/sprites/buildings/building_stable.png";
import townhallSprite from "../../assets/sprites/buildings/building_townhall.png";

const buildingSprites: string[] = [
  adventurerHallSprite, armorySprite, bankSprite, blacksmithSprite, chapelSprite, dungeonSprite, farmingSuppliesSprite,
  generalStoreSprite, guildHallSprite, houseOneStorySprite, houseTwoStorySprite, innSprite, librarySprite,
  magicShopSprite, marketSprite, potionsSprite, restaurantSprite, stableSprite, townhallSprite
];

/**
 * SPRITE SOURCES
 */
type SpriteSources = Record<Direction, string>;

const characterSources: SpriteSources = { up: characterSpriteUp, down: characterSpriteDown, left: characterSpriteLeft, right: characterSpriteRight };
const dragonSources: SpriteSources = { up: dragonSpriteUp, down: dragonSpriteDown, left: dragonSpriteLeft, right: dragonSpriteRight };
const goblinSources: SpriteSources = { up: goblinSpriteUp, down: goblinSpriteDown, left: goblinSpriteLeft, right: goblinSpriteRight };
const slimeSources: SpriteSources = { up: slimeSpriteUp, down: slimeSpriteDown, left: slimeSpriteLeft, right: slimeSpriteRight };

const allSpriteSources = {
  player: characterSources,
  dragon: dragonSources,
  goblin: goblinSources,
  slime: slimeSources
};

const allBuildingSprites = {
  adventurerHall: adventurerHallSprite,
  armory: armorySprite,
  bank: bankSprite,
  blacksmith: blacksmithSprite,
  chapel: chapelSprite,
  dungeon: dungeonSprite,
  farmingSupplies: farmingSuppliesSprite,
  generalStore: generalStoreSprite,
  guildHall: guildHallSprite,
  houseOneStory: houseOneStorySprite,
  houseTwoStory: houseTwoStorySprite,
  inn: innSprite,
  library: librarySprite,
  magicShop: magicShopSprite,
  market: marketSprite,
  potions: potionsSprite,
  restaurant: restaurantSprite,
  stable: stableSprite,
  townhall: townhallSprite
};

/**
 * EXPORTS
 */
export type SpriteKey = keyof typeof allSpriteSources;
export type BuildingSpriteKey = keyof typeof allBuildingSprites;

export { allSpriteSources };

export { characterSprites, npcSprites, dragonSprites, goblinSprites, slimeSprites, allBuildingSprites };

export {
  characterSpriteUp, characterSpriteDown, characterSpriteLeft, characterSpriteRight,
  dragonSpriteUp, dragonSpriteDown, dragonSpriteLeft, dragonSpriteRight,
  goblinSpriteUp, goblinSpriteDown, goblinSpriteLeft, goblinSpriteRight,
  slimeSpriteUp, slimeSpriteDown, slimeSpriteLeft, slimeSpriteRight
};