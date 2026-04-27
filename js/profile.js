const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});
$(".btn-save").click(function (e) {
  e.preventDefault();
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});
$(document).ready(function () {

  if (localStorage.getItem("refreshProfile")) {
    localStorage.removeItem("refreshProfile");
    initProfile(); // reload fresh data
  } else {
    initProfile();
  }
  // Open modal
  $("#activityViewAll").click(function (e) {
    e.preventDefault();

    if (!window.currentUser) return;

    renderActivityModal(window.currentUser);
    $("body").css("overflow", "hidden");
    $("#activityModal").fadeIn(200);
  });

  // Close modal
  function closeActivityModal() {
    $("#activityModal").fadeOut(200);
    $("body").css("overflow", "auto");
  }

  $(".close-activity").click(closeActivityModal);

  $("#activityModal").click(function (e) {
    if (e.target.id === "activityModal") {
      closeActivityModal();
    }
  });

});
let gameList = [];

async function loadGamesJSON() {
  gameList = await $.getJSON("data/games.json");
}
async function initProfile() {
  try {
    await loadGamesJSON();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    const user = await $.get(`https://gamesite-y5iw.onrender.com/api/user/${userId}`);

    console.log(user); // DEBUG

    renderProfile(user);
    renderActivity(user);
    renderGameStats(user);
    renderFavorite(user);
    renderProgress(user);
    renderAchievements(user);
    renderLeaderboard(user);  // ← real leaderboard data

    window.currentUser = user;
  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

function renderProfile(user) {
  /* -------- BASIC INFO -------- */
  $(".bio").text(user.bio || "No bio yet");
  $(".join-date").text("Member since " + (user.joinDate || "Today"));
  $(".user-name-dropdown span").text(user.name || user.username);
  $(".profile-main-info h1").text(user.name || user.username);
  $(".username").text(user.username);
  $(".profile-avatar").attr("src", user.profileImage);
  $(".user-avatar-tiny").attr("src", user.profileImage);
  /* -------- LEVEL & XP -------- */

  $(".level-num").text("Level " + user.level);

  $(".xp-ratio").text(`${user.xp} / ${user.maxXp} XP`);

  const percent = (user.xp / user.maxXp) * 100;
  $(".xp-progress-fill").css("width", percent + "%");

  /* -------- STATS -------- */

  $(".stat-card").eq(0).find(".stat-number").text(user.stats.gamesPlayed);
  $(".stat-card")
    .eq(1)
    .find(".stat-number")
    .text(user.stats.hoursPlayed.toFixed(3) + "h");
  $(".stat-card")
    .eq(2)
    .find(".stat-number")
    .text(user.stats.winRate + "%");
  $(".stat-card")
    .eq(3)
    .find(".stat-number")
    .text(user.stats.streak + " Days");
  $(".stat-card").eq(4).find(".stat-number").text(user.totalscore || 0);
  const completedAchievements = user.achievements.filter(a => a.completed).length;

  $(".stat-card").eq(5).find(".stat-number").text(completedAchievements);
}
function renderActivity(user) {
  const container = $(".activity-list");
  container.empty();

  const recentActivities = user.activities.slice(0, 5);

  recentActivities.forEach((item) => {
    container.append(`
    <li>
    <div class="activity-icon">
      <i class="fa-solid ${getActivityIcon(item.text)}"></i>
    </div>

    <div class="activity-details">
      <p>${item.text}</p>
      <span>${formatTime(item.time)}</span>
    </div>

    <div class="xp-gain">+${item.xp} XP</div>
   </li>
`);
  });
}
function formatTime(time) {
  if (!time) return "Just now";

  const past = new Date(time);

  // ❗ HANDLE INVALID DATE
  if (isNaN(past.getTime())) return "Just now";

  const now = new Date();
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return "Just now";

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return minutes + " min ago";

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + " h ago";

  const days = Math.floor(hours / 24);
  if (days < 7) return days + " day ago";

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return weeks + " week ago";

  const months = Math.floor(days / 30);
  return months + " month ago";
}

function renderGameStats(user) {
  const container = $(".game-stats-grid");
  container.empty();

  if (!user.games || user.games.length === 0) {
    container.html(`
    <div class="no-games-msg">
      <i class="fa-solid fa-gamepad"></i>
      <p>No games played yet</p>
      <span>Start playing to see your stats 🚀</span>
    </div>
  `);
    return;
  }
  user.games.forEach((userGame) => {

    const game = gameList.find(g => g.id === userGame.id);

    container.append(`
      <div class="game-stat-item">
        <img src="${game ? game.image : 'assets/games_img/default.png'}" class="game-mini-thumb" />

        <div class="game-stat-details">
          <h4>${game ? game.name : userGame.id}</h4>
          <div class="game-stat-values">
            <p>Played ${userGame.played} times</p>
            <span class="win-rate-positive">
              Win Rate ${userGame.winRate || 0}%
            </span>
          </div>
        </div>
      </div>
    `);
  });
}
function renderFavorite(user) {

  if (!user.games || user.games.length === 0) return;

  // 🔥 find most played game
  const topGame = [...user.games].sort((a, b) => b.played - a.played)[0];

  if (!topGame) return;

  const game = gameList.find(g => g.id === topGame.id);

  if (!game) return;

  $(".game-thumbnail").attr("src", game.image);
  $(".fav-game-info h4").text(game.name);
  $(".fav-game-info p").text(`Played ${topGame.played} times`);
  $(".win-rate-positive").text(`Win Rate ${topGame.winRate}%`);
  $("#viewGameBtn").off("click").on("click", function () {
    window.location.href = `game.html?id=${game.id}`;
  });

}
function renderProgress(user) {
  $(".level-number-big").text(user.level);

  const percent = (user.xp / user.maxXp) * 100;

  $(".progress-card .xp-progress-fill").css("width", percent + "%");

  $(".xp-detailed-text").text(`${user.xp} / ${user.maxXp} XP`);

  $(".next-reward span").text("500 XP Boost"); // or dynamic later
}
function renderAchievements(user) {
  $(".achievement-item").each(function (index) {
    const ach = user.achievements?.[index];
    if (!ach) return;

    const percent = ach?.progress ?? 0;

    $(this)
      .find(".achievement-text span")
      .text(percent + "%");

    $(this)
      .find(".progress-fill")
      .css("width", percent + "%");
  });
}

async function renderLeaderboard(currentUser) {
  try {
    const players = await $.get("https://gamesite-y5iw.onrender.com/api/leaderboard");

    if (!Array.isArray(players) || players.length === 0) return;

    // Find the current user's rank (1-based)
    const myRank = players.findIndex(p =>
      p._id === currentUser._id || p._id?.toString() === currentUser._id?.toString()
    ) + 1; // +1 because findIndex is 0-based

    const leaderList = $(".leader-list");
    leaderList.empty();

    // Render top 3 players
    const top3 = players.slice(0, 3);
    const rankClasses = ["rank-1", "rank-2", "rank-3"];

    top3.forEach((player, i) => {
      const imgSrc = player.profileImage && player.profileImage.startsWith("/uploads")
        ? `https://gamesite-y5iw.onrender.com${player.profileImage}`
        : player.profileImage || "assets/avatar_img.avif";

      const isYou = currentUser && (
        player._id === currentUser._id ||
        player._id?.toString() === currentUser._id?.toString()
      );
      const rowClass = isYou ? "you-row" : "";

      leaderList.append(`
        <li class="${rowClass}">
          <span class="rank-num ${rankClasses[i]}">${i + 1}</span>
          <img src="${imgSrc}" alt="${player.name}" class="player-avatar-tiny" onerror="this.src='assets/avatar_img.avif'" />
          <div class="player-info">
            <span class="player-name">${player.name}</span>
            <span class="player-xp">${player.score} pts</span>
          </div>
          <i class="fa-solid fa-chevron-right"></i>
        </li>
      `);
    });

    // Update the "your rank" summary bar
    if (myRank > 0) {
      const myData = players[myRank - 1];
      $(".your-rank-summary").html(`
        <span>Your Rank: <strong>#${myRank}</strong></span>
        <span>${myData.score} pts</span>
      `);
    }

  } catch (err) {
    console.error("Error loading leaderboard on profile:", err);
  }
}

function getActivityIcon(text) {
  // Convert to lowercase for safer matching
  const lowerText = text.toLowerCase();

  // Specific Games
  if (lowerText.includes("rock paper scissors") || lowerText.includes("rps")) return "fa-hand-back-fist";
  if (lowerText.includes("hangman")) return "fa-person-falling-burst";
  if (lowerText.includes("memory")) return "fa-brain";
  if (lowerText.includes("ludo")) return "fa-dice";
  if (lowerText.includes("tic tac toe")) return "fa-xmark";

  // General Actions
  if (lowerText.includes("achievement")) return "fa-trophy";
  if (lowerText.includes("level")) return "fa-star";
  if (lowerText.includes("puzzle")) return "fa-puzzle-piece";

  // Default Fallback
  return "fa-gamepad";
}
function logout() {
  // Clear session
  localStorage.removeItem("userId");
  localStorage.removeItem("username");

  // 🔄 Redirect
  window.location.href = "index.html";
}
$("#logoutItem").click(function () {
  logout();
});

function openEditModal(user) {
  $("#editModal").show();

  $("#editName").val(user.name);
  $("#editUsername").val(user.username);
  $("#editEmail").val(user.email);
  $("#editBio").val(user.bio);
  $("#previewImage").attr("src", user.profileImage);
}
$(".edit-profile-btn, .settings-btn").click(function () {
  openEditModal(window.currentUser);
});
$(".edit-avatar-btn").click(function () {
  triggerImageUpload();
});

$(".close-edit").click(() => {
  $("#editModal").hide();
});

function triggerImageUpload() {
  document.getElementById("imageUpload").click();
}

$("#imageUpload").on("change", async function (e) {
  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch("https://gamesite-y5iw.onrender.com/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      const newImg = data.imagePath; // "/uploads/xxx.png"

      // update UI
      $("#previewImage").attr("src", "https://gamesite-y5iw.onrender.com" + newImg);
      $(".profile-avatar").attr("src", "https://gamesite-y5iw.onrender.com" + newImg);
      $(".user-avatar-tiny").attr("src", "https://gamesite-y5iw.onrender.com" + newImg);

      // store for saving
      window.tempImagePath = newImg;

      if (window.currentUser) {
        window.currentUser.profileImage = newImg;
      }
    }

  } catch (err) {
    console.error("Upload error:", err);
  }
});

async function saveProfile() {
  const userId = localStorage.getItem("userId");

  const updatedData = {
    name: $("#editName").val(),
    username: $("#editUsername").val(),
    email: $("#editEmail").val(),
    bio: $("#editBio").val(),
    profileImage: window.tempImagePath || window.currentUser.profileImage
  };

  const password = $("#editPassword").val();

  if (password) {
    updatedData.password = password;
  }

  console.log("Sending:", updatedData);

  try {
    const res = await fetch(`https://gamesite-y5iw.onrender.com/api/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    const data = await res.json();

    console.log("Response:", data); // 🔥 DEBUG

    if (data.success) {
      alert("Profile Updated ✅");
      $("#editModal").hide();
      initProfile();
    } else {
      alert("Update failed");
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

function renderActivityModal(user) {
  const container = $(".activity-modal-list");
  container.empty();

  user.activities.forEach((item) => {
    container.append(`
      <li>
        <div class="activity-icon">
          <i class="fa-solid ${getActivityIcon(item.text)}"></i>
        </div>

        <div class="activity-details">
          <p>${item.text}</p>
          <span>${formatTime(item.time)}</span>
        </div>

        <div class="xp-gain">+${item.xp} XP</div>
      </li>
    `);
  });
}

