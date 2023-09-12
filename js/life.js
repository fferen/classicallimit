const GRID_W = 65536;
const GRID_OFF = 32768;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 15; // Size of each cell in pixels
const prob = 0.3;
let grid = new Set(); // The grid of cells
let running = false; // Track animation state
let isMouseDown = false; // Track mouse button state
let cellsToggledDuringDrag = new Set(); // Track cells toggled during a drag

let h, w;   // size in # cells
updateSize();

window.addEventListener('resize', updateSize);

const playPauseButton = document.getElementById('playPauseButton');
const clearButton = document.getElementById('clearButton');
const resetButton = document.getElementById('resetButton');
const randButton = document.getElementById('randButton');

if (w < 40 || h < 50) {
    document.getElementById('control-buttons').style.display = "none";
    document.getElementById('drawPrompt').innerHTML = "View on desktop for a surprise...";
    ctx.fillStyle = "rgb(240,240,240)";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    uhetonas // syntax error to stop execution
}

// Initialize the grid based on the current window size
initPattern();

canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    cellsToggledDuringDrag.clear(); // Clear the set when starting a new drag
    toggleCell(event.offsetX, event.offsetY);
});
canvas.addEventListener('mouseup', () => (isMouseDown = false));
canvas.addEventListener('mousemove', handleMouseMove);
playPauseButton.addEventListener('click', () => {
    toggleAnimation();
    if (running) {
        playPauseButton.innerHTML = 'Pause';
    } else {
        playPauseButton.innerHTML = 'Play';
    }
});
playPauseButton.addEventListener('click', stopPulse);
clearButton.addEventListener('click', clearGrid);
resetButton.addEventListener('click', () => {
    clearGrid();
    initPattern();
    drawGrid();
});
randButton.addEventListener('click', () => {
    clearGrid();
    initPatternRand(prob);
    drawGrid();
});
document.addEventListener('keydown', handleKeyPress);

// prevent focus on buttons (then space will activate)
document.querySelectorAll("button").forEach( function(item) {
    item.addEventListener('focus', function() {
        this.blur();
    })
})

var isPlayClicked = false;
function stopPulse() {
    if (!isPlayClicked) {
        playPauseButton.style.animationName = 'none';
        playPauseButton.style.backgroundColor = '#fff';
        isPlayClicked = true;
    }
}

//toggleAnimation();

function updateSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    h = Math.floor(canvas.height / cellSize);
    w = Math.floor(canvas.width / cellSize);
    drawGrid();
}

function initPattern() {
    if (!initPatternP177()) {
        initPatternRand(prob);
    }
}

function getCXY(v) {
    return [Math.floor(v/GRID_W)-GRID_OFF, (v % GRID_W)-GRID_OFF];
}
function getCV(x, y) {
    return (x+GRID_OFF)*GRID_W+y+GRID_OFF;
}
function setC(x, y) {
    grid.add(getCV(x, y));
}
function setCG(g, x, y) {
    g.add(getCV(x, y));
}
function isC(x, y) {
    return grid.has(getCV(x, y));
}

function initPatternStr(s, xOff, yOff) {
    const pRows = s.split(/\s+/);
    const pH = pRows.length;
    let pW = 0;
    for (const a of pRows) {
        if (a.length > pW) {
            pW = a.length;
        }
    }
    if (h < pH || w < pW) {
        return false;
    }
    const i0 = Math.floor((h-pH)/2);
    const j0 = Math.floor((w-pW)/2);
    for (let i = i0; i < i0+pH; i++) {
        for (let j = j0; j-j0 < pRows[i-i0].length; j++) {
            if (pRows[i-i0][j-j0] == 'O') {
                setC(j+xOff, i+yOff);
            }
        }
    }
    return true;
}

function initPatternP177() {
    const s = "................O............O................  .........OO........................OO.........  ........OOO...OO..............OO...OOO........  ..............OO.OO........OO.OO..............  ................O............O................  ..............................................  ..............................................  ..............................................  ..O........................................O..  .OO........................................OO.  .OO........................................OO.  ..............................................  ..............................................  ..............................................  ..OO......................................OO..  ..OO......................................OO..  O...O....................................O...O ...O......................................O...  ...O......................................O...  ..............................................  ..............................................  ..............................................  ..............................................  ..............................................  ..............................................  ..............................................  ..............................................  ...O......................................O...  ...O......................................O...  O...O....................................O...O ..OO......................................OO..  ..OO......................................OO..  ..............................................  ..............................................  ..............................................  .OO........................................OO.  .OO........................................OO.  ..O........................................O..  ..............................................  ..............................................  ..............................................  ................O............O................  ..............OO.OO........OO.OO..............  ........OOO...OO..............OO...OOO........  .........OO........................OO.........  ................O............O................";
    return initPatternStr(s, 0, 0);
}

function initPatternAcorn() {
    const s = ".O ...O OO..OOO";
    return initPatternStr(s, 30, 0);
}

function initPatternGliderGun() {
    const s = "........................O........... ......................O.O...........  ............OO......OO............OO ...........O...O....OO............OO OO........O.....O...OO.............. OO........O...O.OO....O.O...........  ..........O.....O.......O........... ...........O...O....................  ............OO......................";
    return initPatternStr(s, 0, 0);
}

function initPatternRand(prob) {
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (Math.random() < prob) {
                setC(j, i);
            }
        }
    }
}

// Function to draw the grid
function drawGrid() {
//            ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(240,240,240)";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= h; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    for (let j = 0; j <= w; j++) {
        ctx.beginPath();
        ctx.moveTo(j * cellSize, 0);
        ctx.lineTo(j * cellSize, canvas.height);
        ctx.stroke();
    }

    ctx.fillStyle = "rgb(100,120,200)";
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (isC(j, i)) {
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Function to toggle a cell's state
function toggleCell(x, y) {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const v = getCV(cellX, cellY);
    if (!cellsToggledDuringDrag.has(v)) {
        if (grid.has(v)) {
            grid.delete(v);
        } else {
            grid.add(v);
        }
        cellsToggledDuringDrag.add(v);
        drawGrid();
    }
}

// Function to handle mouse move events
function handleMouseMove(event) {
    if (isMouseDown) {
        toggleCell(event.offsetX, event.offsetY);
    }
}

// Function to update the grid based on the rules of the Game of Life
function updateGrid() {
    let nbrMap = new Map();
    let newGrid = new Set();

    function incNbr(x, y) {
        const v = getCV(x, y);
        if (nbrMap.has(v)) {
            nbrMap.set(v, nbrMap.get(v)+1);
        } else {
            nbrMap.set(v, 1);
        }
    }

    for (const v of grid) {
        const [x, y] = getCXY(v);
        incNbr(x-1, y-1);
        incNbr(x-1, y);
        incNbr(x-1, y+1);
        incNbr(x, y-1);
        incNbr(x, y+1);
        incNbr(x+1, y-1);
        incNbr(x+1, y);
        incNbr(x+1, y+1);
    }

    for (const [v, nbrs] of nbrMap) {
        const isOn = grid.has(v);
        if ((isOn && (nbrs === 2 || nbrs === 3)) ||
            (!isOn && (nbrs === 3))) {
            newGrid.add(v);
        }
    }

    grid = newGrid;
}

// Function to start or stop the animation
function toggleAnimation() {
    running = !running;
    if (running) {
        requestAnimationFrame(animate);
    }
}

// Function to handle clear button click
function clearGrid() {
    grid.clear();
    drawGrid();
    if (running) {
        toggleAnimation();
    }
}

// Animation loop
function animate() {
    if (running) {
        updateGrid();
        drawGrid();
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 33);
    }
}

// Function to handle key presses
function handleKeyPress(event) {
    if (event.key === ' ') {
        toggleAnimation();
        stopPulse();
    }
}

drawGrid();
