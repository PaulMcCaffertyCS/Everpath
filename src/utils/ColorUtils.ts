class HexColor {
  value: string;
  
  constructor(hex: string) {
    this.value = hex;
  }

  toRgb(): RgbColor {
    return new RgbColor(
      parseInt(this.value.slice(1, 3), 16),
      parseInt(this.value.slice(3, 5), 16),
      parseInt(this.value.slice(5, 7), 16)
    );
  }
}

class RgbColor {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * TODO: IMPLEMENT
   * 
   * @returns Hex
   */
  toHex(): HexColor {
    return new HexColor("#000000");
  }
}

function smoothstep(tile: number): number {
  return tile * tile * (3 - (2 * tile));
}

function blend(hexOne: HexColor, hexTwo: HexColor, tile: number): HexColor {
  const rgbOne = hexOne.toRgb();
  const rgbTwo = hexTwo.toRgb();
  const amount = smoothstep(Math.max(0, Math.min(1, tile)));

  const channel = (from: number, to: number) => {
    Math.round(from + (to - from) * amount).toString(16).padStart(2, "0");
  }

  return new HexColor(`#${channel(rgbOne.r, rgbTwo.r)}${channel(rgbOne.g, rgbTwo.g)}${channel(rgbOne.b, rgbTwo.b)}`);
}

export { HexColor, RgbColor };
export { blend };