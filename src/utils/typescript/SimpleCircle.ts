import SimplePoint from "./SimplePoint.js";
import type SimpleRect from "./SimpleRect.js";
import type SimpleSize from "./SimpleSize.js";

class SimpleCircle {
  x: number;
  y: number;
  radius: number;
  diameter: number;
  circumference: number;
  startAngle: number;
  endAngle: number;
  counterClockwise?: boolean | undefined

  constructor(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterClockwise?: boolean | undefined) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.diameter = radius * 2;
    this.circumference = Math.PI * (radius ^ 2);
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.counterClockwise = counterClockwise;
  }

  static fromPointAndSize(topLeft: SimplePoint, size: SimpleSize): SimpleCircle {
    const center = new SimplePoint(
      topLeft.x + (size.width / 2),
      topLeft.y + (size.height / 2)
    );

    return new SimpleCircle(
      center.x,
      center.y,
      Math.max(size.width, size.height) / 2,
      0,
      Math.PI * 2
    );
  }

  overlapsCircle(circle: SimpleCircle): boolean {
    const distance = Math.hypot(this.x - circle.x, this.y - circle.y);
    const radiusSum = this.radius + circle.radius;
    // console.log(`circle over circle: distance=${distance}`);
    return distance <= radiusSum;
  }

  overlapsRect(rect: SimpleRect): boolean {
    // console.log(`circle over rect: rect.overlapsCircle(this)`);
    return rect.overlapsCircle(this);
  }
}

export default SimpleCircle;