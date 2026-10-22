class SimplePoint {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    plusValue(value) {
        return new SimplePoint(this.x + value, this.y + value);
    }
    plus(other) {
        return new SimplePoint(this.x + other.x, this.y + other.y);
    }
    minusValue(value) {
        return new SimplePoint(this.x - value, this.y - value);
    }
    minus(other) {
        return new SimplePoint(this.x - other.x, this.y - other.y);
    }
    multiplyValue(value) {
        return new SimplePoint(this.x * value, this.y * value);
    }
    multiply(other) {
        return new SimplePoint(this.x * other.x, this.y * other.y);
    }
    divideValue(value) {
        return new SimplePoint(this.x / value, this.y / value);
    }
    divide(other) {
        return new SimplePoint(this.x / other.x, this.y / other.y);
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
    shiftX(value) {
        return new SimplePoint(this.x + value, this.y);
    }
    shiftY(value) {
        return new SimplePoint(this.x, this.y + value);
    }
    copy(x = this.x, y = this.y) {
        return new SimplePoint(x, y);
    }
}
export default SimplePoint;
