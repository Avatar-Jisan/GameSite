const modeButtons = document.querySelectorAll(".mode-btn");
const playerSection = document.getElementById("playerNumberSection");
const overlay= document.getElementById("ludoStartOverlay");
const modeSection = document.getElementById("ludoModeSection");

let gameMode = null;
let playerCount = null;

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
for(let i=0; i<225;i++){
    const cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
}

function getCell(row, col){
    return board.children[row * 15 + col];
}
// color bases
for(let r=0; r<6; r++){
    for(let c=0; c<6; c++){
        getCell(r,c).classList.add("base-red");
        getCell(14-r, c).classList.add("base-blue");
        getCell(r, 14-c).classList.add("base-green");
        getCell(14-r, 14-c).classList.add("base-yellow");
    }
}
// inner white squares
for(let r=1;r<=4;r++){
    for(let c=1;c<=4;c++){
        getCell(r,c).classList.add("white");
        getCell(14-r, c).classList.add("white");
        getCell(r, 14-c).classList.add("white");
        getCell(14-r, 14-c).classList.add("white");
    }
}
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

board.appendChild(centerWrapper);

// REMOVE INNER CELLS VISUALLY
for (let r = 6; r <= 8; r++) {
    for (let c = 6; c <= 8; c++) {
        getCell(r, c).style.display = "none";
    }
}
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

// Tokens
function createBaseTokens(color, startRow, startCol) {
    // Create container
    const container = document.createElement("div");
    container.classList.add("base-inner");

    // Create 4 slots
    for (let i = 0; i < 4; i++) {
        const slot = document.createElement("div");
        slot.classList.add("token-slot");

        const token = document.createElement("div");
        token.classList.add("token", color);

        slot.appendChild(token);
        container.appendChild(slot);
    }

    // Place container in CENTER of 4x4 white area
    const centerCell = getCell(startRow + 1, startCol + 1);
    centerCell.appendChild(container);
}
function hideWhiteCells(startRow, startCol){
    for(let r=startRow;r<startRow+4;r++){
        for(let c=startCol; c<startCol+4;c++){
            if(r===startRow+1 && c===startCol+1) continue;
            getCell(r,c).style.display="none";
        }
    }
}

// RED (top-left)
createBaseTokens("red", 0, 0);

// GREEN (top-right)
createBaseTokens("green", 0, 9);

// YELLOW (bottom-left)
createBaseTokens("yellow", 9, 0);

// BLUE (bottom-right)
createBaseTokens("blue", 9, 9);

