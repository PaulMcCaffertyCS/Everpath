function randomInt(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
}
export { randomInt };
