import type { Direction } from "../shared/types";

/**
 * CHARACTER SPRITES
 */
import characterSpriteUp from "../../assets/sprites/character_back_up.png";
import characterSpriteDown from "../../assets/sprites/character_front_down.png";
import characterSpriteLeft from "../../assets/sprites/character_left.png";
import characterSpriteRight from "../../assets/sprites/character_right.png";

const characterSprites: string[] = [characterSpriteUp, characterSpriteDown, characterSpriteLeft, characterSpriteRight];

/**
 * NPC SPRITES
 */
// TODO

const npcSprites: string[] = [];

/**
 * MOB SPRITES
 */
import dragonSpriteUp from "../../assets/sprites/dragon_up.png";
import dragonSpriteDown from "../../assets/sprites/dragon_down.png";
import dragonSpriteLeft from "../../assets/sprites/dragon_left.png";
import dragonSpriteRight from "../../assets/sprites/dragon_right.png";

const dragonSprites: string[] = [dragonSpriteUp, dragonSpriteDown, dragonSpriteLeft, dragonSpriteRight];

import goblinSpriteUp from "../../assets/sprites/goblin_up.png";
import goblinSpriteDown from "../../assets/sprites/goblin_down.png";
import goblinSpriteLeft from "../../assets/sprites/goblin_left.png";
import goblinSpriteRight from "../../assets/sprites/goblin_right.png";

const goblinSprites: string[] = [goblinSpriteUp, goblinSpriteDown, goblinSpriteLeft, goblinSpriteRight];

import slimeSpriteUp from "../../assets/sprites/slime_up.png";
import slimeSpriteDown from "../../assets/sprites/slime_down.png";
import slimeSpriteLeft from "../../assets/sprites/slime_left.png";
import slimeSpriteRight from "../../assets/sprites/slime_right.png";

const slimeSprites: string[] = [slimeSpriteUp, slimeSpriteDown, slimeSpriteLeft, slimeSpriteRight];

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

/**
 * EXPORTS
 */
export type SpriteKey = keyof typeof allSpriteSources;

export { allSpriteSources };

export { characterSprites, npcSprites, dragonSprites, goblinSprites, slimeSprites };

export {
  characterSpriteUp, characterSpriteDown, characterSpriteLeft, characterSpriteRight,
  dragonSpriteUp, dragonSpriteDown, dragonSpriteLeft, dragonSpriteRight,
  goblinSpriteUp, goblinSpriteDown, goblinSpriteLeft, goblinSpriteRight,
  slimeSpriteUp, slimeSpriteDown, slimeSpriteLeft, slimeSpriteRight
};