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
let gameStartTime = null;
let timerInterval  = null;
let currentGameMode = null;

let resultModal, resultText, playAgainBtn;
let startOverlay, pvpBtn, aiBtn;
let clickSound, winSound, drawSound;

// ===== XP / LEVEL SYSTEM =====
const XP_PER_LEVEL = 50;

function getProfile() {
  const raw = localStorage.getItem("tttProfile");
  if (raw) return JSON.parse(raw);
  return { totalScore:0, totalXP:0,
    wins:{pvp:0,ai:0}, losses:{pvp:0,ai:0}, draws:{pvp:0,ai:0},
    history:[] };
}

function saveProfile(p) { localStorage.setItem("tttProfile", JSON.stringify(p)); }

function xpForLevel(level) { return level * XP_PER_LEVEL; }

function calcLevel(totalXP) {
  let level = 1, accumulated = 0;
  while (accumulated + xpForLevel(level) <= totalXP) {
    accumulated += xpForLevel(level); level++;
  }
  return { level, xpIntoLevel: totalXP - accumulated, xpNeeded: xpForLevel(level) };
}

function formatTime(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function updateHUD() {
  const p = getProfile();
  const { level, xpIntoLevel, xpNeeded } = calcLevel(p.totalXP);
  document.getElementById("hudScore").textContent = p.totalScore;
  document.getElementById("hudXP").textContent    = p.totalXP;
  document.getElementById("hudLevel").textContent = "Lv." + level;
  document.getElementById("hudWins").textContent  = (p.wins.pvp||0) + (p.wins.ai||0);
  const pct = Math.min(100, (xpIntoLevel / xpNeeded) * 100);
  document.getElementById("xpBar").style.width = pct + "%";
}

function startLiveTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameStartTime) return;
    document.getElementById("hudTimer").textContent =
      formatTime(Math.floor((Date.now() - gameStartTime) / 1000));
  }, 500);
}

function stopTimer() { clearInterval(timerInterval); timerInterval = null; }

// ===== REWARDS =====
// outcome: "win", "draw", "loss"
function getRewards(outcome, mode) {
  if (outcome === "win")  return mode === "ai" ? { score:30, xp:20 } : { score:20, xp:10 };
  if (outcome === "draw") return { score:5,  xp:5  };
  return                         { score:0,  xp:2  }; // loss still earns a little XP
}

function calcTimeBonus(timeSecs) {
  // Bonus for fast wins (under 15s = max bonus)
  if (timeSecs <= 15)  return 10;
  if (timeSecs <= 30)  return 5;
  return 0;
}

window.onload = function(){
  gameCells = document.getElementsByClassName("game-cell");

  for(let cell of gameCells){
    cell.addEventListener("click", placeCell);
  }

  document.getElementById("game-restart-button").addEventListener("click", restartGame);

  resultModal  = document.getElementById("result-modal");
  playAgainBtn = document.getElementById("play-again-btn");

  playAgainBtn.onclick = () => {
    resultModal.style.display = "none";
    restartGame();
  };

  startOverlay = document.getElementById("game-overlay");
  pvpBtn = document.getElementById("pvp-btn");
  aiBtn  = document.getElementById("ai-btn");

  clickSound = document.getElementById("click-sound");
  winSound   = document.getElementById("win-sound");
  drawSound  = document.getElementById("draw-sound");

  pvpBtn.onclick = () => {
    playSound(clickSound); vibrate(50);
    gameMode = "pvp"; currentGameMode = "pvp";
    setTimeout(() => {
      startOverlay.style.display = "none";
      gameStartTime = Date.now();
      startLiveTimer();
    }, 150);
  };

  aiBtn.onclick = () => {
    playSound(clickSound); vibrate(50);
    gameMode = "ai"; currentGameMode = "ai";
    setTimeout(() => {
      startOverlay.style.display = "none";
      gameStartTime = Date.now();
      startLiveTimer();
    }, 150);
  };

  updateHUD();
};

function playSound(sound){ if(!sound) return; sound.currentTime=0; sound.play().catch(()=>{}); }
function vibrate(pattern){ if(navigator.vibrate) navigator.vibrate(pattern); }

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

  // Simple AI: try to win, then block, else random
  let move = findBestMove(aiPlayer) ?? findBestMove(playerO) ?? empty[Math.floor(Math.random()*empty.length)];
  makeMove(move, aiPlayer);
  playSound(clickSound);
  vibrate(30);
}

function findBestMove(player) {
  for(let [a,b,c] of winningConditions){
    const cells = [gameBoard[a], gameBoard[b], gameBoard[c]];
    const indices = [a,b,c];
    const filled = cells.filter(v=>v===player).length;
    const empty  = cells.filter(v=>v==="").length;
    if(filled === 2 && empty === 1) return indices[cells.indexOf("")];
  }
  return null;
}

function checkWinner(){
  for(let win of winningConditions){
    let [a,b,c] = win;
    if(gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]){
      win.forEach(i => gameCells[i].classList.add("winning-game-cell"));
      gameOver = true;
      stopTimer();

      const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
      const winner = gameBoard[a];

       
      let outcome;
      if(gameMode === "ai") {
        outcome = (winner !== aiPlayer) ? "win" : "loss";
      } else {
        outcome = "win";  
      }

      applyResult(outcome, timePlayed, winner);
      playSound(winSound);
      vibrate([200,100,200]);
      return;
    }
  }

  if(!gameBoard.includes("")){
    gameOver = true;
    stopTimer();
    const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
    applyResult("draw", timePlayed, null);
    playSound(drawSound);
    vibrate(100);
  }
}

function applyResult(outcome, timePlayed, winner) {
  const rewards   = getRewards(outcome, currentGameMode);
  const timeBonus = (outcome === "win") ? calcTimeBonus(timePlayed) : 0;
  const totalScore = rewards.score + timeBonus;
  const totalXP    = rewards.xp;

  const p = getProfile();
  const oldLevel = calcLevel(p.totalXP).level;

  p.totalScore += totalScore;
  p.totalXP    += totalXP;

  if (outcome === "win")  p.wins[currentGameMode]   = (p.wins[currentGameMode]  ||0)+1;
  if (outcome === "loss") p.losses[currentGameMode] = (p.losses[currentGameMode]||0)+1;
  if (outcome === "draw") p.draws[currentGameMode]  = (p.draws[currentGameMode] ||0)+1;

  p.history.unshift({ mode:currentGameMode, outcome, time:timePlayed,
    score:totalScore, xp:totalXP, winner, date:new Date().toLocaleDateString() });
  if(p.history.length > 10) p.history.pop();

  saveProfile(p);

  const newLevel  = calcLevel(p.totalXP).level;
  const leveledUp = newLevel > oldLevel;
  updateHUD();

  showResultModal(outcome, timePlayed, totalScore, totalXP, timeBonus, rewards, winner, leveledUp, newLevel);
}

function showResultModal(outcome, timePlayed, totalScore, totalXP, timeBonus, rewards, winner, leveledUp, newLevel) {
  const icon  = leveledUp ? "🚀" : outcome === "win" ? "🏆" : outcome === "draw" ? "🤝" : "💪";
  const title = leveledUp ? "Level Up!" : outcome === "win" ? (gameMode==="pvp"?`${winner} Wins!`:"You Win!") : outcome === "draw" ? "It's a Draw!" : "Good Try!";
  const sub   = leveledUp ? `Now Level ${newLevel}!` :
                outcome === "win" ? `${gameMode==="pvp"?"Player vs Player":"vs AI"} · ${formatTime(timePlayed)}` :
                `${gameMode==="pvp"?"Player vs Player":"vs AI"} · ${formatTime(timePlayed)}`;

  const p    = getProfile();
  const info = calcLevel(p.totalXP);
  const xpPct = Math.min(100, Math.round((info.xpIntoLevel / info.xpNeeded) * 100));

  document.getElementById("result-icon").textContent  = icon;
  document.getElementById("result-title").textContent = title;
  document.getElementById("result-sub").textContent   = sub;

  let statsHTML = `
    <div class="rstat"><div class="rstat-val">⏱️ ${formatTime(timePlayed)}</div><div class="rstat-lbl">Time</div></div>
    <div class="rstat"><div class="rstat-val" style="color:#ffd700">🎯 +${rewards.score}</div><div class="rstat-lbl">Base Score</div></div>`;
  if(timeBonus > 0)
    statsHTML += `<div class="rstat"><div class="rstat-val" style="color:#ff9f43">⚡ +${timeBonus}</div><div class="rstat-lbl">Time Bonus</div></div>`;
  statsHTML += `<div class="rstat"><div class="rstat-val" style="color:#a78bfa">✨ +${totalXP} XP</div><div class="rstat-lbl">XP Earned</div></div>`;

  document.getElementById("result-stats").innerHTML = statsHTML;
  document.getElementById("result-total").innerHTML =
    `Total Score: <strong>+${totalScore}</strong> &nbsp;|&nbsp; Lifetime: <strong>${p.totalScore}</strong>`;

  document.getElementById("xp-label").textContent = `Lv.${info.level} — ${info.xpIntoLevel} / ${info.xpNeeded} XP`;
  document.getElementById("xp-fill").style.width  = xpPct + "%";

  resultModal.style.display = "flex";
}

function restartGame(){
  gameOver   = false;
  currPlayer = playerO;
  gameBoard  = ["","","","","","","","",""];
  gameStartTime = Date.now();
  startLiveTimer();

  for(let cell of gameCells){
    cell.innerText = "";
    cell.classList.remove("winning-game-cell");
  }
}

function backToMenu() {
  resultModal.style.display = "none";
  stopTimer();
  restartGame();
  startOverlay.style.display = "flex";
  document.getElementById("hudTimer").textContent = "0s";
  gameStartTime = null; stopTimer();
}

// ===== STATS =====
function showStats() {
  const p    = getProfile();
  const info = calcLevel(p.totalXP);
  const xpPct = Math.min(100, Math.round((info.xpIntoLevel / info.xpNeeded) * 100));

  const totalWins   = (p.wins.pvp||0)   + (p.wins.ai||0);
  const totalLosses = (p.losses.pvp||0) + (p.losses.ai||0);
  const totalDraws  = (p.draws.pvp||0)  + (p.draws.ai||0);

  const histRows = p.history.length === 0
    ? `<tr><td colspan="5" style="text-align:center;color:#888">No games yet</td></tr>`
    : p.history.map(h => {
        const outcomeLabel = h.outcome === "win" ? "✅ Win" : h.outcome === "draw" ? "🤝 Draw" : "❌ Loss";
        return `<tr>
          <td>${h.mode==="ai"?"🤖 AI":"👤 PvP"}</td>
          <td>${outcomeLabel}</td>
          <td>${formatTime(h.time)}</td>
          <td>+${h.score}</td>
          <td>${h.date}</td></tr>`;
      }).join("");

  document.getElementById("stats-content").innerHTML = `
    <div class="stats-level">
      <span class="level-badge">Lv.${info.level}</span>
      <span class="stats-xp-text">${p.totalXP} XP &nbsp;|&nbsp; Score: ${p.totalScore}</span>
    </div>
    <div class="xp-track" style="margin-bottom:16px"><div class="xp-fill" style="width:${xpPct}%"></div></div>

    <div style="display:flex;gap:10px;margin-bottom:16px;justify-content:center">
      <div class="mini-stat"><div class="mini-val" style="color:#4ade80">${totalWins}</div><div class="mini-lbl">Wins</div></div>
      <div class="mini-stat"><div class="mini-val" style="color:#facc15">${totalDraws}</div><div class="mini-lbl">Draws</div></div>
      <div class="mini-stat"><div class="mini-val" style="color:#f87171">${totalLosses}</div><div class="mini-lbl">Losses</div></div>
      <div class="mini-stat"><div class="mini-val">${p.totalScore}</div><div class="mini-lbl">Score</div></div>
    </div>

    <h3 style="margin:0 0 8px;font-size:12px;color:#aaa;letter-spacing:.5px;text-align:left">RECENT GAMES</h3>
    <table class="stats-table">
      <thead><tr><th>Mode</th><th>Result</th><th>Time</th><th>Score</th><th>Date</th></tr></thead>
      <tbody>${histRows}</tbody>
    </table>
    <button onclick="confirmReset()" style="margin-top:14px;background:transparent;color:#f87171;border:1px solid #f87171;border-radius:20px;padding:7px 18px;cursor:pointer;font-size:13px;width:100%">🗑 Reset Stats</button>`;

  document.getElementById("stats-screen").style.display = "flex";
  startOverlay.style.display = "none";
}

function closeStats() {
  document.getElementById("stats-screen").style.display = "none";
  startOverlay.style.display = "flex";
}

function confirmReset() {
  if(confirm("Reset all stats? This cannot be undone.")) {
    localStorage.removeItem("tttProfile");
    updateHUD();
    showStats();
  }
}