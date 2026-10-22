// import { randomBytes } from "node:crypto";

const uuidPatternRegex = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{6}$/;

function generateRandomBytes(size: number): Uint8Array {
  const buffer = new Uint8Array(size);
  
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }

  return buffer;
}

function validateUuid(uuid: string): boolean {
  return uuidPatternRegex.test(uuid);
}

function section(array: string[], start: number, end: number): string {
  return array.slice(start, end).join("");
}

function generateUuid() {
  const bytes = generateRandomBytes(16);

  // Set version (4)
  bytes[6] = (bytes[6] & 0x0F) | 0x40;

  // Set variant (10xxxxxx)
  bytes[8] = (bytes[8] & 0x3F) | 0x80;

  const hex = [...bytes].map((byte) => {
    return byte.toString(16).padStart(2, "0");
  });

  const section1 = section(hex, 0, 4);
  const section2 = section(hex, 4, 6);
  const section3 = section(hex, 6, 8);
  const section4 = section(hex, 8, 10);
  const section5 = section(hex, 10, 16);
  return `${section1}-${section2}-${section3}-${section4}-${section5}`;
}

/**
 * All of this class and UuidUtils.ts file are based on the uuidv4 structure.
 */
class UUID {
  value: string;

  constructor (uuid: string) {
    if (validateUuid(uuid)) {
      this.value = uuid;
    } else {
      this.value = generateUuid();
    }
  }

  static generateUuid(): UUID {
    return new UUID(generateUuid());
  }

  equals(other: UUID) {
    return this.value === other.value;
  }
}

export { generateUuid };
export default UUID;