export {};

function isWaterGraphic(graphicLayer1: number) {
    return (
        (graphicLayer1 >= 1505 && graphicLayer1 <= 1520) ||
        (graphicLayer1 >= 5665 && graphicLayer1 <= 5680) ||
        (graphicLayer1 >= 13547 && graphicLayer1 <= 13562) ||
        (graphicLayer1 >= 36563 && graphicLayer1 <= 36578)
    );
}

function isWaterTileGraphics(graphicLayer1: number, graphicLayer2: number) {
    return isWaterGraphic(graphicLayer1) && !graphicLayer2;
}

module.exports = {
    isWaterGraphic,
    isWaterTileGraphics,
};
