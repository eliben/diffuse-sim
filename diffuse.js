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
                    let nx = clampInt(x+dx, 0, GridWidth-1);
                    let ny = clampInt(y+dy, 0, GridHeight-1);
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
function getRandomInt(min, max) {
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

// Create initial set of diffuse points not too far from the center.
let diffusePoints = [];
for (let i = 0; i < NumDiffusePoints; i++) {
    diffusePoints.push({
        x: getRandomInt(-GridWidth / 10, GridWidth / 10) + middleX,
        y: getRandomInt(-GridHeight / 10, GridHeight / 10) + middleY,
    });
}

redraw();

for (let step = 1; step < 50; step++) {
    for (let pt of diffusePoints) {
        // Each diffuse point makes a random step
        let dx = getRandomInt(-1, 1);
        let dy = getRandomInt(-1, 1);

        pt.x = clampInt(pt.x + dx, 0, GridWidth-1);
        pt.y = clampInt(pt.y + dy, 0, GridHeight-1);

        // Check if this point should be fixed because it touches another
        // fixed point.
        if (grid.isNearCell(pt.x, pt.y)) {
            // Fix this point in the grid.
            grid.setCell(pt.x, pt.y);

            // TODO: need a "box" here.
            
            // Replace the diffuse point with a new one.
            pt.x = 
        }
    }

    console.log('step', step);
    redraw();
}
