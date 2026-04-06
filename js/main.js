
$(document).ready(function () {
  $.ajax({
    url: "data/games.json",
    method: "GET",
    dataType: "json",
    success: function (games) {

      const gamesContainer = $("#gamesContainer");

      games.forEach(game => {
        const card = `<div class="col-lg-3 col-md-4 col-sm-6">
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

      const pickedGames = ["ludo", "rock-paper-scissors", "tic-tac-toe", "memory-card"];

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
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");
  }


  function nextSlide() {
    current++;

    if (current >= slides.length) {
      current = 0;
    }

    showSlide(current);
  }


  function prevSlide() {
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
