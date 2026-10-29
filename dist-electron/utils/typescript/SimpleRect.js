import SimplePoint from "./SimplePoint.js";
import SimpleSize from "./SimpleSize.js";
class SimpleRect {
    left;
    top;
    right;
    bottom;
    width;
    height;
    center;
    topLeft;
    topRight;
    bottomRight;
    bottomLeft;
    constructor(left, top, right, bottom) {
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
    static fromPointAndSize(center, size) {
        return new SimpleRect(center.x - (size.width / 2), center.y - (size.height / 2), center.x + (size.width / 2), center.y + (size.height / 2));
    }
    overlapsRect(other) {
        const distanceX = Math.abs(this.center.x - other.center.x);
        const minDistanceX = (this.width + other.width) / 2;
        if (distanceX >= minDistanceX)
            return false;
        const distanceY = Math.abs(this.center.y - other.center.y);
        const minDistanceY = (this.height + other.height) / 2;
        return distanceY >= minDistanceY;
    }
    overlapsCircle(circle) {
        const closestX = Math.max(this.left, Math.min(circle.x, this.right));
        const closestY = Math.max(this.top, Math.min(circle.y, this.bottom));
        const distance = Math.hypot(circle.x - closestX, circle.y - closestY);
        return distance <= circle.radius;
    }
}
export default SimpleRect;
