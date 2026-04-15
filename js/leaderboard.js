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

// Dummy data reflecting different games
const dummyData = [
  { id: 1, name: "ShadowStrike", avatar: "assets/avatar_img.avif", stats: { all: 4250, ludo: 1200, tictactoe: 500, hangman: 800, rps: 900, guessing: 850 }, winRate: 74, played: 342 },
  { id: 2, name: "Jisan Ahmed", avatar: "assets/avatar_img.avif", stats: { all: 3800, ludo: 2100, tictactoe: 200, hangman: 400, rps: 600, guessing: 500 }, winRate: 68, played: 280 },
  { id: 3, name: "PixelMaster", avatar: "assets/avatar_img.avif", stats: { all: 3100, ludo: 900, tictactoe: 800, hangman: 300, rps: 400, guessing: 700 }, winRate: 61, played: 410 },
  { id: 4, name: "NinjaPro", avatar: "assets/avatar_img.avif", stats: { all: 2900, ludo: 400, tictactoe: 900, hangman: 1000, rps: 300, guessing: 300 }, winRate: 55, played: 190 },
  { id: 5, name: "CodeCrusher", avatar: "assets/avatar_img.avif", stats: { all: 2500, ludo: 1000, tictactoe: 100, hangman: 200, rps: 700, guessing: 500 }, winRate: 82, played: 150 },
  { id: 6, name: "WebWarrior", avatar: "assets/avatar_img.avif", stats: { all: 1800, ludo: 300, tictactoe: 400, hangman: 500, rps: 200, guessing: 400 }, winRate: 49, played: 220 },
  { id: 7, name: "GameKing", avatar: "assets/avatar_img.avif", stats: { all: 1500, ludo: 200, tictactoe: 600, hangman: 100, rps: 500, guessing: 100 }, winRate: 45, played: 120 },
];

$(document).ready(function () {
  // 1. Initialize the page by fetching the logged-in user
  initLeaderboard();

  // Filter change event listener
  $("#gameFilter").on("change", function () {
    const selectedGame = $(this).val();
    // Re-render, making sure we still pass the global currentUser variable
    renderLeaderboard(selectedGame, window.currentUser);
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
    // 2. Fetch the current logged-in user's data
    // (Ensure this matches your actual Node.js API endpoint)
    const res = await fetch(`http://localhost:3000/api/user/${userId}`);
    const currentUser = await res.json();
    
    // Store globally so the filter dropdown can access it later
    window.currentUser = currentUser;

    // 3. Update the Topbar UI with their data
    $(".user-name-dropdown span").text(currentUser.name || currentUser.username);
    $(".user-avatar-tiny").attr("src", currentUser.profileImage || "assets/avatar_img.avif");

    // 4. Render the leaderboard, passing the user so we can highlight them
    renderLeaderboard("all", currentUser);

  } catch (err) {
    console.error("Error loading user for leaderboard:", err);
    // If backend fails, render leaderboard anyway without highlighting
    renderLeaderboard("all", null);
  }
}

// Update your render function to accept the currentUser parameter
function renderLeaderboard(gameKey, currentUser) {
  // ... (Keep your existing sorting logic)
  const sortedData = [...dummyData].sort((a, b) => b.stats[gameKey] - a.stats[gameKey]);

  const top3 = sortedData.slice(0, 3);
  const restList = sortedData.slice(3);

  // Pass currentUser down to the list renderer
  renderPodium(top3, gameKey);
  renderList(restList, gameKey, 4, currentUser); 
}

function renderLeaderboard(gameKey) {
  // 1. Sort the data based on the selected game filter (descending order)
  const sortedData = [...dummyData].sort((a, b) => b.stats[gameKey] - a.stats[gameKey]);

  // 2. Split data into Top 3 and the Rest
  const top3 = sortedData.slice(0, 3);
  const restList = sortedData.slice(3);

  // 3. Render
  renderPodium(top3, gameKey);
  renderList(restList, gameKey, 4); // Start rank at 4 for the list
}

function renderPodium(top3, gameKey) {
  const container = $("#podiumContainer");
  container.empty();

  // Reordering array for visual podium arrangement (2nd Place, 1st Place, 3rd Place)
  const podiumOrder = [
    { ...top3[1], place: 2, class: "place-2" },
    { ...top3[0], place: 1, class: "place-1" },
    { ...top3[2], place: 3, class: "place-3" }
  ];

  podiumOrder.forEach(player => {
    if (!player.name) return; // Safeguard if there are less than 3 players in the DB
    
    container.append(`
      <div class="podium-place ${player.class}">
        <div class="podium-avatar-container">
          <img src="${player.avatar}" alt="${player.name}" class="podium-avatar" />
          <div class="podium-rank-badge">${player.place}</div>
        </div>
        <div class="podium-block">
          <span class="podium-name">${player.name}</span>
          <span class="podium-score">${player.stats[gameKey]} XP</span>
        </div>
      </div>
    `);
  });
}

function renderList(players, gameKey, startRank, currentUser) {
  const listContainer = $("#leaderboardList");
  listContainer.empty();

  players.forEach((player, index) => {
    const rank = startRank + index;
    
    // Check if this leaderboard entry matches our logged-in user.
    // NOTE: Change 'player.name' to 'player.id' once you switch from dummy data to your real MongoDB data!
    let isCurrentUser = false;
    if (currentUser && (player.name === currentUser.username || player.name === currentUser.name)) {
      isCurrentUser = true;
    }

    // Add a specific class if it's the current user
    const rowClass = isCurrentUser ? "you-row" : "";

    listContainer.append(`
      <li class="${rowClass}">
        <span class="col-rank">#${rank}</span>
        <div class="col-player">
          <img src="${player.avatar}" alt="${player.name}" class="list-avatar" />
          <span>${player.name}</span>
        </div>
        <span class="col-score">${player.stats[gameKey]} XP</span>
        <span class="col-winrate">${player.winRate}%</span>
        <span class="col-played">${player.played}</span>
      </li>
    `);
  });
}
// --- AUTHENTICATION LOGIC ---
function logout() {
  // Clear session data from local storage
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  
  // Optional: If you use tokens (like JWT) later with Node/Mongo, clear them here too
  // localStorage.removeItem("token");

  // Redirect to home/login page
  window.location.href = "index.html";
}

// Attach click event to the logout button
$("#logoutItem").click(function (e) {
  e.preventDefault(); // Prevent default link behavior
  logout();
});