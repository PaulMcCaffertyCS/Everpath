function isBox(shape) {
    return shape === "square" || shape === "rectangle";
}
function isRound(shape) {
    return shape === "circle" || shape === "oval";
}
export { isBox, isRound };
