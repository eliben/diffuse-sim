'use strict';

const Canvas = document.getElementById('plot');
const Ctx = Canvas.getContext('2d');

initPlot();

function initPlot() {
    Ctx.clearRect(0, 0, Canvas.width, Canvas.height);
    Ctx.fillStyle = '#black';
    Ctx.fillRect(0, 0, Canvas.width, Canvas.height);
}