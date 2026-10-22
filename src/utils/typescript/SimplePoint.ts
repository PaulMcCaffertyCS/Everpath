class SimplePoint {
  x: number;
  y: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  plusValue(value: number): SimplePoint {
    return new SimplePoint(this.x + value, this.y + value);
  }

  plus(other: SimplePoint): SimplePoint {
    return new SimplePoint(this.x + other.x, this.y + other.y)
  }

  minusValue(value: number): SimplePoint {
    return new SimplePoint(this.x - value, this.y - value);
  }

  minus(other: SimplePoint): SimplePoint {
    return new SimplePoint(this.x - other.x, this.y - other.y);
  }

  multiplyValue(value: number): SimplePoint {
    return new SimplePoint(this.x * value, this.y * value);
  }

  multiply(other: SimplePoint): SimplePoint {
    return new SimplePoint(this.x * other.x, this.y * other.y);
  }

  divideValue(value: number): SimplePoint {
    return new SimplePoint(this.x / value, this.y / value);
  }

  divide(other: SimplePoint): SimplePoint {
    return new SimplePoint(this.x / other.x, this.y / other.y);
  }

  equals(other: SimplePoint): boolean {
    return this.x === other.x && this.y === other.y;
  }

  shiftX(value: number): SimplePoint {
    return new SimplePoint(this.x + value, this.y);
  }

  shiftY(value: number): SimplePoint {
    return new SimplePoint(this.x, this.y + value);
  }

  copy(x: number = this.x, y: number = this.y): SimplePoint {
    return new SimplePoint(x, y);
  }
}

export default SimplePoint;