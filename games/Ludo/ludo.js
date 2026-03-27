const modeButtons = document.querySelectorAll(".mode-btn");
const playerSection = document.getElementById("playerNumberSection");
const overlay= document.getElementById("ludoStartOverlay");
const modeSection = document.getElementById("ludoModeSection");
const board = document.getElementById("board");

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
const baseCoords =[
    { r: 0, c: 0, color: 'red' },
    { r: 0, c: 9, color: 'green' },
    { r: 9, c: 0, color: 'yellow' },
    { r: 9, c: 9, color: 'blue' }
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
    for(let i=0;i<4;i++){
        const slot = document.createElement("div");
        slot.classList.add("token-slot");

        const token = document.createElement("div");
        token.classList.add(`token token-${base.color}`);
        slot.appendChild(token);
        whiteBox.appendChild(slot);
    }
    board.appendChild(whiteBox);
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


