const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});
$(".btn-save").click(function(e){
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

    const user = await $.get(`http://localhost:3000/api/user/${userId}`);

    console.log(user); // DEBUG

    renderProfile(user);
    renderActivity(user);
    renderGameStats(user);
    renderFavorite(user);
    renderProgress(user);
    renderAchievements(user);
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
  $(".stat-card").eq(4).find(".stat-number").text(user.xp);
  const completedAchievements = user.achievements.filter(a => a.completed).length;

  $(".stat-card").eq(5).find(".stat-number").text(completedAchievements);
}
function renderActivity(user) {
  const container = $(".activity-list");
  container.empty();

  user.activities.forEach((item) => {
    container.append(`
    <li>
    <div class="activity-icon">
      <i class="fa-solid ${getActivityIcon(item.text)}"></i>
    </div>

    <div class="activity-details">
      <p>${item.text}</p>
      <span>${item.time}</span>
    </div>

    <div class="xp-gain">+${item.xp} XP</div>
   </li>
`);
  });
}
function renderGameStats(user) {
  const container = $(".game-stats-grid");
  container.empty();

  gameList.forEach((game) => {
    const userGame = user.games.find((g) => g.name === game.name);

    if (!userGame) return; // skip if user didn't play

    container.append(`
      <div class="game-stat-item">
        <img src="${game.image}" class="game-mini-thumb" />

        <div class="game-stat-details">
          <h4>${game.name}</h4>
          <p>Played ${userGame.played} times</p>
          <span class="win-rate-positive">
            Win Rate ${userGame.winRate}%
          </span>
        </div>

        <i class="fa-solid fa-chevron-right"></i>
      </div>
    `);
  });
}
function renderFavorite(user) {
  const fav = gameList.find((g) => g.name === user.favoriteGame);
  const stats = user.games.find((g) => g.name === user.favoriteGame);

  if (!fav || !stats) return;

  $(".game-thumbnail").attr("src", fav.image);
  $(".fav-game-info h4").text(fav.name);
  $(".fav-game-info p").text(`Played ${stats.played} times`);
  $(".win-rate-positive").text(`Win Rate ${stats.winRate}%`);
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
function getActivityIcon(text) {
  if (text.includes("Ludo")) return "fa-dice";
  if (text.includes("Level")) return "fa-star";
  if (text.includes("puzzle")) return "fa-puzzle-piece";
  if (text.includes("Tic Tac Toe")) return "fa-xmark";

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
    const res = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      const newImg = data.imagePath; // "/uploads/xxx.png"

      // update UI
      $("#previewImage").attr("src", "http://localhost:3000" + newImg);
      $(".profile-avatar").attr("src", "http://localhost:3000" + newImg);
      $(".user-avatar-tiny").attr("src", "http://localhost:3000" + newImg);

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
    const res = await fetch(`http://localhost:3000/api/user/${userId}`, {
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

