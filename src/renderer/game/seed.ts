const HASH_BASE = 2166136261;
const HASH_MULTIPLIER = 16777619;
const MULBERRY_HEX = 0x6D2B79F5;
const MULBERRY_DIVISOR = 4294967296;

function hashString(
  value: string
): number {
  let hash = HASH_BASE >>> 0;

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, HASH_MULTIPLIER);
  }

  return hash >>> 0;
}

function mulberry32(
  seed: number
): () => number {
  let value = seed >>> 0;

  return () => {
    value |= 0;
    value = (value + MULBERRY_HEX) | 0;

    let t = Math.imul(
        value ^ (value >>> 15),
        1 | value
    );

    t = (t + Math.imul(
        t ^ (t >>> 7),
        61 | t
    )) ^ t;

    return (
      (t ^ (t >>> 14)) >>> 0
    ) / MULBERRY_DIVISOR;
  };
}

export { hashString, mulberry32 };
