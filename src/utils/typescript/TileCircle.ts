import SimplePoint from "./SimplePoint.js";
import type SimpleSize from "./SimpleSize.js";
import { TILE_SIZE } from "../../shared/declarations.js";
import type TileRect from "./TileRect.js";

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
    // const center = new SimplePoint(
    //   topLeft.x + ((size.width / TILE_SIZE) / 2),
    //   topLeft.y + ((size.height / TILE_SIZE) / 2)
    // );

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
}

export default TileCircle;