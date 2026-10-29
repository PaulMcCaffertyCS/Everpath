class SimpleSize {
  width: number;
  height: number;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  greaterDimension(): number {
    return this.width > this.height ? this.width : this.height;
  }

  lesserDimension(): number {
    return this.width < this.height ? this.width : this.height;
  }

  area(): number {
    return this.width * this.height;
  }
}

export default SimpleSize;