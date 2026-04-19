$(document).ready(function () {
  loadLibrary();
});

async function loadLibrary() {

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Login first");
    window.location.href = "login.html";
    return;
  }

  const user = await $.get(`http://localhost:3000/api/user/${userId}`);
  const games = await $.getJSON("data/games.json");

  renderRecent(user, games);
  renderFavorites(user, games);
}

function renderRecent(user, games) {

  const container = $("#recentGames");
  container.empty();

  if (!user.games || user.games.length === 0) {
    container.html(`<div class="empty-msg">No recent games 🎮</div>`);
    return;
  }

  const recent = user.games.slice(-6).reverse();

  recent.forEach(g => {
    const game = games.find(x => x.id === g.id);

    container.append(createCard(game, g));
  });
}

function renderFavorites(user, games) {

  const container = $("#favoriteGames");
  container.empty();

  if (!user.favorites || user.favorites.length === 0) {
    container.html(`<div class="empty-msg">No favorites yet ❤️</div>`);
    return;
  }

  user.favorites.forEach(id => {
    const game = games.find(g => g.id === id);

    container.append(createCard(game));
  });
}

function createCard(game, stats = null) {

  return `
    <a href="game.html?id=${game.id}">
      <div class="game-card">
        <img src="${game.image}">
        <div class="game-info">
          <h4>${game.name}</h4>
          ${stats ? `<p>Played ${stats.played} times</p>` : ""}
        </div>
      </div>
    </a>
  `;
}

/* LOGOUT */
$("#logoutItem").click(function () {
  localStorage.removeItem("userId");
  window.location.href = "index.html";
});