'use strict';

const GridWidth = 300;
const GridHeight = 300;
const NumDiffusePoints = 20;
const NumSteps = 10000;

const FixedColor = "#ffffff";
const DiffuseColor = "#555555";

const Canvas = document.getElementById('plot');
const Ctx = Canvas.getContext('2d');
Canvas.width = GridWidth;
Canvas.height = GridHeight;

class PlotGrid {
    constructor(width, height) {
        this.w = width;
        this.h = height;

        this.data = Array(this.w * this.h).fill(false);
    }

    getCell(x, y) {
        return this.data[y * this.w + x];
    }

    setCell(x, y, value) {
        this.data[y * this.w + x] = value;
    }

    // Is the given (x,y) point adjacent to a cell in this grid?
    isNearCell(x, y) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx != 0 || dy != 0) {
                    let nx = clampInt(x + dx, 0, GridWidth - 1);
                    let ny = clampInt(y + dy, 0, GridHeight - 1);
                    if (grid.getCell(nx, ny)) {
                        return true;
                    }
                }
            }
            return false;
        }
    }

    flipCell(x, y) {
        this.data[y * this.w + x] = !this.data[y * this.w + x];
    }

    clear() {
        this.data.fill(false);
    }
}

// Returns a random integer in the inclusive range [min, max].
function randIntInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampInt(value, minVal, maxVal) {
    return Math.min(Math.max(value, minVal), maxVal);
}

function clearCanvas() {
    Ctx.fillStyle = '#000000';
    Ctx.fillRect(0, 0, Canvas.width, Canvas.height);
}

function redraw() {
    clearCanvas();

    // Draw the fixed points
    Ctx.fillStyle = FixedColor;
    for (let x = 0; x < GridWidth; x++) {
        for (let y = 0; y < GridHeight; y++) {
            if (grid.getCell(x, y)) {
                Ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // Draw the diffuse points
    Ctx.fillStyle = DiffuseColor;
    for (let pt of diffusePoints) {
        Ctx.fillRect(pt.x, pt.y, 1, 1);
    }
}

// ------------------

let grid = new PlotGrid(GridWidth, GridHeight);

let middleY = GridHeight / 2;
let middleX = GridWidth / 2;
// Initialize a single fixed point at the center
grid.setCell(middleX, middleY, true);

// A "bound box" around the currently fixed points sets the boundaries for
// where to generate new diffuse points.
let boundBoxStartX = middleX - 10;
let boundBoxStartY = middleY - 10;
let boundBoxEndX = middleX + 10;
let boundBoxEndY = middleY + 10;

// Create initial set of diffuse points not too far from the center.
let diffusePoints = [];
for (let i = 0; i < NumDiffusePoints; i++) {
    diffusePoints.push({
        x: randIntInRange(boundBoxStartX, boundBoxEndX),
        y: randIntInRange(boundBoxStartY, boundBoxEndY),
    });
}

redraw();

function doStep(stepn, maxSteps) {
    for (let pt of diffusePoints) {
        // Each diffuse point makes a random step
        let dx = randIntInRange(-1, 1);
        let dy = randIntInRange(-1, 1);

        pt.x = clampInt(pt.x + dx, 0, GridWidth - 1);
        pt.y = clampInt(pt.y + dy, 0, GridHeight - 1);

        // Check if this point should be fixed because it touches another
        // fixed point.
        if (grid.isNearCell(pt.x, pt.y)) {
            // Fix this point in the grid.
            console.log(`fixing ${pt.x} ${pt.y}`);
            grid.setCell(pt.x, pt.y);
            updateBoundBox(pt.x, pt.y);

            // Replace the diffuse point with a new one.
            pt.x = randIntInRange(boundBoxStartX, boundBoxEndX);
            pt.y = randIntInRange(boundBoxStartY, boundBoxEndY);
        }
    }

    redraw();
    console.log(`step ${stepn}`);

    if (stepn < maxSteps) {
        setTimeout(doStep, 0, stepn + 1, maxSteps);
    }
}

doStep(1, 500);

// Updates the bound box based on new coordinates for an added fixed point.
// The bound box will try to remain 10 px away from the farthest fixed point,
// clamped to the canvas boundaries.
function updateBoundBox(newX, newY) {
    boundBoxStartX = Math.max(0, Math.min(boundBoxStartX, newX - 10));
    boundBoxStartY = Math.max(0, Math.min(boundBoxStartY, newY - 10));

    boundBoxEndX = Math.min(GridWidth - 1, Math.max(boundBoxEndX, newX + 10));
    boundBoxEndY = Math.min(GridHeight - 1, Math.max(boundBoxEndY, newY + 10));
}