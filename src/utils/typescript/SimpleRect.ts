import type SimpleCircle from "./SimpleCircle.js";
import SimplePoint from "./SimplePoint.js";
import SimpleSize from "./SimpleSize.js";

class SimpleRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  center: SimplePoint;
  topLeft: SimplePoint;
  topRight: SimplePoint;
  bottomRight: SimplePoint;
  bottomLeft: SimplePoint;

  constructor(left: number, top: number, right: number, bottom: number) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.width = right - left;
    this.height = bottom - top;
    this.center = new SimplePoint(right - (this.width / 2), bottom - (this.height / 2));
    this.topLeft = new SimplePoint(left, top);
    this.topRight = new SimplePoint(right, top);
    this.bottomRight = new SimplePoint(right, bottom);
    this.bottomLeft = new SimplePoint(left, bottom);
  }

  static fromPointAndSize(center: SimplePoint, size: SimpleSize): SimpleRect {
    return new SimpleRect(
      center.x - (size.width / 2),
      center.y - (size.height / 2),
      center.x + (size.width / 2),
      center.y + (size.height / 2)
    );
  }

  updateFromPoint(center: SimplePoint) {
    
  }

  overlapsCircle(circle: SimpleCircle): boolean {
    const closestX = Math.max(this.left, Math.min(circle.x, this.right));
    const closestY = Math.max(this.top, Math.min(circle.y, this.bottom));
    const distance = Math.hypot(circle.x - closestX, circle.y - closestY);
    // console.log(`rect over circle: distance=${distance}`);
    // console.log(`rect over circle: circle.radius=${circle.radius}`);
    return distance <= circle.radius;
  }

  overlapsRect(rect: SimpleRect): boolean {
    const distanceX = Math.abs(this.center.x - rect.center.x);
    const minDistanceX = (this.width + rect.width) / 2;
    // console.log(`rect over rect: distanceX=${distanceX}`);
    // console.log(`rect over rect: minDistanceX=${minDistanceX}`);
    if (distanceX >= minDistanceX) return false;


    const distanceY = Math.abs(this.center.y - rect.center.y);    
    const minDistanceY = (this.height + rect.height) / 2;
    // console.log(`rect over rect: distanceX=${distanceX}`);
    // console.log(`rect over rect: minDistanceY=${minDistanceY}`);
    return distanceY < minDistanceY;
  }
}

export default SimpleRect;