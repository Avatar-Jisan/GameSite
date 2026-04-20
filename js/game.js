const parameter = new URLSearchParams(window.location.search);
const gameId = parameter.get("id");
$(document).ready(function () {
    checkFavorite(gameId);

    $.getJSON("data/games.json", function (games) {
        const game = games.find(g => g.id === gameId);
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
    <a href="game.html?id=${game.id}" class="text-decoration-none">
      <div class="related-card mb-3">
        <div class="d-flex align-items-center">
          <img src="${game.image}" class="related-img me-2"  object-fit:cover;">
          <div class="game-txt">
            <h5 class="mb-0 text-white game-name">${game.name}</h5>
            
          </div>
        </div>
    </div>
    </a>`;

            relatedContainer.append(card);
        });
        $("#gameTitle1").text(game.name);
        $("#gameTitle").text(game.name);
        $("#gameDeveloper").text(game.developer);
        $("#gameCategory").text(game.category.join(", "));
        $("#gameDescription").text(game.longDescription);

        game.rules.forEach(element => {
            $("#gameRules").append(`<li>${element}</li>`);
        });

        // Load the game in the iframe
        $("#gameFrame").attr("src", game.path);
    });
    async function checkFavorite(gameId) {

        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const user = await $.get(`http://localhost:3000/api/user/${userId}`);

        if (user.favorites && user.favorites.includes(gameId)) {
            setFavUI(true);
        } else {
            setFavUI(false);
        }
    }

    // Fullscreen functionality
    document.querySelector(".full-btn").addEventListener("click", function () {
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
    document.addEventListener("fullscreenchange", () => {

        const gameFrame = document.getElementById("gameFrame");

        if (!document.fullscreenElement) {
            gameFrame.contentWindow.postMessage("exitFullscreen", "*");
        }

    });

    $(".fav-btn").click(async function () {

        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("Login first");
            return;
        }

        const parameter = new URLSearchParams(window.location.search);
        const gameId = parameter.get("id");

        const res = await fetch("http://localhost:3000/api/favorite/toggle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, gameId })
        });

        const data = await res.json();

        if (data.success) {
            setFavUI(data.isFavorite);
        }

    });
    function setFavUI(isFav) {
        const btn = $(".fav-btn");

        if (isFav) {
            btn.removeClass("fa-regular").addClass("fa-solid");
            btn.css("background", "#ef4444");
        } else {
            btn.removeClass("fa-solid").addClass("fa-regular");
            btn.css("background", "var(--accent-color)");
        }
    }
});