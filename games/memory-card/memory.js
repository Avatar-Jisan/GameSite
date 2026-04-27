const modeBtns = document.querySelectorAll(".mode-btn");
const diffBtns = document.querySelectorAll(".diff-btn");

const modeSection = document.getElementById("modeSection");
const diffSection = document.getElementById("difficultySection");
const topControls = document.querySelector(".top-controls");
const backBtn = document.getElementById("backBtn");
const soundBtn = document.getElementById("soundBtn");
const startOverlay = document.getElementById("startOverlay");
const gameBoard = document.getElementById("gameBoard");
const exitBtn = document.getElementById("exitBtn");

let gameStartTime;
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
let aiTurnRunning = false;

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  gameStartTime = Date.now();
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
  if (!(selectedMode === "ai" && currentPlayer === 2)) {
    lockBoard = false;
    gameBoard.classList.remove("no-click");
  }
}

// TODO: add click handler for cards, check for matches, update scores, and handle game logic.

function clickHandler(isAi = false) {
  if (this.classList.contains("flip")) return;
  if (!isAi && (lockBoard || aiTurnRunning)) return;
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
    lockBoard = true;
    aiTurn();
  } else {
    lockBoard = false;
    aiTurnRunning = false;
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
  gameBoard.classList.add("no-click");
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
    gameBoard.classList.remove("no-click");
    switchTurn();
    resetTurn();
    aiTurnRunning = false;
    if (selectedMode === "ai" && currentPlayer === 2) {
      aiTurn();
    }
  }, 1000);

}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
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

  const p1 = document.getElementById("p1Final");
  const p2 = document.getElementById("p2Final");

  const rewardBox = document.getElementById("rewardBox");

  playSound("winner");

  let resultText = "";
  let xp = 0;
  let score = 0;
  const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
  const win = player1Score > player2Score;
  let rank;
  if (win) {
    rank = 1;
  } else {
    rank = 2;
  }

  /* RESULT */
  if (player1Score > player2Score) {
    resultText = "You Win 🏆";
    xp = 25;
    score = 40;
  } else if (player2Score > player1Score) {
    resultText = "You Lose 😢";
    xp = 10;
    score = 15;
  } else {
    resultText = "It's a Tie 🤝";
    xp = 15;
    score = 20;
  }

  title.innerText = resultText;

  /* SCORE DISPLAY */
  p1.innerText = player1Score;
  p2.innerText = player2Score;

  /* REWARD */
  rewardBox.innerHTML = `
    🎯 Score: +${score} <br>
    ⚡ XP: +${xp}
  `;
  $("#resultOverlay").show();
  sendGameResult(score, xp, timePlayed, resultText, win);

  /* XP BAR (fetch from profile) */
  const userId = localStorage.getItem("userId");

  if (!userId) return;

  $.get(`https://gamesite-y5iw.onrender.com/api/user/${userId}`, (user) => {
    const percent = (user.xp / user.maxXp) * 100;

    document.getElementById("xpFillMemory").style.width = percent + "%";

    document.getElementById("xpTextMemory").innerText =
      `${user.xp} / ${user.maxXp} XP`;
  });

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
  gameBoard.classList.remove("no-click");
  lockBoard = false;
  aiTurnRunning = false;
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

async function aiTurn() {
  if (matchedPairs === totalPairs) return;
  lockBoard = true;
  aiTurnRunning = true;
  gameBoard.classList.add("no-click");

  let allCards = document.querySelectorAll(".memory-card:not(.flip)");
  if (allCards.length === 0) {
    lockBoard = false;
    aiTurnRunning = false;
    gameBoard.classList.remove("no-click");
    return;
  }
  await delay(1000); // small delay before AI makes its move
  let card1 = getSmartChoice(allCards);
  clickHandler.call(card1, true);


  await delay(1200); // delay between first and second card flip
  let updatedCards = document.querySelectorAll(".memory-card:not(.flip)");
  let card2 = getSmartChoice(updatedCards, card1);

  clickHandler.call(card2, true);
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

// Turn Overlay Logic
function showTurnOverlay() {
  lockBoard = true;
  gameBoard.classList.add("no-click");
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
    if (currentPlayer === 1 || (selectedMode !== "ai" && currentPlayer === 2)) {
      if (!aiTurnRunning) {
        lockBoard = false;
        gameBoard.classList.remove("no-click");
      }
    }
  }, 800);
}

// Event Listeners for  top controls
backBtn.addEventListener("click", () => {
  startOverlay.style.display = "flex";
  topControls.style.display = "none";
  modeSection.style.display = "flex";
  diffSection.style.display = "none";
  gameBoard.innerHTML = "";
  firstCard = null;
  secondCard = null;
  player1Score = 0;
  player2Score = 0;
  matchedPairs = 0;
  aiMemory = {};
  currentPlayer = 1;
  gameBoard.classList.remove("no-click");
  lockBoard = false;
  aiTurnRunning = false;
  document.getElementById("player1Score").innerText = 0;
  document.getElementById("player2Score").innerText = 0;
});

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById("volume-icon");
  if (soundEnabled) {
    icon.classList.remove("fa-volume-xmark");
    icon.classList.add("fa-volume-high");
  } else {
    icon.classList.remove("fa-volume-high");
    icon.classList.add("fa-volume-xmark");
  }
});
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

function sendGameResult(score, xp, timePlayed, result, win) {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.log("User not logged in");
    return;
  }

  fetch("https://gamesite-y5iw.onrender.com/api/game-result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      game: "memory-card",
      score,
      xpEarned: xp,
      timePlayed,
      result,
      win
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Saved:", data);

      // 🔥 refresh profile later
      localStorage.setItem("refreshProfile", "true");
    })
    .catch(err => console.error(err));
}