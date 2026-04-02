const modeButtons = document.querySelectorAll(".mode-btn");
const playerSection = document.getElementById("playerNumberSection");
const overlay = document.getElementById("ludoStartOverlay");
const modeSection = document.getElementById("ludoModeSection");
const board = document.getElementById("board");
const boardCells = document.getElementById("board-cells");

let gameMode = null;
let playerCount = null;
let lastDiceValue = null;

const gameState = {
    red: [
        { position: -1, homeStep: -1 }, // -1 = inside base
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 }
    ],
    green: [
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 }
    ],
    yellow: [
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 }
    ],
    blue: [
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 },
        { position: -1, homeStep: -1 }
    ]
};

const mainPath = [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
    [0, 7], [0, 8],
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
    [7, 14], [8, 14],
    [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
    [14, 7], [14, 6],
    [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
    [7, 0], [6, 0]
];

const homePaths = {
    red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
    green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
    yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
    blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]]
};

const startIndex = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};
function shouldEnterHome(color, pos) {
    return pos >= 51;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        gameMode = btn.dataset.mode;

        if (gameMode === "ai") {
            startGame();
        } else {
            modeSection.style.display = "none";
            playerSection.style.display = "flex";
        }
    });
});
const playerButtons = document.querySelectorAll(".player-num-btn");

playerButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        playerCount = btn.dataset.playerNum;
        startGame();
    });
});

function startGame() {
    console.log("Game Mode:", gameMode);
    console.log("Players:", playerCount || "AI Mode");

    overlay.style.display = "none";
}

// board setup
// create grid
for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        cell.style.gridRow = r + 1;
        cell.style.gridColumn = c + 1;

        boardCells.appendChild(cell);
    }
}

function getCell(row, col) {
    return boardCells.children[row * 15 + col];
}
// color bases
const baseCoords = [
    { r: 0, c: 0, color: 'red' },
    { r: 0, c: 9, color: 'green' },
    { r: 9, c: 0, color: 'blue' },
    { r: 9, c: 9, color: 'yellow' }
];

baseCoords.forEach(base => {
    for (let r = base.r; r < base.r + 6; r++) {
        for (let c = base.c; c < base.c + 6; c++) {
            getCell(r, c).classList.add(`base-${base.color}`);
        }
    }
    const whiteBox = document.createElement("div");
    whiteBox.classList.add("white-base");
    whiteBox.style.gridRow = `${base.r + 2} / span 4`;
    whiteBox.style.gridColumn = `${base.c + 2} / span 4`;
    whiteBox.style.zIndex = "5";
    for (let i = 0; i < 4; i++) {
        const slot = document.createElement("div");
        slot.classList.add("token-slot");
        slot.dataset.color = base.color;
        const pin = document.createElement("div");
        pin.classList.add("pin", `pin-${base.color}`);
        pin.dataset.index = i;
        pin.dataset.color = base.color;

        pin.innerHTML = `<i class="fa-solid fa-location-dot fa-lg" style="color:#EAEFEF;"></i>`
        slot.appendChild(pin);
        whiteBox.appendChild(slot);
    }
    boardCells.appendChild(whiteBox);
});

// Cross paths
for (let i = 0; i < 15; i++) {
    for (let j = 6; j < 9; j++) {
        getCell(i, j).classList.add("path");
        getCell(j, i).classList.add("path");
    }
}
// home paths
for (let c = 1; c <= 5; c++) getCell(7, c).classList.add("home-red");
for (let r = 1; r <= 5; r++) getCell(r, 7).classList.add("home-green");
for (let c = 9; c <= 13; c++) getCell(7, c).classList.add("home-yellow");
for (let r = 9; r <= 13; r++) getCell(r, 7).classList.add("home-blue");

// center
// CREATE CENTER WRAPPER
const centerWrapper = document.createElement("div");
centerWrapper.classList.add("center-wrapper");

// Place wrapper at correct grid position
centerWrapper.style.gridRow = "7 / span 3";  // rows 6–8
centerWrapper.style.gridColumn = "7 / span 3"; // cols 6–8
centerWrapper.style.zIndex = "10";
boardCells.appendChild(centerWrapper);


// safe cells
const safeCells = [
    [8, 2], [2, 6], [6, 12], [12, 8]
];
const homeCells = [
    [6, 1], [1, 8], [8, 13], [13, 6]
];

safeCells.forEach(([r, c]) => getCell(r, c).classList.add("safe"));
getCell(6, 1).classList.add("home-red");
getCell(1, 8).classList.add("home-green");
getCell(8, 13).classList.add("home-yellow");
getCell(13, 6).classList.add("home-blue");
getCell(7, 0).classList.add("red-arrow");
getCell(0, 7).classList.add("green-arrow");
getCell(7, 14).classList.add("yellow-arrow");
getCell(14, 7).classList.add("blue-arrow");

//turn system
const players = ["red", "green", "yellow", "blue"];
let currentTurn = 0;

function updateTurnUI() {
    players.forEach(color => {
        const player = document.getElementById(`player-${color}`);
        const dice = player.querySelector(".dice-box");

        player.classList.remove("active");
        dice.classList.add("hidden");

        dice.onclick = null;
    });

    const activeColor = players[currentTurn];
    const activePlayer = document.getElementById(`player-${activeColor}`);
    const activeDiceBox = activePlayer.querySelector(".dice-box");
    activePlayer.classList.add("active");
    activeDiceBox.classList.remove("hidden");
    activeDiceBox.onclick = async () => {
        activeDiceBox.style.pointerEvents = "none";

        await rollDice(activeColor);

        activeDiceBox.style.pointerEvents = "auto";
    };
}

// start with red
updateTurnUI();

async function rollDice(playerColor) {
    const player = document.getElementById(`player-${playerColor}`);
    const dice = player.querySelector(".dice");

    // prevent spam clicking
    if (dice.classList.contains("rolling")) return;

    dice.classList.add("rolling");

    // rolling animation with random faces
    for (let i = 0; i < 10; i++) {
        dice.setAttribute("data-value", Math.floor(Math.random() * 6) + 1);
        await sleep(80);
    }

    // final result
    const finalValue = Math.floor(Math.random() * 6) + 1;
    dice.setAttribute("data-value", finalValue);

    dice.classList.remove("rolling");

    console.log(playerColor, "rolled:", finalValue);
    lastDiceValue = finalValue;
    const activeDiceBox = document
        .getElementById(`player-${playerColor}`)
        .querySelector(".dice-box");

    // disable dice during move selection
    activeDiceBox.style.pointerEvents = "none";

    handleMove(playerColor, finalValue);
}

async function handleMove(color, diceValue) {

    if (!canPlayerMove(color, diceValue)) {
        await sleep(500);
        nextTurn();
        return;
    }
    const pins = document.querySelectorAll(`.pin-${color}`);

    pins.forEach(pin => {
        pin.classList.remove("active");
        const index = pin.dataset.index;
        const state = gameState[color][index];
        // ARROW → CENTER CONDITION
        if (state.position === 50 && diceValue === 6) {

            pin.classList.add("active");

            pin.onclick = () => {
                clearSelection();

                const oldCell = pin.parentElement;
                pin.classList.remove("active");

                moveToCenter(pin, color);

                state.position = -2;
                state.homeStep = 5;

                if (oldCell) updateCellLayout(oldCell);

                if (checkWin(color)) {
                    alert(color + " wins!");
                }

                nextTurn();
            };

            return;
        }
        // HANDLE HOME LOGIC FIRST
        if (state.homeStep >= 0) {

            const handled = handleHomePin(pin, color, index, diceValue);

            if (handled) return;
        }

        // unlock condition
        if (state.position === -1 && diceValue === 6) {
            pin.classList.add("active");

            pin.onclick = () => {
                clearSelection();
                moveOut(pin, color, index);
            };
        }

        // normal move (later)
        else if (state.position >= 0) {
            pin.classList.add("active");

            pin.onclick = () => {
                clearSelection();
                movePin(pin, color, index, diceValue);
            };
        }
    });
}

function canPlayerMove(color, diceValue) {
    const pieces = gameState[color];

    return pieces.some(p => {
        // allow arrow → center
        if (p.position === 51 && diceValue === 6) return true;
        if (p.position === -1 && diceValue === 6) return true; // unlock
        if (p.position >= 0) return true; // already on board
        if (p.homeStep >= 0 && p.homeStep < 5 && p.homeStep + diceValue <= 5) {
            return true;
        }
        return false;
    });
}

function moveOut(pin, color, index) {
    const start = startIndex[color];

    const [r, c] = mainPath[start];
    const cell = getCell(r, c);

    cell.appendChild(pin);
    updateCellLayout(cell);
    gameState[color][index].position = 0;
    console.log(cell);
    clearSelection();
    nextTurn();
}

function movePin(pin, color, index, steps) {
    const state = gameState[color][index];
    let oldPos = state.position;
    let targetPos = oldPos + steps;

    // 🧠 DEBUG LOG
    console.log("MOVE DEBUG:", {
        oldPos,
        steps,
        targetPos
    });
    console.log("STATE:", gameState[color][index]);

    if (targetPos > 50) {
        const stepsIntoHome = targetPos - 50;

        console.log("Enter home debug:",{
            targetPos,
            stepsIntoHome
        });
        if(oldPos===50 && steps===6){
            moveToCenter(pin, color);
            state.position = -2;
            state.homeStep = 5;
            console.log("Moved to CENTER directly from arrow!");
            if (checkWin(color)) alert(color + " wins!");
            clearSelection();
            nextTurn();
            return;
        }
        const homeStep = stepsIntoHome-1;
        if (homeStep <0 || homeStep > 5){ 
            console.log("Invalid home move, must be exact. Staying on last position.");
            return; }// must be exact to enter home
        const [r, c] = homePaths[color][homeStep];
        const cell = getCell(r, c);
        const oldCell = pin.parentElement;

        cell.appendChild(pin);

        state.position = -2;
        state.homeStep = homeStep;
        console.log("Moved to HOME:", homeStep);
        if (oldCell) updateCellLayout(oldCell);
        updateCellLayout(cell);

        if (homeStep === 5) moveToCenter(pin, color);
        

        clearSelection();
        nextTurn();
        return;
    }

    const start = startIndex[color];
    const realIndex = (start + targetPos) % 52;
    const [r, c] = mainPath[realIndex];
    const cell = getCell(r, c);
    const oldCell = pin.parentElement;
    cell.appendChild(pin);
    if (!cell.classList.contains("home-red") &&
        !cell.classList.contains("home-green") &&
        !cell.classList.contains("home-yellow") &&
        !cell.classList.contains("home-blue")) {

        checkKill(r, c, color);
    }
    state.position = targetPos;
    if (oldCell) updateCellLayout(oldCell);
    updateCellLayout(cell);

    clearSelection();
    nextTurn();
}

function moveToCenter(pin, color) {

    const center = document.querySelector(".center-wrapper");
    pin.style.top = "";
    pin.style.left = "";
    pin.style.transform = "";
    pin.style.position = "absolute";
    pin.classList.remove("active");
    pin.style.zIndex = "999";
    center.appendChild(pin);

    const pins = center.querySelectorAll(`.pin[data-color="${color}"]`);

    pins.forEach((p, i) => {

        // COLOR BASED POSITIONING
        if (color === "red") {
            p.style.left = "20%";
            p.style.top = (30 + i * 20) + "%";
        }

        if (color === "green") {
            p.style.top = "20%";
            p.style.left = (30 + i * 20) + "%";
        }

        if (color === "yellow") {
            p.style.left = "80%";
            p.style.top = (30 + i * 20) + "%";
        }

        if (color === "blue") {
            p.style.top = "80%";
            p.style.left = (30 + i * 20) + "%";
        }

        p.style.transform = "translate(-50%, -50%)";
    });
}

function clearSelection() {
    document.querySelectorAll(".pin").forEach(p => {
        p.classList.remove("active");

        p.onclick = null;
    });
}

function nextTurn() {

    if (lastDiceValue === 6) {
        updateTurnUI();
        return;
    }
    currentTurn = (currentTurn + 1) % players.length;
    updateTurnUI();
}

function checkKill(r, c, currentColor) {

    const cell = getCell(r, c);

    const pins = cell.querySelectorAll(".pin");

    pins.forEach(pin => {
        const enemyColor = pin.dataset.color;

        if (enemyColor !== currentColor) {

            // check safe cell
            if ($(cell).hasClass("safe")) return;

            const index = pin.dataset.index;

            console.log("Killed:", enemyColor);

            // send back to base
            sendToBase(pin, enemyColor, index);
        }
    });
}

function sendToBase(pin, color, index) {

    const oldCell = pin.parentElement;

    const baseAreas = document.querySelectorAll(".white-base");

    let targetBase = null;

    baseAreas.forEach(base => {
        if (base.querySelector(`.token-slot[data-color="${color}"]`)) {
            targetBase = base;
        }
    });

    if (!targetBase) return;

    const slots = targetBase.querySelectorAll(".token-slot");
    const targetSlot = slots[index];

    $(targetSlot).append(pin);

    gameState[color][index].position = -1;

    if (oldCell) updateCellLayout(oldCell);
    updateCellLayout(targetSlot);
}

function updateCellLayout(cell) {
    const pins = cell.querySelectorAll(".pin");
    const count = pins.length;

    // remove old classes
    cell.classList.remove("pins-1", "pins-2", "pins-3", "pins-4");

    // add new class
    if (count > 0) {
        cell.classList.add(`pins-${count}`);
    }
}

function checkWin(color) {
    return gameState[color].every(p => p.homeStep === 5);
}
// debug function to move any piece to any cell (for testing purposes)
function debugMove(color, index, row, col) {

    const pin = document.querySelector(
        `.pin[data-color="${color}"][data-index="${index}"]`
    );

    if (!pin) {
        console.error("Pin not found");
        return;
    }

    const state = gameState[color][index];
    const targetCell = getCell(row, col);
    const oldCell = pin.parentElement;

    // move visually
    targetCell.appendChild(pin);

    // update layout
    if (oldCell) updateCellLayout(oldCell);
    updateCellLayout(targetCell);

    //  RESET STATE FIRST
    state.position = -1;
    state.homeStep = -1;

    //  CASE 1: HOME PATH
    const homeIndex = homePaths[color].findIndex(
        ([r, c]) => r === row && c === col
    );

    if (homeIndex !== -1) {

        state.homeStep = homeIndex;
        state.position = -2;

        //  if center
        if (homeIndex === 5) {
            moveToCenter(pin, color);
        }

        console.log("Moved to HOME:", homeIndex);
        return;
    }

    // CASE 2: MAIN PATH
    const pathIndex = mainPath.findIndex(
        ([r, c]) => r === row && c === col
    );

    if (pathIndex !== -1) {
        const start = startIndex[color];

        // convert global path → player relative position
        const relativePos = (pathIndex - start + 52) % 52;

        state.position = relativePos;
        state.homeStep = -1;

        console.log("Moved to PATH:", relativePos);
        return;
    }

    // CASE 3: BASE (default fallback)
    state.position = -1;
    state.homeStep = -1;

    console.log("Moved to BASE");
}

function handleHomePin(pin, color, index, diceValue) {

    const state = gameState[color][index];

    // already finished → ignore
    if (state.homeStep === 5) return false;

    const targetStep = state.homeStep + diceValue;

    // invalid move (must be exact)
    if (targetStep > 5) return false;

    //make selectable
    pin.classList.add("active");

    pin.onclick = () => {

        clearSelection();

        const oldCell = pin.parentElement;

        // CENTER CASE
        if (targetStep === 5) {

            moveToCenter(pin, color);

            state.homeStep = 5;
            state.position = -2;

            if (oldCell) updateCellLayout(oldCell);

            if (checkWin(color)) {
                alert(color + " wins!");
            }

            nextTurn();
            return;
        }

        // NORMAL HOME MOVE
        const [r, c] = homePaths[color][targetStep];
        const cell = getCell(r, c);

        cell.appendChild(pin);

        state.homeStep = targetStep;

        if (oldCell) updateCellLayout(oldCell);
        updateCellLayout(cell);

        nextTurn();
    };

    return true; // means handled
}

function debugDice(color, value) {

    console.log("DEBUG DICE:", color, value);

    lastDiceValue = value;

    handleMove(color, value);
}