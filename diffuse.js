'use strict';

const GridWidth = 400;
const GridHeight = 400;
const NumDiffusePoints = 30;
const StepsPerDraw = 100;

const FixedColor = "#ffffff";
const DiffuseColor = "#557755";
const TextColor = "#f2ec96";

const Canvas = document.getElementById('plot');
const Ctx = Canvas.getContext('2d');
const RunButton = document.getElementById('run');
const NumStepsInput = document.getElementById('numsteps');
NumStepsInput.value = 20000;
const StopButton = document.getElementById('stop');

RunButton.addEventListener("mousedown", onRun);
StopButton.addEventListener("mousedown", onStop);

Ctx.font = "10px serif";
Canvas.width = GridWidth;
Canvas.height = GridHeight;

const RunState = Object.freeze({
    RUNNING: "running",
    STOPPED: "stopped",
});

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

    // Is the given (x,y) point on the grid or adjacent to a cell in this grid?
    isNearCell(x, y) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let nx = clampInt(x + dx, 0, GridWidth - 1);
                let ny = clampInt(y + dy, 0, GridHeight - 1);
                if (grid.getCell(nx, ny)) {
                    return true;
                }
            }
        }
        return false;
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

    Ctx.fillStyle = TextColor;
    Ctx.fillText(`${state.curStep}`, 10, GridWidth - 10);

    if (state.runState == RunState.RUNNING) {
        RunButton.disabled = true;
        NumStepsInput.disabled = true;
        StopButton.disabled = false;
    } else {
        RunButton.disabled = false;
        NumStepsInput.disabled = false;
        StopButton.disabled = true;
    }
}

// ------------------

let state = {
    runState: RunState.STOPPED,
    curStep: 0,
}

let grid = new PlotGrid(GridWidth, GridHeight);

let middleY = GridHeight / 2;
let middleX = GridWidth / 2;
// Initialize a single fixed point at the center
grid.setCell(middleX, middleY, true);

// A "bound box" around the currently fixed points sets the boundaries for
// where to generate new diffuse points, and also restrict their random walk.
let boundBoxStartX = middleX - 10;
let boundBoxStartY = middleY - 10;
let boundBoxEndX = middleX + 10;
let boundBoxEndY = middleY + 10;

// Create initial set of diffuse points..
let diffusePoints = [];
for (let i = 0; i < NumDiffusePoints; i++) {
    diffusePoints.push({
        x: randIntInRange(boundBoxStartX, boundBoxEndX),
        y: randIntInRange(boundBoxStartY, boundBoxEndY),
    });
}

redraw();

function onRun() {
    let numSteps = parseInt(NumStepsInput.value, 10);
    state.runState = RunState.RUNNING;
    doSteps(numSteps);
    redraw();
}

function onStop() {
    state.runState = RunState.STOPPED;
    redraw();
}

// doSteps runs numSteps simulation steps starting with state.curStep. It breaks
// this task into multiple self-invocations via setTimeout, running no more
// than StepsPerDraw steps per invocation.
function doSteps(numSteps) {
    let n = state.curStep;
    for (; n < state.curStep + Math.min(StepsPerDraw, numSteps); n++) {
        for (let pt of diffusePoints) {
            // Each diffuse point makes a random step
            let dx = randIntInRange(-1, 1);
            let dy = randIntInRange(-1, 1);

            pt.x = clampInt(pt.x + dx, boundBoxStartX, boundBoxEndX);
            pt.y = clampInt(pt.y + dy, boundBoxStartY, boundBoxEndY);

            // Check if this point should be fixed because it touches another
            // fixed point.
            if (grid.isNearCell(pt.x, pt.y)) {
                // Fix this point in the grid.
                grid.setCell(pt.x, pt.y, true);
                updateBoundBox(pt.x, pt.y);

                // Replace the diffuse point with a new one that's not already
                // on the grid or adjacent to a fixed point.
                let attempts = 0;
                while (grid.isNearCell(pt.x, pt.y)) {
                    pt.x = randIntInRange(boundBoxStartX, boundBoxEndX);
                    pt.y = randIntInRange(boundBoxStartY, boundBoxEndY);
                    attempts++;

                    if (attempts >= 100) {
                        alert("Too many fixed points; please restart simulation!");
                        return;
                    }
                }
            }
        }
    }

    let stepsRan = n - state.curStep;
    state.curStep = n;

    if (state.runState == RunState.RUNNING && stepsRan < numSteps) {
        setTimeout(doSteps, 0, numSteps - stepsRan);
    } else {
        state.runState = RunState.STOPPED;
    }
    redraw();
}

// Updates the bound box based on new coordinates for an added fixed point.
// The bound box will try to remain 10 px away from the farthest fixed point,
// clamped to the canvas boundaries.
function updateBoundBox(newX, newY) {
    boundBoxStartX = Math.max(0, Math.min(boundBoxStartX, newX - 10));
    boundBoxStartY = Math.max(0, Math.min(boundBoxStartY, newY - 10));

    boundBoxEndX = Math.min(GridWidth - 1, Math.max(boundBoxEndX, newX + 10));
    boundBoxEndY = Math.min(GridHeight - 1, Math.max(boundBoxEndY, newY + 10));
}