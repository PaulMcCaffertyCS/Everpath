import SimplePoint from "./SimplePoint.js";
import SimpleSize from "./SimpleSize.js";
import { TILE_SIZE } from "../../shared/declarations.js";
import TileRect from "./TileRect.js";

class TileCircle {
  x: number;
  y: number;
  center: SimplePoint;
  radius: number;
  diameter: number;
  circumference: number;
  startAngle: number;
  endAngle: number;
  counterClockwise?: boolean | undefined

  constructor(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterClockwise?: boolean | undefined) {
    this.x = x;
    this.y = y;
    this.center = new SimplePoint(this.x, this.y);
    this.radius = radius;
    this.diameter = this.radius * 2;
    this.circumference = Math.PI * (this.radius ^ 2);
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.counterClockwise = counterClockwise;
  }

  static fromPointAndSize(center: SimplePoint, size: SimpleSize): TileCircle {
    return new TileCircle(
      center.x,
      center.y,
      Math.max((size.width / TILE_SIZE), (size.height / TILE_SIZE)) / 2,
      0,
      Math.PI * 2
    );
  }

  update(center: SimplePoint) {
    this.x = center.x;
    this.y = center.y;
    this.center = center.copy();
  }

  increaseSize(value: number) {
    if (value < 0) {
      console.warn("Cannot use a negative value to increase the size of a TileCircle. Calling decrease function");
      this.increaseSize(value);
      return;
    }

    this.radius += (value / 2);
    this.diameter += value;
    this.circumference = Math.PI * (this.radius ^ 2);
  }

  decreaseSize(value: number) {
    if (value < 0) {
      console.warn("Cannot use a negative value to decrease the size of a TileCircle. Calling increase function");
      this.increaseSize(value);
      return;
    }

    this.radius -= (value / 2);
    this.diameter -= value;
    this.circumference = Math.PI * (this.radius ^ 2);
  }

  overlapsCircle(circle: TileCircle): boolean {
    const distance = Math.hypot(this.x - circle.x, this.y - circle.y);
    const radiusSum = this.radius + circle.radius;
    // console.log(`circle over circle: distance=${distance}`);
    return distance <= radiusSum;
  }

  overlapsRect(rect: TileRect): boolean {
    // console.log(`circle over rect: rect.overlapsCircle(this)`);
    return rect.overlapsCircle(this);
  }

  copy(): TileCircle {
    return new TileCircle(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
  }

  toTileRect(): TileRect {
    return new TileRect(
      this.center.x - this.radius,
      this.center.y - this.radius,
      this.center.x + this.radius,
      this.center.y + this.radius
    );
  }
}

export default TileCircle;