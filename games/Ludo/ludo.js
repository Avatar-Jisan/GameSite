const modeButtons = document.querySelectorAll(".mode-btn");
const playerSection = document.getElementById("playerNumberSection");
const overlay= document.getElementById("ludoStartOverlay");
const modeSection = document.getElementById("ludoModeSection");
const board = document.getElementById("board");
const boardCells= document.getElementById("board-cells");

let gameMode = null;
let playerCount = null;
let lastDiceValue=null;

const gameState = {
    red: [
        { position: -1 }, // -1 = inside base
        { position: -1 },
        { position: -1 },
        { position: -1 }
    ],
    green: [
        { position: -1 },
        { position: -1 },
        { position: -1 },
        { position: -1 }
    ],
    yellow: [
        { position: -1 },
        { position: -1 },
        { position: -1 },
        { position: -1 }
    ],
    blue: [
        { position: -1 },
        { position: -1 },
        { position: -1 },
        { position: -1 }
    ]
};

const mainPath = [
    [6,1],[6,2],[6,3],[6,4],[6,5],
    [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
    [0,7],[0,8],
    [1,8],[2,8],[3,8],[4,8],[5,8],
    [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
    [7,14],[8,14],
    [8,13],[8,12],[8,11],[8,10],[8,9],
    [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
    [14,7],[14,6],
    [13,6],[12,6],[11,6],[10,6],[9,6],
    [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
    [7,0],[6,0]
];

const startIndex = {
    red: 0,
    green: 13,
    yellow: 26,
    blue: 39
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        gameMode= btn.dataset.mode;

        if(gameMode === "ai"){
            startGame();
        } else{
            modeSection.style.display = "none";
            playerSection.style.display = "flex";
        }
    });
});
const playerButtons= document.querySelectorAll(".player-num-btn");

playerButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        playerCount = btn.dataset.playerNum;
        startGame();
    });
});

function startGame(){
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

function getCell(row, col){
    return boardCells.children[row * 15 + col];
}
// color bases
const baseCoords =[
    { r: 0, c: 0, color: 'red'},
    { r: 0, c: 9, color: 'green' },
    { r: 9, c: 0, color: 'blue' },
    { r: 9, c: 9, color: 'yellow' }
];

baseCoords.forEach(base =>{
    for(let r=base.r; r<base.r+6;r++){
        for(let c=base.c; c<base.c+6; c++){
            getCell(r,c).classList.add(`base-${base.color}`);
        }
    }
    const whiteBox = document.createElement("div");
    whiteBox.classList.add("white-base");
    whiteBox.style.gridRow = `${base.r + 2} / span 4`;
    whiteBox.style.gridColumn = `${base.c + 2} / span 4`;
    whiteBox.style.zIndex="5";
    for(let i=0;i<4;i++){
        const slot = document.createElement("div");
        slot.classList.add("token-slot");
        slot.dataset.color=base.color;
        const pin = document.createElement("div");
        pin.classList.add("pin", `pin-${base.color}`);
        pin.dataset.index=i;
        pin.dataset.color=base.color;

        pin.innerHTML=`<i class="fa-solid fa-location-dot fa-lg" style="color:#EAEFEF;"></i>`
        slot.appendChild(pin);
        whiteBox.appendChild(slot);
    }
    boardCells.appendChild(whiteBox);
});

// Cross paths
for(let i=0;i<15;i++){
    for(let j=6;j<9;j++){
        getCell(i,j).classList.add("path");
        getCell(j,i).classList.add("path");
    }
}
// home paths
for (let c = 1; c <= 5; c++) getCell(7,c).classList.add("home-red");
for (let r = 1; r <= 5; r++) getCell(r,7).classList.add("home-green");
for (let c = 9; c <= 13; c++) getCell(7,c).classList.add("home-yellow");
for (let r = 9; r <= 13; r++) getCell(r,7).classList.add("home-blue");

// center
// CREATE CENTER WRAPPER
const centerWrapper = document.createElement("div");
centerWrapper.classList.add("center-wrapper");

// Place wrapper at correct grid position
centerWrapper.style.gridRow = "7 / span 3";  // rows 6–8
centerWrapper.style.gridColumn = "7 / span 3"; // cols 6–8
centerWrapper.style.zIndex="10";
boardCells.appendChild(centerWrapper);


// safe cells
const safeCells = [
    [8,2],[2,6],[6,12],[12,8]
];
const homeCells = [
    [6,1],[1,8],[8,13],[13,6]
];

safeCells.forEach(([r,c]) => getCell(r,c).classList.add("safe"));
getCell(6,1).classList.add("home-red");
getCell(1,8).classList.add("home-green");
getCell(8,13).classList.add("home-yellow");
getCell(13,6).classList.add("home-blue");
getCell(7,0).classList.add("red-arrow");
getCell(0,7).classList.add("green-arrow");
getCell(7,14).classList.add("yellow-arrow");
getCell(14,7).classList.add("blue-arrow");

//turn system
const players = ["red", "green", "yellow", "blue"];
let currentTurn = 0;

function updateTurnUI() {
    players.forEach(color => {
        const player = document.getElementById(`player-${color}`);
        const dice = player.querySelector(".dice-box");

        player.classList.remove("active");
        dice.classList.add("hidden");

        dice.onclick=null;
    });

    const activeColor = players[currentTurn];
    const activePlayer = document.getElementById(`player-${activeColor}`);
    const activeDiceBox= activePlayer.querySelector(".dice-box");
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
    lastDiceValue=finalValue;
    handleMove(playerColor,finalValue);
}

async function handleMove(color, diceValue) {

    if(!canPlayerMove(color,diceValue)){
        await sleep(500);
        nextTurn();
        return;
    }
    const pins = document.querySelectorAll(`.pin-${color}`);

    pins.forEach(pin => {
        pin.classList.remove("active");
        pin.querySelector("i").classList.remove("fa-fade");
        const index = pin.dataset.index;
        const state = gameState[color][index];

        // unlock condition
        if (state.position === -1 && diceValue === 6) {
            pin.classList.add("active");
            pin.querySelector("i").classList.add("fa-fade");
            pin.onclick = () => {
                clearSelection();
                moveOut(pin, color, index);
            };
        }

        // normal move (later)
        else if (state.position >= 0) {
            pin.classList.add("active");
            pin.querySelector("i").classList.add("fa-fade");
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
        if (p.position === -1 && diceValue === 6) return true; // unlock
        if (p.position >= 0) return true; // already on board
        return false;
    });
}

function moveOut(pin, color, index) {
    const start=startIndex[color];

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
    let pos = gameState[color][index].position;
    const oldCell = pin.parentElement;
    pos += steps;

    if(pos>51) pos=pos%52;

    const start=startIndex[color];
    const realIndex =(start+pos)%52;
    const [r, c] = mainPath[realIndex];
    const cell = getCell(r, c);
    
    cell.appendChild(pin);
    checkKill(r, c, color);
    if (oldCell) updateCellLayout(oldCell);
    updateCellLayout(cell);

    gameState[color][index].position = pos;

    clearSelection();
    nextTurn();
}

function clearSelection() {
    document.querySelectorAll(".pin").forEach(p => {
        p.classList.remove("active");
        const icon = p.querySelector("i");
        if (icon) icon.classList.remove("fa-fade");
        p.onclick = null;
    });
}

function nextTurn() {

    if(lastDiceValue===6){
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
