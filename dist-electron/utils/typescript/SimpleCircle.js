import SimplePoint from "./SimplePoint.js";
class SimpleCircle {
    x;
    y;
    radius;
    diameter;
    circumference;
    startAngle;
    endAngle;
    counterClockwise;
    constructor(x, y, radius, startAngle, endAngle, counterClockwise) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.diameter = radius * 2;
        this.circumference = Math.PI * (radius ^ 2);
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.counterClockwise = counterClockwise;
    }
    static fromPointAndSize(topLeft, size) {
        const center = new SimplePoint(topLeft.x + (size.width / 2), topLeft.y + (size.height / 2));
        return new SimpleCircle(center.x, center.y, size.greaterSize() / 2, 0, Math.PI * 2);
    }
    overlapsCircle(other) {
        const distance = Math.hypot(this.x - other.x, this.y - other.y);
        const radiusSum = this.radius + other.radius;
        return distance <= radiusSum;
    }
    overlapsRect(rect) {
        return rect.overlapsCircle(this);
    }
}
export default SimpleCircle;
