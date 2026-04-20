// Sidebar Toggle Logic for Mobile
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");

if (menuBtn && overlay) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });
}

$(document).ready(function () {
  // Initialize page — fetch user then leaderboard
  initLeaderboard();

  // Re-fetch leaderboard when game filter changes
  $("#gameFilter").on("change", function () {
    const selectedGame = $(this).val();
    fetchAndRenderLeaderboard(selectedGame, window.currentUser);
  });
});

async function initLeaderboard() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  try {
    // Fetch the logged-in user to update topbar and highlight "you" row
    const res = await fetch(`http://localhost:3000/api/user/${userId}`);
    const currentUser = await res.json();

    window.currentUser = currentUser;

    // Update topbar with real user info
    $(".user-name-dropdown span").text(currentUser.name || currentUser.username);
    $(".user-avatar-tiny").attr("src", currentUser.profileImage || "assets/avatar_img.avif");

    // Fetch and render leaderboard (default: all games by XP)
    fetchAndRenderLeaderboard("all", currentUser);

  } catch (err) {
    console.error("Error loading user for leaderboard:", err);
    fetchAndRenderLeaderboard("all", null);
  }
}

// Map leaderboard dropdown values to the game IDs used in the backend
const gameFilterMap = {
  all: "all",
  ludo: "ludo",
  tictactoe: "tic-tac-toe",
  hangman: "hangman",
  rps: "rock-paper-scissors",
  guessing: "number-guessing"
};

async function fetchAndRenderLeaderboard(gameKey, currentUser) {
  try {
    const backendGameId = gameFilterMap[gameKey] || "all";
    const url = backendGameId === "all"
      ? "http://localhost:3000/api/leaderboard"
      : `http://localhost:3000/api/leaderboard?game=${backendGameId}`;

    const res = await fetch(url);
    const json = await res.json();

    // Handle both plain array and { success, data } wrapped responses
    let players;
    if (Array.isArray(json)) {
      players = json;
    } else if (json && Array.isArray(json.data)) {
      players = json.data;
    } else {
      throw new Error("Invalid leaderboard response: " + JSON.stringify(json));
    }

    if (players.length === 0) {
      $("#podiumContainer").empty();
      $("#leaderboardList").html('<li style="padding:20px;text-align:center;color:var(--text-muted)">No players found yet. Be the first to play!</li>');
      return;
    }

    const top3 = players.slice(0, 3);
    const restList = players.slice(3);

    renderPodium(top3, gameKey);
    renderList(restList, gameKey, 4, currentUser);

  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    // Show empty state gracefully
    $("#podiumContainer").empty();
    $("#leaderboardList").html('<li style="padding:20px;text-align:center;color:var(--text-muted)">Could not load leaderboard. Make sure the server is running.</li>');
  }
}

function renderPodium(top3, gameKey) {
  const container = $("#podiumContainer");
  container.empty();

  if (top3.length === 0) return;

  // Visual podium order: 2nd, 1st, 3rd
  const podiumOrder = [
    top3[1] ? { ...top3[1], place: 2, class: "place-2" } : null,
    top3[0] ? { ...top3[0], place: 1, class: "place-1" } : null,
    top3[2] ? { ...top3[2], place: 3, class: "place-3" } : null
  ];

  podiumOrder.forEach(player => {
    if (!player) return; // Safeguard if fewer than 3 players exist

    const imgSrc = player.profileImage && player.profileImage.startsWith("/uploads")
      ? `http://localhost:3000${player.profileImage}`
      : player.profileImage;

    const scoreLabel = `${player.score} pts`;

    container.append(`
      <div class="podium-place ${player.class}">
        <div class="podium-avatar-container">
          <img src="${imgSrc}" alt="${player.name}" class="podium-avatar" onerror="this.src='assets/avatar_img.avif'" />
          <div class="podium-rank-badge">${player.place}</div>
        </div>
        <div class="podium-block">
          <span class="podium-name">${player.name}</span>
          <span class="podium-score">${scoreLabel}</span>
        </div>
      </div>
    `);
  });
}

function renderList(players, gameKey, startRank, currentUser) {
  const listContainer = $("#leaderboardList");
  listContainer.empty();

  if (players.length === 0) return;

  players.forEach((player, index) => {
    const rank = startRank + index;

    // Highlight the logged-in user's row
    const isCurrentUser = currentUser && (
      player._id === currentUser._id ||
      player._id?.toString() === currentUser._id?.toString()
    );
    const rowClass = isCurrentUser ? "you-row" : "";

    const imgSrc = player.profileImage && player.profileImage.startsWith("/uploads")
      ? `http://localhost:3000${player.profileImage}`
      : player.profileImage;

    const scoreLabel = `${player.score} pts`;

    listContainer.append(`
      <li class="${rowClass}">
        <span class="col-rank">#${rank}</span>
        <div class="col-player">
          <img src="${imgSrc}" alt="${player.name}" class="list-avatar" onerror="this.src='assets/avatar_img.avif'" />
          <span>${player.name}</span>
        </div>
        <span class="col-score">${scoreLabel}</span>
        <span class="col-played">${player.gamesPlayed}</span>
      </li>
    `);
  });
}

// --- AUTHENTICATION ---
function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

$("#logoutItem").click(function (e) {
  e.preventDefault();
  logout();
});