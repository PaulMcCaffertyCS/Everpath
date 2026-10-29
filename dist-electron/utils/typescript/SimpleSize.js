class SimpleSize {
    width;
    height;
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    greaterDimension() {
        return this.width > this.height ? this.width : this.height;
    }
    lesserDimension() {
        return this.width < this.height ? this.width : this.height;
    }
    area() {
        return this.width * this.height;
    }
}
export default SimpleSize;
