
$(document).ready(function () {

  //SIDEBAR CATEGORY LINK HANDLER
  $(".sidebar-cat-link").on("click", function (e) {
    e.preventDefault();
    $(".sidebar-cat-link").removeClass("active");
    $(this).addClass("active");
    const selectedCat = $(this).data("category");
    $(`.category-btn[data-category="${selectedCat}"]`).click();
    $("#sidebar").removeClass("active");
    $("#menuBtn").removeClass("active");
    document.querySelector('.category').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });

  $.ajax({
    url: "data/games.json",
    method: "GET",
    dataType: "json",
    success: function (games) {
      // Extract unique categories
      let categories = new Set();
      games.forEach(game => {
        game.category.forEach(cat => categories.add(cat));
      });

      const categoryContainer = $(".category-buttons");
      categoryContainer.empty();
      categoryContainer.append(`<button class="btn category-btn active" data-category="All">All</button>`);
      categories.forEach(cat => {
        categoryContainer.append(
          `<button class="btn category-btn" data-category="${cat}">${cat}</button>`
        );
      });

      renderGames(games);
      $(".top-picks").show();

      $(".category-buttons").on("click", ".category-btn", function () {
        $(".category-btn").removeClass("active");
        $(this).addClass("active");
        const selectedCategory = $(this).data("category");
        $(".sidebar-cat-link").removeClass("active");
        $(`.sidebar-cat-link[data-category="${selectedCategory}"]`).addClass("active");

        if (selectedCategory === "All") {
          $("#gamesContainer").fadeOut(150, function () {
            renderGames(games);
            $(".top-picks").show();
            $(this).fadeIn(150);
          });
        } else {
          const filteredGames = games.filter(game =>
            game.category.includes(selectedCategory)
          );
          $("#gamesContainer").fadeOut(150, function () {
            renderGames(filteredGames);
            $(".top-picks").hide();
            $(this).fadeIn(150);
          });
        }
      });

      const pickedGames = ["ludo", "rock-paper-scissors", "tic-tac-toe", "number-guessing"];
      const selectedGames = games.filter(game =>
        pickedGames.includes(game.id)
      );

      const topContainer = $("#topPicksContainer");
      topContainer.empty();

      selectedGames.forEach((game, index) => {
        const card = `
        <div class="game-card">
          <img src="${game.image}" class="card-image" alt="${game.name}">
          <div class="card-glow-trace"></div>
          <div class="card-content">
            <h3 class="game-title">${game.name}</h3>
            <a href="game.html?id=${game.id}" class="text-decoration-none">
              <button class="btn play-btn">Play</button>
            </a>
          </div>
        </div>`;
        topContainer.append(card);
      });

      applyInteraction();
      observeCards();
      buildHeroShowcase(selectedGames);
    }
  });
});

/* Hero Showcase Slider */
function buildHeroShowcase(games) {
  const heroMain = document.getElementById("heroMain");
  const selectorList = document.getElementById("heroSelectorList");

  if (!heroMain || !selectorList || games.length === 0) return;

  games.forEach((game, index) => {
    const activeClass = index === 0 ? "active" : "";

    const slide = document.createElement("div");
    slide.className = `hero-slide ${activeClass}`;
    slide.innerHTML = `
      <img src="${game.image}" class="hero-slide-bg" alt="${game.name}">
      <div class="hero-slide-overlay"></div>
      <div class="hero-slide-content">
        <div class="hero-badge">Featured</div>
        <h1 class="glitch" data-text="${game.name}">${game.name}</h1>
        <p>${game.shortDescription}</p>
        <div class="hero-actions">
          <a href="game.html?id=${game.id}" class="hero-play-btn">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Play Now
          </a>
          <a href="game.html?id=${game.id}" class="hero-info-btn">Learn More</a>
        </div>
      </div>
    `;
    heroMain.appendChild(slide);

    const item = document.createElement("div");
    item.className = `hero-selector-item ${activeClass}`;
    item.dataset.index = index;
    item.innerHTML = `
      <img src="${game.image}" class="hero-selector-thumb" alt="${game.name}">
      <div class="hero-selector-info">
        <h4>${game.name}</h4>
        <span>${game.category.join(" · ")}</span>
      </div>
    `;
    selectorList.appendChild(item);
  });

  initHeroShowcase(games.length);
}

function initHeroShowcase(totalSlides) {
  let current = 0;
  let autoInterval;
  const SLIDE_DURATION = 6000;

  const slides = () => document.querySelectorAll(".hero-slide");
  const items = () => document.querySelectorAll(".hero-selector-item");
  const progressBar = document.getElementById("heroProgressBar");

  function goToSlide(index) {
    const allSlides = slides();
    const allItems = items();
    allSlides.forEach(s => s.classList.remove("active"));
    allItems.forEach(i => i.classList.remove("active"));
    allSlides[index].classList.add("active");
    allItems[index].classList.add("active");
    current = index;
    resetProgress();
  }

  function nextSlide() {
    const next = (current + 1) % totalSlides;
    goToSlide(next);
  }

  function resetProgress() {
    if (!progressBar) return;
    progressBar.style.animation = "none";
    progressBar.offsetHeight; // force reflow
    progressBar.style.animation = `hero-progress-fill ${SLIDE_DURATION}ms linear forwards`;
  }

  function startAuto() {
    clearInterval(autoInterval);
    resetProgress();
    autoInterval = setInterval(nextSlide, SLIDE_DURATION);
  }

  document.querySelectorAll(".hero-selector-item").forEach(item => {
    item.addEventListener("click", () => {
      const idx = parseInt(item.dataset.index);
      goToSlide(idx);
      clearInterval(autoInterval);
      startAuto();
    });
  });

  const showcase = document.getElementById("heroShowcase");
  if (showcase) {
    showcase.addEventListener("mouseenter", () => {
      clearInterval(autoInterval);
      if (progressBar) progressBar.style.animationPlayState = "paused";
    });
    showcase.addEventListener("mouseleave", () => {
      if (progressBar) progressBar.style.animationPlayState = "running";
      startAuto();
    });
  }

  startAuto();
}

function renderGames(gameList) {
  const gamesContainer = $("#gamesContainer");
  gamesContainer.empty();

  gameList.forEach(game => {
    const card = `
    <div class="game-card">
      <img src="${game.image}" alt="${game.name}" class="card-image">
      <div class="card-glow-trace"></div>
      <div class="card-content">
        <h3 class="game-title">${game.name}</h3>
        <a href="game.html?id=${game.id}" class="text-decoration-none">
          <button class="btn play-btn">Play</button>
        </a>
      </div>
    </div>`;
    gamesContainer.append(card);
  });

  applyInteraction();
  observeCards();
}

