const modeButtons = document.querySelectorAll(".mode-btn");
const playerSection = document.getElementById("playerNumberSection");
const overlay = document.getElementById("ludoStartOverlay");
const modeSection = document.getElementById("ludoModeSection");
const board = document.getElementById("board");
const boardCells = document.getElementById("board-cells");
const backBtn = document.getElementById("backBtn");
const soundBtn = document.getElementById("soundBtn");
const exitBtn = document.getElementById("exitBtn");

let soundEnabled = true;
let gameMode = null;
let playerCount = null;
let lastDiceValue = null;
let activePlayers = [];
let sixCount = 0;
let finishedPlayers = [];
let gameStartTime;
const sounds = {
    dice: new Audio("../../assets/sounds/dice.mp3"),
    move: new Audio("../../assets/sounds/move.mp3"),
    kill: new Audio("../../assets/sounds/kill.mp3"),
    win: new Audio("../../assets/sounds/winner.mp3"),
    confetti: new Audio("../../assets/sounds/confetti.mp3")
}
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

backBtn.onclick = () => {
    location.reload(); // easiest reset
};

soundBtn.onclick = () => {
    soundEnabled = !soundEnabled;

    const icon = document.getElementById("volume-icon");

    icon.classList.toggle("fa-volume-high");
    icon.classList.toggle("fa-volume-xmark");
};

function playSound(type) {
    if (!soundEnabled) return;
    const s = sounds[type];
    if (s) {
        s.currentTime = 0;
        s.play();
    }
}

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
let players = ["red", "green", "yellow", "blue"];
function startGame() {
    console.log("Game Mode:", gameMode);
    console.log("Players:", playerCount || "AI Mode");

    overlay.style.display = "none";

    $(".top-controls").show();
    if (playerCount == 2) {
        activePlayers = ["blue", "green"];
    } else if (playerCount == 3) {
        activePlayers = ["blue", "red", "green"];
    } else {
        activePlayers = ["blue", "red", "green", "yellow"];
    }
    players.forEach(color => {
        if (!activePlayers.includes(color)) {
            const player = document.getElementById(`player-${color}`);
            player.style.opacity = "0.3";
            player.style.pointerEvents = "none";
        }
    });
    currentTurn = 0;
    createdBoard();
    updateTurnUI();
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
const safeCells = [
    [8, 2], [2, 6], [6, 12], [12, 8]
];
const homeCells = [
    [6, 1], [1, 8], [8, 13], [13, 6]
];
function createdBoard() {
    gameStartTime = Date.now();
    baseCoords.forEach(base => {
        for (let r = base.r; r < base.r + 6; r++) {
            for (let c = base.c; c < base.c + 6; c++) {
                getCell(r, c).classList.add(`base-${base.color}`, `base-area`, `base-${base.color}-area`);
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
            if (activePlayers.includes(base.color)) {
                const pin = document.createElement("div");
                pin.classList.add("pin", `pin-${base.color}`);
                pin.dataset.index = i;
                pin.dataset.color = base.color;

                pin.innerHTML = `<i class="fa-solid fa-location-dot fa-lg" style="color:#EAEFEF;"></i>`
                slot.appendChild(pin);
            }

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


    safeCells.forEach(([r, c]) => getCell(r, c).classList.add("safe"));
    getCell(6, 1).classList.add("home-red");
    getCell(1, 8).classList.add("home-green");
    getCell(8, 13).classList.add("home-yellow");
    getCell(13, 6).classList.add("home-blue");
    getCell(7, 0).classList.add("red-arrow");
    getCell(0, 7).classList.add("green-arrow");
    getCell(7, 14).classList.add("yellow-arrow");
    getCell(14, 7).classList.add("blue-arrow");
}
//turn system
function updateTurnUI() {
    players.forEach(color => {
        const player = document.getElementById(`player-${color}`);
        const dice = player.querySelector(".dice-box");

        player.classList.remove("active");
        player.classList.remove("turn-glow");
        dice.classList.add("hidden");

        dice.onclick = null;
    });
    document.querySelectorAll(".base-area").forEach(b => {
        b.classList.remove("base-glow");
    });

    const activeColor = activePlayers[currentTurn];
    document.querySelectorAll(`.base-${activeColor}-area`).forEach(b => {
        b.classList.add("base-glow");
    });

    const activePlayer = document.getElementById(`player-${activeColor}`);
    const activeDiceBox = activePlayer.querySelector(".dice-box");
    if (finishedPlayers.includes(activeColor)) {

        console.log(" Skipping finished player:", activeColor);

        currentTurn = (currentTurn + 1) % activePlayers.length;

        updateTurnUI();
        return;
    }
    activePlayer.classList.add("active");
    activePlayer.classList.add("turn-glow");
    activeDiceBox.classList.remove("hidden");
    activeDiceBox.onclick = async () => {
        activeDiceBox.style.pointerEvents = "none";

        await rollDice(activeColor);

        activeDiceBox.style.pointerEvents = "auto";
    };
}

async function rollDice(playerColor) {
    const player = document.getElementById(`player-${playerColor}`);
    const dice = player.querySelector(".dice");

    // prevent spam clicking
    if (dice.classList.contains("rolling")) return;

    dice.classList.add("rolling");
    playSound("dice");
    // rolling animation with random faces
    for (let i = 0; i < 10; i++) {
        dice.setAttribute("data-value", Math.floor(Math.random() * 6) + 1);
        await sleep(80);
    }
    let finalValue;
    console.log("Six count before roll:", sixCount);
    // final result
    if (sixCount === 2) {
        finalValue = Math.floor(Math.random() * 5) + 1;
    } else {
        finalValue = Math.floor(Math.random() * 6) + 1;
    }
    dice.setAttribute("data-value", finalValue);
    dice.classList.remove("rolling");
    if (finalValue === 6) {
        sixCount++;
    } else {
        sixCount = 0;
    }
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
    let selectablePins = [];
    if (!canPlayerMove(color, diceValue)) {
        await sleep(500);
        nextTurn();
        return;
    }

    const pins = document.querySelectorAll(`.pin-${color}`);

    pins.forEach(pin => {
        if (pin.dataset.centered === "true") return;
        pin.classList.remove("active");
        const index = pin.dataset.index;
        const state = gameState[color][index];
        const homeStep = state.homeStep;
        const targetHomeStep = homeStep >= 0 ? homeStep + diceValue : null;
        if (targetHomeStep !== null && targetHomeStep > 5) {
            pin.classList.remove("active");
            pin.onclick = null;
            return;
        }

        // ARROW → CENTER CONDITION
        if (state.position === 50 && diceValue === 6) {

            pin.classList.add("active");
            selectablePins.push(pin);
            pin.onclick = async () => {
                clearSelection();

                const oldCell = pin.parentElement;
                pin.classList.remove("active");
                await animateMove(pin, color, index, diceValue);
                moveToCenter(pin, color);

                state.position = -2;
                state.homeStep = 5;

                if (oldCell) updateCellLayout(oldCell);

                if (checkWin(color) && !finishedPlayers.includes(color)) {

                    finishedPlayers.push(color);

                    // remove from activePlayers
                    activePlayers = activePlayers.filter(p => p !== color);
                    currentTurn = currentTurn % activePlayers.length;
                    await celebrationWin(color);

                    // if game ending condition
                    if (finishedPlayers.length === playerCount - 1) {
                        showResultModal();
                        return;
                    }

                    nextTurn();
                    return;
                }

                updateTurnUI();
            };

            return;
        }

        // unlock condition
        if (state.position === -1 && diceValue === 6) {
            pin.classList.add("active");
            selectablePins.push(pin);
            pin.onclick = () => {
                clearSelection();
                moveOut(pin, color, index);
            };
        }
        if (state.position === -2 && state.homeStep < 0 && state.homeStep > 5) {
            pin.classList.remove("active");
            pin.onclick = null;
        }

        // normal move (later)
        else if ((state.position >= 0 || state.homeStep >= 0) && state.homeStep !== 5) {
            pin.classList.add("active");
            selectablePins.push(pin);
            pin.onclick = () => {
                clearSelection();
                movePin(pin, color, index, diceValue);
            };
        }
    });
    if (selectablePins.length === 1) {
        await sleep(300);
        selectablePins[0].click();
    }

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

    if (pin.dataset.centered !== "true") {
        cell.appendChild(pin);
    }
    updateCellLayout(cell);
    gameState[color][index].position = 0;
    console.log(cell);
    clearSelection();
    nextTurn();
}

async function movePin(pin, color, index, steps) {
    if (pin.dataset.centered === "true") return;
    const state = gameState[color][index];
    let oldPos = state.position;
    let targetPos = oldPos + steps;
    // DEBUG LOG
    console.log("HOME DEBUG:", {
        oldPos,
        steps,
        targetPos,
        stepsIntoHome: targetPos - 50
    });
    console.log("STATE:", gameState[color][index]);

    if (targetPos > 50) {

        const stepsIntoHome = targetPos - 50;

        // must be exact
        if (stepsIntoHome > 6) {
            console.log("Invalid move: cannot overshoot center");
            return;
        }
        const homeStep = stepsIntoHome - 1;
        if (homeStep >= 5) {
            console.log("Invalid move: homeStep out of bounds", homeStep);
            return;
        }

        await animateMove(pin, color, index, steps);

        state.position = -2;
        state.homeStep = homeStep;

        clearSelection();
        nextTurn();
        return;
    }

    const start = startIndex[color];
    const realIndex = (start + targetPos) % 52;
    const [r, c] = mainPath[realIndex];
    const cell = getCell(r, c);
    await animateMove(pin, color, index, steps);
    if (!cell.classList.contains("home-red") &&
        !cell.classList.contains("home-green") &&
        !cell.classList.contains("home-yellow") &&
        !cell.classList.contains("home-blue")) {

        checkKill(r, c, color);
        if (lastDiceValue === 6) {
            clearSelection();
            nextTurn();
            return;
        }
    }
    state.position = targetPos;

    clearSelection();
    nextTurn();
}

async function moveToCenter(pin, color) {

    const center = document.querySelector(".center-wrapper");
    pin.dataset.centered = "true";
    pin.style.pointerEvents = "none";
    pin.onclick = null;
    pin.style.position = "absolute";
    pin.style.top = "";
    pin.style.left = "";
    pin.style.bottom = "";
    pin.style.right = "";
    pin.homeStep = -2;
    pin.style.transform = "";
    pin.classList.remove("active");
    pin.style.zIndex = "1999";
    center.appendChild(pin);
    console.log("CENTER PIN COUNT:", center.querySelectorAll(".pin").length);
    const pins = center.querySelectorAll(`.pin[data-color="${color}"]`);

    pins.forEach((p, i) => {

        const offset = (i - (pins.length - 1) / 2) * 10;

        if (color === "red") {
            p.style.left = "30%";
            p.style.top = (50 + offset) + "%";
        }

        if (color === "green") {
            p.style.top = "30%";
            p.style.left = (50 + offset) + "%";
        }

        if (color === "yellow") {
            p.style.left = "70%";
            p.style.top = (50 + offset) + "%";
        }

        if (color === "blue") {
            p.style.top = "70%";
            p.style.left = (50 + offset) + "%";
        }

        p.style.transform = "translate(-50%, -50%)";
        p.classList.remove("active");
    });
    console.log("✅ Moved to center:", color);

    if (pins.length === 4 && !finishedPlayers.includes(color)) {

        finishedPlayers.push(color);

        activePlayers = activePlayers.filter(p => p !== color);


        if (currentTurn >= activePlayers.length) {
            currentTurn = 0;
        }

        await celebrationWin(color);

        if (finishedPlayers.length === playerCount - 1) {
            showResultModal();
            return;
        }

        nextTurn();
        return;
    }

    if (pins.length < 4) {
        lastDiceValue = 6;
        updateTurnUI();
        return;
    }
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
    currentTurn = (currentTurn + 1) % activePlayers.length;
    sixCount = 0;
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
            lastDiceValue = 6;
            console.log("Killed:", enemyColor);
            playSound("kill");
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
    const pins = [...cell.querySelectorAll(".pin")].filter(p => p.dataset.centered !== "true");

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
// ANIMATION FUNCTION: moves piece step by step with delay, handles both normal and home path animation
async function animateMove(pin, color, index, steps) {
    if (pin.dataset.centered === "true") return;
    let state = gameState[color][index];
    let currentPos;
    if (state.homeStep >= 0) {
        currentPos = 50 + state.homeStep + 1;
    } else {
        currentPos = state.position;
    }
    const currentHomeStep = currentPos > 50 ? currentPos - 50 : null;
    const targetHomeStep = currentHomeStep !== null ? currentHomeStep + steps : null;
    if (targetHomeStep !== null && targetHomeStep > 6) return;
    for (let i = 1; i <= steps; i++) {

        await sleep(150); // speed control

        let nextPos = currentPos + 1;
        console.log({
            currentPos,
            nextPos,
            homeStep: nextPos > 50 ? nextPos - 51 : null
        });
        // ENTER HOME
        if (nextPos > 50) {

            const homeStep = nextPos - 51;
            if (homeStep < 0 || homeStep > 5) {
                console.log("INVALID HOME STEP:", homeStep);
                break;
            }
            console.log("ANIMATE DEBUG:", {
                state,
                currentPos,
                nextPos,
                homeStep: nextPos > 50 ? nextPos - 51 : null
            });
            if (homeStep === 5) {
                moveToCenter(pin, color);
                return;
            }

            const [r, c] = homePaths[color][homeStep];
            const cell = getCell(r, c);

            const oldCell = pin.parentElement;
            if (pin.dataset.centered !== "true") {
                cell.appendChild(pin);
            }

            addCellGlow(cell, color);
            playStepSound();

            if (oldCell) updateCellLayout(oldCell);
            updateCellLayout(cell);

            currentPos = nextPos;
            continue;
        }

        // NORMAL PATH
        const start = startIndex[color];
        const realIndex = (start + nextPos) % 52;

        const [r, c] = mainPath[realIndex];
        const cell = getCell(r, c);

        const oldCell = pin.parentElement;
        if (pin.dataset.centered !== "true") {
            cell.appendChild(pin);
        }
        addCellGlow(cell, color);
        playStepSound();
        if (oldCell) updateCellLayout(oldCell);
        updateCellLayout(cell);

        currentPos = nextPos;
    }

    state.position = currentPos;
}


// debug function to move any piece to any cell (for testing purposes)
async function debugMove(color, index, row, col) {

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
            await animateMove(pin, color, index, 1);
            moveToCenter(pin, color);
            updateTurnUI();
            return;
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

function debugDice(color, value) {

    console.log("DEBUG DICE:", color, value);

    lastDiceValue = value;

    handleMove(color, value);
}

exitBtn.addEventListener("click", () => {
    if (window.parent.document.fullscreenElement) {
        window.parent.document.exitFullscreen();
    }

});
window.addEventListener("message", (event) => {

    if (event.data === "enterFullscreen") {
        exitBtn.style.display = "block";
    }

    if (event.data === "exitFullscreen") {
        exitBtn.style.display = "none";
    }

});

/* Inside ludo.js */
function autoScale() {
    const container = document.getElementById('scaling-container');

    const baseWidth = 900;
    const baseHeight = 900;

    const scale = Math.min(
        window.innerWidth / baseWidth,
        window.innerHeight / baseHeight
    );

    container.style.transform = `
        translate(-50%, -50%) scale(${scale})
    `;
}

// Call on load and whenever the window/iframe resizes
window.addEventListener('load', autoScale);
window.addEventListener('resize', autoScale);

window.addEventListener("message", (event) => {
    if (event.data === "enterFullscreen" || event.data === "exitFullscreen") {
        setTimeout(autoScale, 100);
    }
});

async function addCellGlow(cell, color) {
    if (!cell.classList.contains("safe") &&
        !cell.classList.contains("red-arrow") &&
        !cell.classList.contains("green-arrow") &&
        !cell.classList.contains("yellow-arrow") &&
        !cell.classList.contains("blue-arrow")) {

        cell.classList.add("cell-glow");

        // dynamic color
        cell.style.setProperty("--glow-color", "var(--" + color + ")");

        await sleep(300);
        cell.classList.remove("cell-glow");
    }
}

function playStepSound() {
    if (!soundEnabled) return;

    const s = sounds.move.cloneNode();
    s.volume = 0.4;
    s.play();
}



function resetGameState() {
    gameStartTime = Date.now();
    boardCells.innerHTML = "";
    finishedPlayers = [];
    sixCount = 0;
    currentTurn = 0;

    for (let color in gameState) {
        gameState[color].forEach(p => {
            p.position = -1;
            p.homeStep = -1;
        });
    }
}

function startGameWithSameSettings() {
    createdBoard();
    updateTurnUI();
}

async function celebrationWin(color) {
    playSound("win");
    const bases = document.querySelectorAll(`.base-${color}-area`);
    bases.forEach(b => {
        b.classList.add("win-glow");
    });
    addCrown(color);
    spawnConfetti();
    await sleep(2000);
    bases.forEach(b => {
        b.classList.remove("win-glow");
    });
}
function addCrown(color) {
    const player = document.getElementById(`player-${color}`);

    const crown = document.createElement("div");
    crown.className = "crown";
    crown.innerText = "👑";

    player.appendChild(crown);
}
function spawnConfetti() {
    playSound("confetti");

    for (let i = 0; i < 80; i++) {
        const conf = document.createElement("div");
        conf.className = "confetti";

        conf.style.left = Math.random() * 100 + "vw";
        conf.style.background = `hsl(${Math.random() * 360},100%,60%)`;
        conf.style.animationDuration = (1 + Math.random()) + "s";
        conf.style.width = "8px";
        conf.style.height = "8px";

        document.body.appendChild(conf);

        setTimeout(() => conf.remove(), 2000);
    }
}
// Update showResultModal to populate the new design
function showResultModal() {
    const modal = document.getElementById("resultModal");
    const list = document.getElementById("resultList");
    const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
    /* -------- RANK SYSTEM -------- */
    const rankings = [...finishedPlayers];
    const lastPlayer = activePlayers.find(p => !finishedPlayers.includes(p));
    rankings.push(lastPlayer);

    /* -------- USER RANK -------- */
    const userColor = "blue"; // logged-in player
    const rank = rankings.indexOf(userColor) + 1;

    /* -------- REWARD SYSTEM -------- */
    let score = 0;
    let xp = 0;
    const win = rank === 1;
    if (rank === 1) {
        score = 50;
        xp = 30;
    } else if (rank === 2) {
        score = 30;
        xp = 20;
    } else if (rank === 3) {
        score = 20;
        xp = 15;
    } else {
        score = 10;
        xp = 10;
    }

    $.ajax({
        url: "http://localhost:3000/api/game-result",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            userId: localStorage.getItem("userId"),
            game: "ludo",
            timePlayed,
            rank,
            win,
            score,
            xpEarned: xp
        }),
        success: () => {
            localStorage.setItem("refreshProfile", "true");
        }
    });
    $(modal).show();
    modal.style.display = "flex";
    list.innerHTML = ""; // Clear old content
    // const winTxt = document.getElementById("win-txt");
    // winTxt.innerText = `${finishedPlayers[0]} Wins!`;
    /* -------- PLAYER XP & SCORE -------- */
    const statsBox = document.getElementById("playerStatsBox");

    statsBox.innerHTML = `
    🎯 Score: ${score} | ⚡ XP: +${xp}
`;

    /* -------- WINNER TEXT FIX -------- */
    const winTxt = document.getElementById("win-txt");

    if (finishedPlayers.length > 0) {
        const winner = finishedPlayers[0];

        const nameMap = {
            red: "Red Player",
            green: "Green Player",
            yellow: "Yellow Player",
            blue: "You"
        };

        winTxt.innerText = `${nameMap[winner]} Wins 🏆`;
    }

    players.forEach(color => {
        const p_indicator = document.getElementById(`player-${color}`);
        p_indicator.classList.remove("active", "turn-glow");
    });


    const playerMap = {
        red: { name: "Red Player", icon: "fa-chess-pawn" },
        green: { name: "Green Player", icon: "fa-leaf" },
        yellow: { name: "Yellow Player", icon: "fa-sun" },
        blue: { name: "Blue Player", icon: "fa-droplet" }
    };


    rankings.forEach((color, index) => {
        const playerData = playerMap[color];
        const row = document.createElement("div");
        row.className = "ranking-row";

        row.innerHTML = `
            <div class="rank-number">${index + 1}.</div>
            <div class="player-avatar" style="background-color: var(--${color});">
                <i class="fa-solid ${playerData.icon}"></i>
            </div>
            <div class="player-name">${playerData.name}</div>
        `;

        list.appendChild(row);
    });
}
$("#resultModal .close-icon").click(() => {
    window.location.reload();
});
$("#restartBtn").click(() => {
    window.location.reload();
});