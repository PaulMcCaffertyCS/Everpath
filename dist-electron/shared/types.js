import SimplePoint from "../utils/typescript/SimplePoint.js";
import { zipToRecord } from "../utils/typescript/TypeScript.js";
/**
 * Const Declarations
 */
const PLAYER_RADIUS = 0.3;
const MOB_RADIUS = 0.28;
/**
 * Biome Typing
 */
const biomes = ["forest", "hills", "lake", "meadow", "mountains", "ruins", "swamp"];
const biomeColors = ["#24452f", "#4a4630", "#02678f", "#38533a", "#83807e", "#353338", "#293c36"];
const biomeToColor = zipToRecord(biomes, biomeColors);
// Consts
export { PLAYER_RADIUS, MOB_RADIUS };
// Values
export { biomes, biomeColors, biomeToColor };
