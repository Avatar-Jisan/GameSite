const parameter = new URLSearchParams(window.location.search);
const gameId = parameter.get("id");

if (!gameId) {
  // Redirect to home if no game ID provided
  window.location.href = "index.html";
}

$.getJSON("data/games.json", function (games) {
  const game = games.find(g => g.id === gameId);

  if (!game) {
    // Game not found — show error or redirect
    document.querySelector(".game-page").innerHTML = `
      <div style="text-align:center; padding:80px 20px;">
        <h2 style="color: var(--accent-ice); font-family: var(--font-display);">Game Not Found</h2>
        <p style="color: var(--text-muted); margin-top:12px;">The game you're looking for doesn't exist.</p>
        <a href="index.html" class="hero-play-btn" style="margin-top:24px; display:inline-flex;">Back to Home</a>
      </div>
    `;
    return;
  }

  const relatedGames = games
    .filter(g => g.id !== gameId)
    .map(g => {
      const matchCount = g.category.filter(cat => game.category.includes(cat)).length;
      return { ...g, matchCount };
    })
    .filter(g => g.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);

  const relatedContainer = $("#relatedGames");
  relatedContainer.empty();

  relatedGames.forEach(game => {
    const card = `
    <a href="game.html?id=${game.id}" class="text-decoration-none" style="display:block;">
      <div class="related-card mb-3">
        <div class="card-glow-trace"></div>
        <div class="d-flex align-items-center w-100" style="position:relative; z-index:2;">
          <img src="${game.image}" class="related-img me-2" style="object-fit:cover;">
          <div class="game-txt">
            <h5 class="mb-0 text-white game-name">${game.name}</h5>
          </div>
        </div>
      </div>
    </a>`;
    relatedContainer.append(card);
  });

  // Apply interactivity to new cards
  setTimeout(() => {
    applyInteraction();
    observeCards();
    initMagneticElements(); // re-init to catch new elements if any
  }, 50);

  $("#gameTitle1").text(game.name);
  $("#gameTitle").text(game.name);
  $("#gameDeveloper").text(game.developer);
  $("#gameCategory").text(game.category.join(", "));
  $("#gameDescription").text(game.longDescription);

  game.rules.forEach(element => {
    $("#gameRules").append(`<li>${element}</li>`);
  });

  // Load game in iframe
  $("#gameFrame").attr("src", game.path);
}).fail(function() {
  console.error("Failed to load games data.");
});

// Fullscreen functionality
const fullBtn = document.querySelector(".full-btn");
if (fullBtn) {
  fullBtn.addEventListener("click", function () {
    const gameFrame = document.getElementById("gameFrame");
    if (gameFrame.requestFullscreen) {
      gameFrame.requestFullscreen();
    } else if (gameFrame.webkitRequestFullscreen) {
      gameFrame.webkitRequestFullscreen();
    } else if (gameFrame.msRequestFullscreen) {
      gameFrame.msRequestFullscreen();
    }
    gameFrame.contentWindow.postMessage("enterFullscreen", "*");
  });
}

document.addEventListener("fullscreenchange", () => {
  const gameFrame = document.getElementById("gameFrame");
  if (!document.fullscreenElement) {
    gameFrame.contentWindow.postMessage("exitFullscreen", "*");
  }
});
