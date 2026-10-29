import SimplePoint from "../utils/typescript/SimplePoint.js";
import SimpleSize from "../utils/typescript/SimpleSize.js";
import { zipToRecord } from "../utils/typescript/TypeScript.js";
/**
 * Const Declarations
 */
const PLAYER_SIZE = new SimpleSize(26, 32);
const PLAYER_HITBOX = "rectangle";
const MOB_SIZES = {
    "dragon": new SimpleSize(40, 34),
    "goblin": new SimpleSize(26, 32),
    "slime": new SimpleSize(24, 22)
};
const MOB_HITBOXES = {
    "dragon": "rectangle",
    "goblin": "rectangle",
    "slime": "circle"
};
const PLAYER_RADIUS = 0.3;
const MOB_RADIUS = 0.28;
/**
 * Biome Typing
 */
const biomes = ["astridland", "forest", "hills", "lake", "meadow", "mountains", "ruins", "swamp"];
const biomeColors = ["#925ba8", "#24452f", "#4a4630", "#02678f", "#38533a", "#83807e", "#353338", "#293c36"];
const biomeToColor = zipToRecord(biomes, biomeColors);
// Consts
export { PLAYER_SIZE, PLAYER_HITBOX, MOB_SIZES, MOB_HITBOXES, PLAYER_RADIUS, MOB_RADIUS };
// Values
export { biomes, biomeColors, biomeToColor };
