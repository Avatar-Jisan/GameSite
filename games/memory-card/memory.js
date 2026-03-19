const modeBtns = document.querySelectorAll(".mode-btn");
const diffBtns = document.querySelectorAll(".diff-btn");

const modeSection = document.getElementById("modeSection");
const diffSection = document.getElementById("difficultySection");
const topControls = document.querySelector(".top-controls");
const backBtn = document.getElementById("backBtn");
const soundBtn = document.getElementById("soundBtn");
const startOverlay = document.getElementById("startOverlay");
const gameBoard = document.getElementById("gameBoard");

let aiTurnRunning = false;
let selectedMode = null;
let selectedDifficulty = null;
let currentPlayer = 1;
let soundEnabled = true;

const sounds = {
  flip: new Audio("../../assets/sounds/flip.mp3"),
  success: new Audio("../../assets/sounds/success.mp3"),
  winner: new Audio("../../assets/sounds/winner.mp3"),
  wrong: new Audio("../../assets/sounds/wrong.mp3")
}
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

let aiMemory = {};

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let player1Score = 0;
let player2Score = 0;

let matchedPairs = 0;
let totalPairs;

function playSound(type) {
  if (!soundEnabled) return;
  const sound = sounds[type];
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

modeBtns.forEach(btn => {
  btn.addEventListener("click", () => {

    selectedMode = btn.dataset.mode;
    const icon = document.getElementById("player2Icon");
    if (selectedMode === "ai") {
      icon.classList.remove("fa-user");
      icon.classList.add("fa-robot");
      icon.style.color = "orange";
    } else {
      icon.classList.remove("fa-robot");
      icon.classList.add("fa-user");
      icon.style.color = "#F87060";
    }

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
    topControls.style.display = "flex";

    createBoard(selectedDifficulty);
    updateUI();
    showTurnOverlay();
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
  const body = document.body;

  body.classList.remove("turn-blue", "turn-red", "turn-orange");

  if (currentPlayer === 1) {
    p1.classList.add("active");
    p2.classList.remove("active");

    body.classList.add("turn-blue");
  } else {
    p2.classList.add("active");
    p1.classList.remove("active");

    if (selectedMode === "ai") {
      body.classList.add("turn-orange");
    } else {
      body.classList.add("turn-red");
    }
  }
}

function switchTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateUI();
  showTurnOverlay();
}

// TODO: add click handler for cards, check for matches, update scores, and handle game logic.

function clickHandler(isAi = false) {
  if (this.classList.contains("flip") || lockBoard || (!isAi && aiTurnRunning)) return;
  if (!isAi && selectedMode === "ai" && currentPlayer === 2) return;
  if (this === firstCard) return;
  this.classList.add("flip");
  playSound("flip");
  saveAiMemory(this);
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
  playSound("success");
  matchedPairs++;
  updateScore();
  checkGameEnd();
  resetTurn();
  if (selectedMode === "ai" && currentPlayer === 2) {
    setTimeout(aiTurn, 900);
  }

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
    playSound("wrong");
    firstCard.classList.add("wrong");
    secondCard.classList.add("wrong");
  }, 400);

  setTimeout(() => {
    firstCard.classList.remove("wrong");
    secondCard.classList.remove("wrong");
    firstCard.classList.remove("flip");
    secondCard.classList.remove("flip");
    switchTurn();
    resetTurn();
    if (selectedMode === "ai" && currentPlayer === 2) {
      setTimeout(aiTurn, 900);
    }
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
  playSound("winner");
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
  aiMemory = {};

  document.getElementById("player1Score").innerText = 0;
  document.getElementById("player2Score").innerText = 0;

  currentPlayer = 1;
  updateUI();

  createBoard(selectedDifficulty);
}

// AI Memory Logic

function saveAiMemory(card) {
  let icon = card.dataset.icon;
  if (!aiMemory[icon]) {
    aiMemory[icon] = [];
  }
  if (!aiMemory[icon].includes(card)) {
    aiMemory[icon].push(card);
  }
}

function aiTurn() {

  aiTurnRunning = true;

  let allCards = document.querySelectorAll(".memory-card:not(.flip)");
  if (allCards.length === 0) {
    aiTurnRunning = false;
    return;
  }

  let card1 = getSmartChoice(allCards);
  if (!card1) {
    aiTurnRunning = false;
    return;
  }

  clickHandler.call(card1, true);

  setTimeout(() => {

    let updatedCards = document.querySelectorAll(".memory-card:not(.flip)");

    let card2 = getSmartChoice(updatedCards, card1);
    if (!card2) {
      aiTurnRunning = false;
      return;
    }

    clickHandler.call(card2, true);


    setTimeout(() => {
      aiTurnRunning = false;
    }, 300);

  }, 600);
}

function getSmartChoice(allCards, card1 = null) {
  for (let icon in aiMemory) {
    let knownCards = aiMemory[icon].filter(c => !c.classList.contains("flip"));
    if (knownCards.length >= 2) {
      return knownCards[0];
    }
  }
  if (card1) {
    let icon = card1.dataset.icon;

    if (aiMemory[icon]) {
      let match = aiMemory[icon].find(c => c !== card1 && !c.classList.contains("flip"));
      if (match) return match;
    }
  }

  let randomIndex = Math.floor(Math.random() * allCards.length);
  return allCards[randomIndex];
}

function showTurnOverlay() {
  const overlay = document.getElementById("turnOverlay");
  const text = document.getElementById("turnText");

  overlay.classList.remove("turn-blue", "turn-red", "turn-orange");

  if (selectedMode === "ai" && currentPlayer === 2) {
    overlay.classList.add("turn-orange");
    text.innerText = "AI TURN 🤖";
  }
  else if (currentPlayer === 1) {
    overlay.classList.add("turn-blue");
    text.innerText = "Player 1 Turn";
  }
  else {
    overlay.classList.add("turn-red");
    text.innerText = "Player 2 Turn";
  }

  overlay.classList.add("show");

  setTimeout(() => {
    overlay.classList.remove("show");
  }, 800);
}

// Event Listeners for  top controls
backBtn.addEventListener("click", () => {
  startOverlay.style.display = "flex";
  topControls.style.display = "none";
  gameBoard.innerHTML = "";
  player1Score = 0;
  player2Score = 0;
  matchedPairs = 0;
  aiMemory = {};
  currentPlayer = 1;
  document.getElementById("player1Score").innerText = 0;
  document.getElementById("player2Score").innerText = 0;
});

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById("volume-icon");
  if (soundEnabled) {
    icon.classList.remove("fa-volume-slash");
    icon.classList.add("fa-volume-high");
  } else {
    icon.classList.remove("fa-volume-high");
    icon.classList.add("fa-volume-slash");
  }
});