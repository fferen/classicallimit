const GRID_W = 65536;
const GRID_OFF = 32768;

const COLOR_SCHEMES = [
    {
        'c1': [220, 50, 50],
        'g1': 5,
        'c2': [230, 194, 0],
        'g2': 20,
        'c3': [50, 50, 220],
        'g3': 40,
        'c4': [0, 0, 0],
        'name': 'Fire',
    },
    {
        'c1': [50, 50, 220],
        'g1': 5,
        'c2': [230, 194, 0],
        'g2': 20,
        'c3': [230, 20, 20],
        'g3': 40,
        'c4': [0, 0, 0],
        'name': 'BlueFire',
    },
    {
        'c1': [20, 163, 3],
        'g1': 5,
        'c2': [129, 140, 60],
        'g2': 20,
        'c3': [114, 96, 27],
        'g3': 40,
        'c4': [89, 58, 14],
        'name': 'Forest',
    },
    {
        'c1': [0, 132, 209],
        'g1': 5,
        'c2': [99, 177, 255],
        'g2': 20,
        'c3': [229, 190, 42],
        'g3': 40,
        'c4': [209, 169, 25],
        'name': 'Beach',
    },
];

const colorScheme = document.getElementById('color_scheme');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 15; // Size of each cell in pixels
const prob = 0.3;
let grid = new Map(); // map on cell => # gens has been on
let running = false; // Track animation state
let isMouseDown = false; // Track mouse button state
let cellsToggledDuringDrag = new Set(); // Track cells toggled during a drag
let cI = 0; // color scheme index

let h, w;   // size in # cells
updateSize();

window.addEventListener('resize', updateSize);

const playPauseButton = document.getElementById('playPauseButton');
const clearButton = document.getElementById('clearButton');
const resetButton = document.getElementById('resetButton');
const randButton = document.getElementById('randButton');

if (w < 40 || h < 40) {
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
    grid.set(getCV(x, y), 0);
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
    const c1 = COLOR_SCHEMES[cI].c1;
    const g1 = COLOR_SCHEMES[cI].g1;
    const c2 = COLOR_SCHEMES[cI].c2;
    const g2 = COLOR_SCHEMES[cI].g2;
    const c3 = COLOR_SCHEMES[cI].c3;
    const g3 = COLOR_SCHEMES[cI].g3;
    const c4 = COLOR_SCHEMES[cI].c4;

    colorScheme.innerHTML = COLOR_SCHEMES[cI].name;
    colorScheme.style.color = `rgb(${c1[0]},${c1[1]},${c1[2]})`;
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

    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            const v = getCV(j, i);
            if (grid.has(v)) {
                const t = grid.get(v);
                if (t <= g1) {
                    const w = t/g1;
                    ctx.fillStyle = `rgb(
                        ${c2[0]*w+c1[0]*(1-w)},
                        ${c2[1]*w+c1[1]*(1-w)},
                        ${c2[2]*w+c1[2]*(1-w)})`;
                } else if (t <= g2) {
                    const w = (t-g1)/(g2-g1);
                    ctx.fillStyle = `rgb(
                        ${c3[0]*w+c2[0]*(1-w)},
                        ${c3[1]*w+c2[1]*(1-w)},
                        ${c3[2]*w+c2[2]*(1-w)})`;
                } else if (t <= g3) {
                    const w = (t-g2)/(g3-g2);
                    ctx.fillStyle = `rgb(
                        ${c4[0]*w+c3[0]*(1-w)},
                        ${c4[1]*w+c3[1]*(1-w)},
                        ${c4[2]*w+c3[2]*(1-w)})`;
                } else {
                    ctx.fillStyle = `rgb(${c4[0]},${c4[1]},${c4[2]})`;
                }
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
            grid.set(v, 0);
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
    let nbrMap = new Map(); // map packed grid position to # nbrs
    let newGrid = new Map();

    function incNbr(x, y) {
        const v = getCV(x, y);
        if (nbrMap.has(v)) {
            nbrMap.set(v, nbrMap.get(v)+1);
        } else {
            nbrMap.set(v, 1);
        }
    }

    for (const [v, gens] of grid) {
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
        if (isOn && (nbrs === 2 || nbrs === 3)) {
            newGrid.set(v, grid.get(v)+1);
        } else if (!isOn && (nbrs === 3)) {
            newGrid.set(v, 0);
        }
    }

    grid = newGrid;
}

// Function to start or stop the animation
function toggleAnimation() {
    running = !running;
    if (running) {
        requestAnimationFrame(animate);
        playPauseButton.innerHTML = 'Pause';
    } else {
        playPauseButton.innerHTML = 'Play';
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
    } else if (event.key === "ArrowLeft") {
        cI = (cI-1+COLOR_SCHEMES.length) % COLOR_SCHEMES.length;
        drawGrid();
    } else if (event.key === "ArrowRight") {
        cI = (cI+1+COLOR_SCHEMES.length) % COLOR_SCHEMES.length;
        drawGrid();
    }
}

drawGrid();
