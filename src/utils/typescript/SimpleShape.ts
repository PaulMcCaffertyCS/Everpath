class SimpleShape {
  shape: "square" | "rectangle" | "circle" | "oval";
  
  constructor(shape: "square" | "rectangle" | "circle" | "oval") {
    this.shape = shape;
  }

  isBox(): boolean {
    return this.shape === "square" || this.shape === "rectangle";
  }

  isRound(): boolean {
    return this.shape === "circle" || this.shape === "oval";
  }
}

export default SimpleShape;