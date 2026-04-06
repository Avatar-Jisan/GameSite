let playerO = "O";
let playerX = "X";
let currPlayer = playerO;

let gameBoard = ["","","","","","","","",""];
let gameCells;

let gameMode = "pvp";
let aiPlayer = playerX;

let winningConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let gameOver = false;

let resultModal, resultText, playAgainBtn;
let startOverlay, pvpBtn, aiBtn;

// 🔊 SOUND
let clickSound, winSound, drawSound;

window.onload = function(){

  gameCells = document.getElementsByClassName("game-cell");

  for(let cell of gameCells){
    cell.addEventListener("click", placeCell);
  }

  document.getElementById("game-restart-button")
    .addEventListener("click", restartGame);

  resultModal = document.getElementById("result-modal");
  resultText = document.getElementById("result-text");
  playAgainBtn = document.getElementById("play-again-btn");

  playAgainBtn.onclick = () => {
    resultModal.style.display = "none";
    restartGame();
  };

  startOverlay = document.getElementById("game-overlay");
  pvpBtn = document.getElementById("pvp-btn");
  aiBtn = document.getElementById("ai-btn");

  // 🔊 load sounds
  clickSound = document.getElementById("click-sound");
  winSound = document.getElementById("win-sound");
  drawSound = document.getElementById("draw-sound");

  // 🎮 BUTTON SOUND + VIBRATION
  pvpBtn.onclick = () => {
    playSound(clickSound);
    vibrate(50);

    gameMode = "pvp";

    setTimeout(() => {
      startOverlay.style.display = "none";
    }, 150);
  };

  aiBtn.onclick = () => {
    playSound(clickSound);
    vibrate(50);

    gameMode = "ai";

    setTimeout(() => {
      startOverlay.style.display = "none";
    }, 150);
  };
};

// sound helper
function playSound(sound){
  if(!sound) return;
  sound.currentTime = 0;
  sound.play().catch(()=>{});
}

// vibration helper
function vibrate(pattern){
  if(navigator.vibrate){
    navigator.vibrate(pattern);
  }
}

function placeCell(){
  if(gameOver) return;

  const index = parseInt(this.getAttribute("data-cell-index"));
  if(gameBoard[index] !== "") return;

  makeMove(index, currPlayer);

  playSound(clickSound);
  vibrate(50);

  if(gameMode === "ai" && !gameOver && currPlayer === aiPlayer){
    setTimeout(aiMove, 400);
  }
}

function makeMove(index, player){
  gameBoard[index] = player;
  gameCells[index].innerText = player;
  currPlayer = (player === playerO) ? playerX : playerO;
  checkWinner();
}

function aiMove(){
  let empty = gameBoard.map((v,i)=>v===""?i:null).filter(v=>v!==null);
  if(empty.length === 0) return;

  let move = empty[Math.floor(Math.random()*empty.length)];
  makeMove(move, aiPlayer);

  playSound(clickSound);
  vibrate(30);
}

function checkWinner(){
  for(let win of winningConditions){
    let [a,b,c] = win;

    if(gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]){
      win.forEach(i => gameCells[i].classList.add("winning-game-cell"));

      gameOver = true;
      resultText.innerText = gameBoard[a] + " Wins!";
      resultModal.style.display = "flex";

      playSound(winSound);
      vibrate([200,100,200]);
      return;
    }
  }

  if(!gameBoard.includes("")){
    gameOver = true;
    resultText.innerText = "Draw!";
    resultModal.style.display = "flex";

    playSound(drawSound);
    vibrate(100);
  }
}

function restartGame(){
  gameOver = false;
  currPlayer = playerO;
  gameBoard = ["","","","","","","","",""];

  for(let cell of gameCells){
    cell.innerText = "";
    cell.classList.remove("winning-game-cell");
  }
}