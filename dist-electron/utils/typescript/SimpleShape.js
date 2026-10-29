class SimpleShape {
    shape;
    constructor(shape) {
        this.shape = shape;
    }
    isBox() {
        return this.shape === "square" || this.shape === "rectangle";
    }
    isRound() {
        return this.shape === "circle" || this.shape === "oval";
    }
}
export default SimpleShape;
