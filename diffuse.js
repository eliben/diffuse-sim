'use strict';

const GridWidth = 300;
const GridHeight = 300;
const NumDiffusePoints = 20;

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

function clearCanvas() {
    Ctx.clearRect(0, 0, Canvas.width, Canvas.height);
    Ctx.fillStyle = '#black';
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

clearCanvas();

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
