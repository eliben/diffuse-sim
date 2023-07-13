'use strict';

const GridWidth = 400;
const GridHeight = 400;
const NumDiffusePoints = 50;
const StepsPerDraw = 100;

const FixedColor = "#ffffff";
const DiffuseColor = "#66aa55";
const TextColor = "#f2ec96";

// RunState enumeration type.
const RunState = Object.freeze({
    RUNNING: "running",
    STOPPED: "stopped",
});

// Logical representation of the 2D grid with fixed points (cells).
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

// Clamps an integer value to a minimum and a maximum.
function clampInt(value, minVal, maxVal) {
    return Math.min(Math.max(value, minVal), maxVal);
}

// Redraws the UI state.
function redraw() {
    Ctx.fillStyle = '#000000';
    Ctx.fillRect(0, 0, Canvas.width, Canvas.height);

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

    // Current step indicator on the canvas
    Ctx.fillStyle = TextColor;
    Ctx.fillText(`${state.curStep}`, 10, GridWidth - 10);

    // Set UI input elements' state according to simulation state.
    if (state.runState == RunState.RUNNING) {
        AlgorithmSelect.disabled = true;
        RunButton.disabled = true;
        NumStepsInput.disabled = true;
        StopButton.disabled = false;
    } else {
        AlgorithmSelect.disabled = false;
        RunButton.disabled = false;
        NumStepsInput.disabled = false;
        StopButton.disabled = true;
    }
}

function onRun() {
    let numSteps = Number(NumStepsInput.value);
    if (isNaN(numSteps)) {
        alert("Please enter a valid numeric number of steps!");
    } else {
        state.runState = RunState.RUNNING;
        doSteps(numSteps);
        redraw();
    }
}

function onStop() {
    state.runState = RunState.STOPPED;
    redraw();
}

// doSteps runs numSteps simulation steps starting with state.curStep. It breaks
// this task into multiple self-invocations via setTimeout, running no more
// than StepsPerDraw steps per invocation.
function doSteps(numSteps) {
    // This loop runs no more than StepsPerDraw.
    let n = 0;
    for (; n < Math.min(StepsPerDraw, numSteps); n++) {
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
                    [pt.x, pt.y] = generateDiffusePoint();
                    attempts++;
                    if (attempts >= 100) {
                        alert("Too many fixed points; please restart simulation!");
                        return;
                    }
                }
            }
        }
    }
    state.curStep += n;

    // If we're still in a running steps and there ar emore steps to run,
    // ask to be invoked again with the remaining number of steps.
    if (state.runState == RunState.RUNNING && n < numSteps) {
        setTimeout(doSteps, 0, numSteps - n);
    } else {
        state.runState = RunState.STOPPED;
    }
    redraw();
}

// Generates a random diffuse point based on the selected algorithm. Returns
// an array [x, y]
function generateDiffusePoint() {
    if (AlgorithmSelect.value === "radial") {
        let reach = Math.max(
            (boundBoxEndX - boundBoxStartX) / 2,
            (boundBoxEndY - boundBoxStartY) / 2);

        let angle = Math.random() * 2 * Math.PI;
        return [
            clampInt(middleX + Math.cos(angle) * reach, 0, GridWidth),
            clampInt(middleY + Math.sin(angle) * reach, 0, GridHeight)];
    } else { // boxy
        return [
            randIntInRange(boundBoxStartX, boundBoxEndX),
            randIntInRange(boundBoxStartY, boundBoxEndY),
        ];
    }
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

// ----------------------------------------------------------------------------

const Canvas = document.getElementById('plot');
const Ctx = Canvas.getContext('2d');
const AlgorithmSelect = document.getElementById('algorithm');
const RunButton = document.getElementById('run');
const NumStepsInput = document.getElementById('numsteps');
NumStepsInput.value = 20000;
const StopButton = document.getElementById('stop');

RunButton.addEventListener("mousedown", onRun);
StopButton.addEventListener("mousedown", onStop);

Ctx.font = "10px serif";
Canvas.width = GridWidth;
Canvas.height = GridHeight;


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
