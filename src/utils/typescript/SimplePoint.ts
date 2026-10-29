class SimplePoint {
  x: number;
  y: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  plusValue(value: number) {
    this.x += value;
    this.y += value;
  }

  plus(other: SimplePoint) {
    this.x += other.x;
    this.y += other.y;
  }

  minusValue(value: number) {
    this.x -= value;
    this.y -= value;
  }

  minus(other: SimplePoint) {
    this.x -= other.x;
    this.y -= other.y;
  }

  multiplyValue(value: number) {
    this.x *= value;
    this.y *= value;
  }

  multiply(other: SimplePoint) {
    this.x *= other.x;
    this.y *= other.y;
  }

  divideValue(value: number) {
    this.x /= value;
    this.y /= value;
  }

  divide(other: SimplePoint) {
    this.x /= other.x;
    this.y /= other.y;
  }

  equals(other: SimplePoint): boolean {
    return this.x === other.x && this.y === other.y;
  }

  shiftX(value: number) {
    this.x += value;
  }

  shiftY(value: number) {
    this.y += value;
  }

  shiftXY(valueX: number, valueY: number) {
    this.x += valueX;
    this.y += valueY;
  }

  copy(x: number = this.x, y: number = this.y): SimplePoint {
    return new SimplePoint(x, y);
  }
}

export default SimplePoint;