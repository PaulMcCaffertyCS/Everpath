import SimplePoint from "./SimplePoint.js";
import SimpleSize from "./SimpleSize.js";
import { TILE_SIZE } from "../../shared/declarations.js";
import TileCircle from "./TileCircle.js";

class TileRect {
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
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    this.center = new SimplePoint(this.right - (this.width / 2), this.bottom - (this.height / 2));
    this.topLeft = new SimplePoint(this.left, this.top);
    this.topRight = new SimplePoint(this.right, this.top);
    this.bottomRight = new SimplePoint(this.right, this.bottom);
    this.bottomLeft = new SimplePoint(this.left, this.bottom);
  }

  static fromPointAndSize(center: SimplePoint, size: SimpleSize): TileRect {
    return new TileRect(
      center.x - ((size.width / TILE_SIZE) / 2),
      center.y - ((size.height / TILE_SIZE) / 2),
      center.x + ((size.width / TILE_SIZE) / 2),
      center.y + ((size.height / TILE_SIZE) / 2)
    );
  }

  update(center: SimplePoint) {
    const deltaX = center.x - this.center.x;
    const deltaY = center.y - this.center.y;
    this.left += deltaX;
    this.top += deltaY;
    this.right += deltaX;
    this.bottom += deltaY;
    this.center = center.copy();
    this.topLeft.shiftXY(deltaX, deltaY);
    this.topRight.shiftXY(deltaX, deltaY);
    this.bottomRight.shiftXY(deltaX, deltaY);
    this.bottomLeft.shiftXY(deltaX, deltaY);
  }

  increaseSize(value: number) {
    if (value < 0) {
      console.warn("Cannot use a negative value to increase the size of a TileRect. Calling decrease function");
      this.decreaseSize(value);
      return;
    }

    this.left -= value;
    this.top -= value;
    this.right += value;
    this.bottom += value;
    this.width += value;
    this.height += value;
    this.topLeft.minusValue(value);
    this.topRight.shiftXY(value, -value);
    this.bottomRight.plusValue(value);
    this.bottomLeft.shiftXY(-value, value);
  }

  decreaseSize(value: number) {
    if (value < 0) {
      console.warn("Cannot use a negative value to decrease the size of a TileRect. Calling increase function");
      this.increaseSize(value);
      return;
    }

    this.left += value;
    this.top += value;
    this.right -= value;
    this.bottom -= value;
    this.width -= value;
    this.height -= value;
    this.topLeft.plusValue(value);
    this.topRight.shiftXY(-value, value);
    this.bottomRight.minusValue(value);
    this.bottomLeft.shiftXY(value, -value);
  }

  overlapsCircle(circle: TileCircle): boolean {
    const closestX = Math.max(this.left, Math.min(circle.x, this.right));
    const closestY = Math.max(this.top, Math.min(circle.y, this.bottom));
    const distance = Math.hypot(circle.x - closestX, circle.y - closestY);
    // console.log(`rect over circle: distance=${distance}`);
    // console.log(`rect over circle: circle.radius=${circle.radius}`);
    return distance <= circle.radius;
  }

  overlapsRect(rect: TileRect): boolean {
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

  copy(): TileRect {
    return new TileRect(this.left, this.top, this.right, this.bottom);
  }

  toTileCirlce(): TileCircle {
    return new TileCircle(
      this.center.x,
      this.center.y,
      Math.max(this.width, this.height) / 2,
      0,
      Math.PI * 2
    )
  }
}

export default TileRect;