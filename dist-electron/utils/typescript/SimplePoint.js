class SimplePoint {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    plusValue(value) {
        this.x += value;
        this.y += value;
    }
    plus(other) {
        this.x += other.x;
        this.y += other.y;
    }
    minusValue(value) {
        this.x -= value;
        this.y -= value;
    }
    minus(other) {
        this.x -= other.x;
        this.y -= other.y;
    }
    multiplyValue(value) {
        this.x *= value;
        this.y *= value;
    }
    multiply(other) {
        this.x *= other.x;
        this.y *= other.y;
    }
    divideValue(value) {
        this.x /= value;
        this.y /= value;
    }
    divide(other) {
        this.x /= other.x;
        this.y /= other.y;
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
    shiftX(value) {
        this.x += value;
    }
    shiftY(value) {
        this.y += value;
    }
    shiftXY(valueX, valueY) {
        this.x += valueX;
        this.y += valueY;
    }
    copy(x = this.x, y = this.y) {
        return new SimplePoint(x, y);
    }
}
export default SimplePoint;
