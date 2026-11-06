import type { GameState } from "../../shared/types";
import SimplePoint from "../../utils/typescript/SimplePoint";
import SimpleSize from "../../utils/typescript/SimpleSize";
import TileCircle from "../../utils/typescript/TileCircle";
import TileRect from "../../utils/typescript/TileRect";

interface SaveEnvelope {
  format: "everpath-save";
  version: 1;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  tag: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ITERATIONS = 310_000;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(
      byte
    );
  }

  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function restoreGameObjects(state: GameState): GameState {
  state.player.position = new SimplePoint(state.player.position.x, state.player.position.y);
  state.player.rendering.size = new SimpleSize(
    state.player.rendering.size.width,
    state.player.rendering.size.height
  );
  state.player.rendering.hitbox = restoreHitbox(state.player.rendering.hitbox);

  for (const mob of state.mobs) {
    restoreMobObjects(mob);
  }

  for (const chunk of Object.values(state.world.discovered)) {
    for (const mob of chunk.mobs) {
      restoreMobObjects(mob);
    }
  }

  return state;
}

function restoreMobObjects(mob: GameState["mobs"][number]) {
  mob.position = new SimplePoint(mob.position.x, mob.position.y);
  mob.base.rendering.size = new SimpleSize(
    mob.base.rendering.size.width,
    mob.base.rendering.size.height
  );
  mob.base.rendering.hitbox = restoreHitbox(mob.base.rendering.hitbox);

  if (mob.ai) {
    mob.ai.wanderDirection = new SimplePoint(
      mob.ai.wanderDirection.x,
      mob.ai.wanderDirection.y
    );
  }
}

function restoreHitbox(hitbox: GameState["player"]["rendering"]["hitbox"]) {
  if ("radius" in hitbox) {
    return new TileCircle(
      hitbox.x,
      hitbox.y,
      hitbox.radius,
      hitbox.startAngle,
      hitbox.endAngle,
      hitbox.counterClockwise
    );
  }

  return new TileRect(hitbox.left, hitbox.top, hitbox.right, hitbox.bottom);
}

async function deriveKey(
  password: string,
  salt: Uint8Array
) {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    material,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    [
      "encrypt",
      "decrypt"
    ]
  );
}

async function encryptSave(state: GameState, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const plaintext = encoder.encode(JSON.stringify(state));
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      plaintext
    )
  );

  /*
   * WebCrypto appends the AES-GCM
   * authentication tag to the
   * encrypted data.
   */

  const tag = encrypted.slice(-16);
  const ciphertext = encrypted.slice(0, -16);
  const envelope: SaveEnvelope = {
    format: "everpath-save",
    version: 1,
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ciphertext),
    tag: bytesToBase64(tag)
  };

  return JSON.stringify(envelope, null, 2);
}

async function decryptSave(
  text: string,
  password: string
): Promise<GameState> {
  const envelope = JSON.parse(text) as SaveEnvelope;

  if (envelope.format !== "everpath-save") {
    throw new Error("Unrecognized save format.");
  }

  const salt = base64ToBytes(envelope.salt);
  const iv = base64ToBytes(envelope.iv);
  const ciphertext = base64ToBytes(envelope.ciphertext);
  const tag = base64ToBytes(envelope.tag);
  const encrypted = new Uint8Array(ciphertext.length + tag.length);

  encrypted.set(ciphertext);
  encrypted.set(tag, ciphertext.length);

  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv)
    },
    key,
    encrypted
  );

  const state = JSON.parse(decoder.decode(plaintext)) as GameState;
  return restoreGameObjects(state);
}

export { encryptSave, decryptSave };