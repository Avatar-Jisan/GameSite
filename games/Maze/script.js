let maze, playerPos, exitPos;

const game = document.getElementById("game");
const message = document.getElementById("message");

const moveSound  = document.getElementById("moveSound");
const winSound   = document.getElementById("winSound");
const clickSound = document.getElementById("clickSound");

let gameStartTime = null;
let timerInterval  = null;
let currentLevel   = null;

// ===== XP / LEVEL SYSTEM =====
const XP_PER_LEVEL = 50;

function getProfile() {
  const raw = localStorage.getItem("mazeProfile");
  if (raw) return JSON.parse(raw);
  return { totalScore:0, totalXP:0, level:1,
    wins:{easy:0,medium:0,hard:0},
    bestTime:{easy:null,medium:null,hard:null}, history:[] };
}

function saveProfile(p) { localStorage.setItem("mazeProfile", JSON.stringify(p)); }

function xpForLevel(level) { return level * XP_PER_LEVEL; }

function calcLevel(totalXP) {
  let level = 1, accumulated = 0;
  while (accumulated + xpForLevel(level) <= totalXP) {
    accumulated += xpForLevel(level); level++;
  }
  return { level, xpIntoLevel: totalXP - accumulated, xpNeeded: xpForLevel(level) };
}

function updateHUD() {
  const p = getProfile();
  const { level, xpIntoLevel, xpNeeded } = calcLevel(p.totalXP);
  document.getElementById("hudScore").textContent = p.totalScore;
  document.getElementById("hudXP").textContent    = p.totalXP;
  document.getElementById("hudLevel").textContent = "Lv." + level;
  const pct = Math.min(100, (xpIntoLevel / xpNeeded) * 100);
  document.getElementById("xpBar").style.width = pct + "%";
  const best = p.bestTime[currentLevel];
  document.getElementById("hudBest").textContent = best !== null ? formatTime(best) : "—";
}

function formatTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameStartTime) return;
    document.getElementById("hudTimer").textContent =
      formatTime(Math.floor((Date.now() - gameStartTime) / 1000));
  }, 500);
}

function stopTimer() { clearInterval(timerInterval); timerInterval = null; }

// ===== LEVELS =====
const levels = {
  easy: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  medium: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  hard: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1],
    [1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
};

const levelRewards = { easy:{score:20,xp:10}, medium:{score:35,xp:20}, hard:{score:50,xp:30} };

function calcTimeBonus(timeSecs, level) {
  const par = { easy:60, medium:120, hard:240 };
  const p = par[level] || 120;
  return timeSecs <= p ? Math.round(((p - timeSecs) / p) * 20) : 0;
}

function playSound(sound) {
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function startGame(level) {
  playSound(clickSound);
  gameStartTime = Date.now();
  currentLevel  = level;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("statsScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");

  maze      = levels[level];
  playerPos = { x: 1, y: 1 };
  exitPos   = { x: maze[0].length - 2, y: maze.length - 2 };

  message.classList.remove("win");
  message.textContent = "Find the exit!";

  updateHUD();
  startTimer();
  drawMaze();
}

function drawMaze() {
  game.innerHTML = "";
  game.style.gridTemplateColumns = `repeat(${maze[0].length}, 1fr)`;
  game.style.gridTemplateRows    = `repeat(${maze.length}, 1fr)`;

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (maze[y][x] === 1)                         cell.classList.add("wall");
      if (x === playerPos.x && y === playerPos.y)   cell.classList.add("player");
      if (x === exitPos.x   && y === exitPos.y)     cell.classList.add("exit");
      game.appendChild(cell);
    }
  }
}

function movePlayer(dx, dy) {
  const newX = playerPos.x + dx, newY = playerPos.y + dy;
  if (maze[newY][newX] === 1) return;
  playerPos.x = newX; playerPos.y = newY;
  playSound(moveSound);

  if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
    stopTimer();
    message.textContent = "🎉 YOU ESCAPED THE MAZE!";
    message.classList.add("win");
    playSound(winSound);
    applyAndShowResult();
  }
  drawMaze();
}

function applyAndShowResult() {
  const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
  const rewards    = levelRewards[currentLevel] || { score:20, xp:10 };
  const timeBonus  = calcTimeBonus(timePlayed, currentLevel);
  const totalScore = rewards.score + timeBonus;
  const totalXP    = rewards.xp;

  const p = getProfile();
  const oldLevel = calcLevel(p.totalXP).level;

  p.totalScore += totalScore;
  p.totalXP    += totalXP;
  p.wins[currentLevel] = (p.wins[currentLevel] || 0) + 1;

  if (p.bestTime[currentLevel] === null || timePlayed < p.bestTime[currentLevel])
    p.bestTime[currentLevel] = timePlayed;

  p.history.unshift({ level:currentLevel, time:timePlayed,
    score:totalScore, xp:totalXP, date:new Date().toLocaleDateString() });
  if (p.history.length > 10) p.history.pop();

  saveProfile(p);
  const newLevel  = calcLevel(p.totalXP).level;
  const leveledUp = newLevel > oldLevel;
  updateHUD();

  const userId = localStorage.getItem("userId");
  if (userId) {
    try {
      $.ajax({ url:"https://gamesite-y5iw.onrender.com/api/game-result", method:"POST",
        contentType:"application/json",
        data: JSON.stringify({ userId, game:"maze-game", timePlayed, rank:1, win:true,
          score:totalScore, xpEarned:totalXP }),
        success: () => localStorage.setItem("refreshProfile","true"),
        error:   (err) => console.error("Save failed:", err)
      });
    } catch(e) {}
  }

  showResultModal(timePlayed, totalScore, totalXP, timeBonus, rewards, !!userId, leveledUp, newLevel);
}

function showResultModal(timePlayed, totalScore, totalXP, timeBonus, rewards, saved, leveledUp, newLevel) {
  let modal = document.getElementById("mazeResultModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "mazeResultModal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  const levelLabel = currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1);
  const timeStr    = formatTime(timePlayed);
  const p          = getProfile();
  const info       = calcLevel(p.totalXP);
  const xpPct      = Math.min(100, Math.round((info.xpIntoLevel / info.xpNeeded) * 100));

  modal.innerHTML = `
    <div class="result-card">
      <div class="result-icon">${leveledUp ? "🚀" : "🏆"}</div>
      <h2 class="result-title">${leveledUp ? "Level Up!" : "Maze Escaped!"}</h2>
      <p class="result-sub">${levelLabel} difficulty${leveledUp ? " — Now Level " + newLevel + "!" : ""}</p>

      <div class="result-stats">
        <div class="rstat">
          <div class="rstat-val">⏱️ ${timeStr}</div>
          <div class="rstat-lbl">Time</div>
        </div>
        <div class="rstat">
          <div class="rstat-val" style="color:#ffd700">🎯 +${rewards.score}</div>
          <div class="rstat-lbl">Base Score</div>
        </div>
        ${timeBonus > 0 ? `<div class="rstat">
          <div class="rstat-val" style="color:#ff9f43">⚡ +${timeBonus}</div>
          <div class="rstat-lbl">Time Bonus</div>
        </div>` : ""}
        <div class="rstat">
          <div class="rstat-val" style="color:#a78bfa">✨ +${totalXP} XP</div>
          <div class="rstat-lbl">XP Earned</div>
        </div>
      </div>

      <div class="total-row">Total Score: <strong>+${totalScore}</strong> &nbsp;|&nbsp; Lifetime: <strong>${p.totalScore}</strong></div>

      <div class="xp-section">
        <span class="xp-label">Lv.${info.level} — ${info.xpIntoLevel} / ${info.xpNeeded} XP</span>
        <div class="xp-track"><div class="xp-fill" style="width:${xpPct}%"></div></div>
      </div>

      ${saved
        ? `<p class="saved-note">✅ Result saved to your profile</p>`
        : `<p class="saved-note muted">Login to save results across sessions</p>`}

      <div class="result-btns">
        <button class="btn-primary" onclick="playAgain()">Play Again</button>
        <button class="btn-outline" onclick="closeMazeModal()">Menu</button>
      </div>
    </div>`;

  modal.style.display = "flex";
}

function playAgain() {
  const modal = document.getElementById("mazeResultModal");
  if (modal) modal.style.display = "none";
  startGame(currentLevel);
}

function closeMazeModal() {
  const modal = document.getElementById("mazeResultModal");
  if (modal) modal.style.display = "none";
  goBack();
}

function showStats() {
  playSound(clickSound);
  const p    = getProfile();
  const info = calcLevel(p.totalXP);
  const xpPct = Math.min(100, Math.round((info.xpIntoLevel / info.xpNeeded) * 100));

  const diffRows = ["easy","medium","hard"].map(d => `
    <tr><td>${d.charAt(0).toUpperCase()+d.slice(1)}</td><td>${p.wins[d]||0}</td>
    <td>${p.bestTime[d]!==null ? formatTime(p.bestTime[d]) : "—"}</td></tr>`).join("");

  const histRows = p.history.length === 0
    ? `<tr><td colspan="4" style="text-align:center;color:#888">No games yet</td></tr>`
    : p.history.map(h=>`<tr>
        <td>${h.level.charAt(0).toUpperCase()+h.level.slice(1)}</td>
        <td>${formatTime(h.time)}</td><td>+${h.score}</td><td>${h.date}</td></tr>`).join("");

  document.getElementById("statsContent").innerHTML = `
    <div class="stats-level">
      <span class="level-badge">Lv.${info.level}</span>
      <span class="stats-xp-text">${p.totalXP} XP &nbsp;|&nbsp; Score: ${p.totalScore}</span>
    </div>
    <div class="xp-track" style="margin-bottom:18px"><div class="xp-fill" style="width:${xpPct}%"></div></div>
    <h3 style="margin:0 0 8px;font-size:13px;color:#aaa;letter-spacing:.5px">BY DIFFICULTY</h3>
    <table class="stats-table">
      <thead><tr><th>Level</th><th>Wins</th><th>Best Time</th></tr></thead>
      <tbody>${diffRows}</tbody>
    </table>
    <h3 style="margin:16px 0 8px;font-size:13px;color:#aaa;letter-spacing:.5px">RECENT GAMES</h3>
    <table class="stats-table">
      <thead><tr><th>Level</th><th>Time</th><th>Score</th><th>Date</th></tr></thead>
      <tbody>${histRows}</tbody>
    </table>
    <button onclick="confirmReset()" style="margin-top:16px;background:transparent;color:#ff6b6b;border:1px solid #ff6b6b;border-radius:20px;padding:7px 18px;cursor:pointer;font-size:13px;">🗑 Reset Stats</button>`;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("statsScreen").classList.remove("hidden");
}

function closeStats() {
  document.getElementById("statsScreen").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function confirmReset() {
  if (confirm("Reset all stats? This cannot be undone.")) {
    localStorage.removeItem("mazeProfile");
    showStats();
  }
}

window.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "w": case "arrowup":    movePlayer(0,-1); break;
    case "s": case "arrowdown":  movePlayer(0, 1); break;
    case "a": case "arrowleft":  movePlayer(-1,0); break;
    case "d": case "arrowright": movePlayer(1, 0); break;
  }
});

function goBack() {
  playSound(clickSound);
  stopTimer();
  document.getElementById("gameScreen").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  game.innerHTML = "";
  message.textContent = "";
  message.classList.remove("win");
  maze = null; gameStartTime = null; currentLevel = null;
}