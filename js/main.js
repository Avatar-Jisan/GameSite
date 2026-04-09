
$(document).ready(function () {

  //SIDEBAR -------------
  $(".sidebar-cat-link").on("click", function (e) {
    e.preventDefault();

    // REMOVE previous active
    $(".sidebar-cat-link").removeClass("active");

    // ADD active to clicked one
    $(this).addClass("active");

    // Get category
    const selectedCat = $(this).data("category");

    // Trigger main category button
    $(`.category-btn[data-category="${selectedCat}"]`).click();

    // Close sidebar
    $("#sidebar").removeClass("active");
    $("#menuBtn").removeClass("active");

    // Scroll
    document.querySelector('.category').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
  //------------------------

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

      // Add "All" button first
      categoryContainer.append(`<button class="btn category-btn active" data-category="All">All</button>`);

      // Add dynamic categories
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

      const topContainer = $(".top-picks .row");
      topContainer.empty();

      selectedGames.forEach(game => {
        const card = `
      <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="game-card">
          <img src="${game.image}" class="card-image">
          <div class="card-content">
            <h3 class="game-title">${game.name}</h3>
            <a href="game.html?id=${game.id}" class="text-decoration-none">
              <button class="btn play-btn">Play</button>
            </a>
          </div>
        </div>
      </div>`;
        topContainer.append(card);
      });

      const slider = $(".slider");
      slider.find(".slide").remove(); // remove default slides

      selectedGames.forEach((game, index) => {
        const activeClass = index === 0 ? "active" : "";

        const slide = `
      <div class="slide ${activeClass}">
        <div class="row">
          <div class="col-md-6 slide-text">
            <h1>${game.name}</h1>
            <p>${game.shortDescription}</p>
            <a href="game.html?id=${game.id}" class="text-decoration-none">
              <button class="btn play-btn">Play Now</button>
            </a>
          </div>

          <div class="col-md-6 slide-image">
            <img src="${game.image}" class="slide-img">
          </div>
        </div>
      </div>`;

        slider.append(slide);
      });
      initSlider();
    }
  });
});
function initSlider() {
  const slides = document.querySelectorAll(".slide");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");
  const slider = document.querySelector(".slider");

  let current = 0;
  let slideInterval;

  function showSlide(index) {
    const slides = document.querySelectorAll(".slide");
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");
  }


  function nextSlide() {
    const slides = document.querySelectorAll(".slide");
    current++;

    if (current >= slides.length) {
      current = 0;
    }

    showSlide(current);
  }


  function prevSlide() {
    const slides = document.querySelectorAll(".slide");
    current--;

    if (current < 0) {
      current = slides.length - 1;
    }

    showSlide(current);
  }


  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  /* Auto slide */

  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 5000); // 5 seconds
  }

  startAutoSlide();

  /* Stop slider on mouse hover */

  slider.addEventListener("mouseenter", () => {
    clearInterval(slideInterval);
  });

  /* Resume slider when mouse leaves */

  slider.addEventListener("mouseleave", () => {
    startAutoSlide();
  });
}

function renderGames(gameList) {
  const gamesContainer = $("#gamesContainer");
  gamesContainer.empty();

  gameList.forEach(game => {
    const card = `
    <div class="col-lg-3 col-md-4 col-sm-6">
      <div class="game-card">
        <img src="${game.image}" alt="${game.name}" class="card-image">
        <div class="card-content">
          <h3 class="game-title">${game.name}</h3>
          <a href="game.html?id=${game.id}" class="text-decoration-none">
            <button class="btn play-btn">Play</button>
          </a>
        </div>
      </div>
    </div>`;

    gamesContainer.append(card);
  });
}
