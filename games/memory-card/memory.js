const modeBtns = document.querySelectorAll(".mode-btn");
const diffBtns = document.querySelectorAll(".diff-btn");

const modeSection = document.getElementById("modeSection");
const diffSection = document.getElementById("difficultySection");

let selectedMode = null;
let selectedDifficulty = null;
let currentPlayer = 1;
const icons = [
  "fa-cat",
  "fa-dog",
  "fa-crow",
  "fa-fish",
  "fa-frog",
  "fa-hippo",
  "fa-dragon",
  "fa-dove",
  "fa-otter",
  "fa-spider"
];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let player1Score = 0;
let player2Score = 0;

let matchedPairs = 0;
let totalPairs;

modeBtns.forEach(btn => {
  btn.addEventListener("click", () => {

    selectedMode = btn.dataset.mode;
    console.log("Mode selected:", selectedMode);

    /* switch UI */
    modeSection.style.display = "none";
    diffSection.style.display = "flex";

  });
});

diffBtns.forEach(btn => {
  btn.addEventListener("click", () => {

    selectedDifficulty = btn.dataset.diff;
    console.log("Difficulty selected:", selectedDifficulty);

    /* hide overlay */
    document.getElementById("startOverlay").style.display = "none";

    createBoard(selectedDifficulty);
    updateUI();
  });
});

/* GET GRID SIZE */
function getGridSize(diff) {
  if (diff === "easy") return 12;
  if (diff === "medium") return 16;
  if (diff === "hard") return 20;
}

/* SHUFFLE */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* CREATE BOARD */
function createBoard(diff) {
  const board = document.getElementById("gameBoard");
  board.innerHTML = "";

  let totalCards = getGridSize(diff);
   totalPairs = totalCards / 2;

  let selectedIcons = icons.slice(0, totalPairs);

  let cardValues = [...selectedIcons, ...selectedIcons];

  shuffle(cardValues);

  cardValues.forEach(icon => {
    let col = document.createElement("div");
    col.className = "col-3";
    col.innerHTML = `
      <div class="card-box">
        <div class="memory-card" data-icon="${icon}">
          
          <div class="front">
            <i class="fa-solid ${icon} fa-lg"></i>
          </div>

          <div class="back">
            ?
          </div>

        </div>
      </div>
    `;
    const cardElement = col.querySelector(".memory-card");
    cardElement.addEventListener("click", clickHandler);
    board.appendChild(col);
  });
}

function updateUI() {
  const p1 = document.getElementById("player1");
  const p2 = document.getElementById("player2");

  if (currentPlayer === 1) {
    p1.classList.add("active");
    p2.classList.remove("active");
  } else {
    p2.classList.add("active");
    p1.classList.remove("active");
  }
}

function switchTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateUI();
}

// TODO: add click handler for cards, check for matches, update scores, and handle game logic.

function clickHandler() {
  if (lockBoard) return;
  if (this === firstCard) return;
  this.classList.add("flip");
  if (!firstCard) {
    firstCard = this;
    return;
  }
  secondCard = this;
  checkMatch();
}

function checkMatch() {
  let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  firstCard.removeEventListener("click", clickHandler);
  secondCard.removeEventListener("click", clickHandler);

  matchedPairs++;
  updateScore();
  checkGameEnd();
  resetTurn();
}

function updateScore() {
  if (currentPlayer === 1) {
    player1Score++;
    document.getElementById("player1Score").innerHTML = player1Score;
  } else {
    player2Score++;
    document.getElementById("player2Score").innerHTML = player2Score;
  }

}

function handleMismatch() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove("flip");
    secondCard.classList.remove("flip");
    switchTurn();
    resetTurn();
  }, 1000);
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Game end logic

function checkGameEnd() {
  if (matchedPairs === totalPairs) {
    setTimeout(() => {
      showGameResult();
    }, 500);
  }
}

function showGameResult() {
  const overlay = document.getElementById("resultOverlay");
  const title = document.getElementById("resultTitle");
  const score = document.getElementById("resultScore");

  let resultText = "";

  if (player1Score > player2Score) {
    resultText = "Player 1 Wins! 🎉";
  } else if (player2Score > player1Score) {
    resultText = "Player 2 Wins! 🎉";
  } else {
    resultText = "It's a Tie! 🤝";
  }

  title.textContent = resultText;
  score.textContent = `Player 1: ${player1Score} | Player 2: ${player2Score}`;

  overlay.style.display = "flex";
}


function restartGame() {

  document.getElementById("resultOverlay").style.display = "none";

  player1Score = 0;
  player2Score = 0;
  matchedPairs = 0;

  document.getElementById("player1Score").innerText = 0;
  document.getElementById("player2Score").innerText = 0;

  currentPlayer = 1;
  updateUI();

  createBoard(selectedDifficulty);
}