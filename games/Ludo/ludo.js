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