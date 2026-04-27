$(document).ready(function () {
  /* -------- LOGIN UI SWITCH -------- */

const userId = localStorage.getItem("userId");
const username = localStorage.getItem("username");

const loginBtn = document.getElementById("loginBtn");
const profileBtn = document.getElementById("profileBtn");
const profileName = document.getElementById("profileName");

function logout() {
  
  localStorage.removeItem("userId");
  localStorage.removeItem("username");

  
  window.location.href = "index.html";
}
$("#logoutItem").click(function(){
  logout();
});

const logoutItem = document.getElementById("logoutItem");

if (userId) {
  
  loginBtn.style.display = "none";
  profileBtn.style.display = "inline-block";

  if (logoutItem) logoutItem.style.display = "block";

  if (username) {
    profileName.innerText = username;
  }
} else {
  
  loginBtn.style.display = "inline-block";
  profileBtn.style.display = "none";

  if (logoutItem) logoutItem.style.display = "none";
}
  // Sidebar Category Click (index.html — filter + scroll)
  $(document).on("click", ".sidebar-cat-link", function (e) {
    e.preventDefault();
    $(".sidebar-cat-link").removeClass("active");
    $(this).addClass("active");
    const selectedCat = $(this).data("category");
    $(`.category-btn[data-category="${selectedCat}"]`).click();
    $("#sidebar").removeClass("active");
    $("#menuBtn").removeClass("active");
    // Smooth scroll to category section
    const catSection = document.querySelector(".category");
    if (catSection) {
      catSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Fetch Games Data
  $.ajax({
    url: "data/games.json",
    method: "GET",
    dataType: "json",
    success: function (games) {
      
      // 1. Setup Categories dynamically
      let categories = new Set();
      games.forEach(game => game.category.forEach(cat => categories.add(cat)));
      
      const catBtnContainer = $(".category-buttons");
      catBtnContainer.empty();
      catBtnContainer.append(`<button class="btn category-btn active" data-category="All">All</button>`);
      
      categories.forEach(cat => {
        catBtnContainer.append(`<button class="btn category-btn" data-category="${cat}">${cat}</button>`);
      });

      renderGames(games);

      // 2. Filter Logic
      $(".category-buttons").on("click", ".category-btn", function () {
        $(".category-btn").removeClass("active");
        $(this).addClass("active");
        const selected = $(this).data("category");

        $("#gamesContainer").fadeOut(200, function() {
          if (selected === "All") {
            renderGames(games);
            $(".top-picks").show();
          } else {
            const filtered = games.filter(g => g.category.includes(selected));
            renderGames(filtered);
            $(".top-picks").hide();
          }
          $(this).fadeIn(200);
        });
      });

      // 3. Top Picks & Slider
      const pickedIds = ["ludo", "rock-paper-scissors", "tic-tac-toe", "number-guessing"];
      const featured = games.filter(g => pickedIds.includes(g.id));
      
      const topRow = $(".top-picks .row");
      const slider = $(".slider");
      
      featured.forEach((game, i) => {
        // Render Top Picks
        topRow.append(`
          <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="game-card">
              <img src="${game.image}">
              <div class="card-content">
                <h3 class="game-title">${game.name}</h3>
                <a href="game.html?id=${game.id}" class="text-decoration-none">
                  <button class="btn play-btn">Play</button>
                </a>
              </div>
            </div>
          </div>`);

        // Render Slider
        slider.append(`
          <div class="slide ${i === 0 ? 'active' : ''}">
            <div class="row g-0">
              <div class="col-md-6 slide-text">
                <h1>${game.name}</h1>
                <p>${game.shortDescription}</p>
                <a href="game.html?id=${game.id}" class="btn play-btn">Play Now</a>
              </div>
              <div class="col-md-6 slide-image">
                <img src="${game.image}" class="img-fluid">
              </div>
            </div>
          </div>`);
      });

      initSlider();

      // ---- Cross-page category navigation via ?category= URL param ----
      const urlParams = new URLSearchParams(window.location.search);
      const targetCat = urlParams.get("category");
      if (targetCat) {
        // Click the matching category button (triggers filter)
        const matchBtn = $(`.category-btn[data-category="${targetCat}"]`);
        if (matchBtn.length) {
          matchBtn.click();
        }
        // Smooth scroll to the category section after a short delay
        setTimeout(function () {
          const catSection = document.querySelector(".category");
          if (catSection) {
            catSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 300);
      }
      // ---------------------------------------------------------------
    }
  });
});

function renderGames(list) {
  const container = $("#gamesContainer");
  container.empty();
  list.forEach(g => {
    container.append(`
      <div class="col-lg-3 col-md-4 col-sm-6">
        <div class="game-card">
          <img src="${g.image}" >
          <div class="card-content">
            <h3 class="game-title">${g.name}</h3>
            <a href="game.html?id=${g.id}" class="btn play-btn">Play</a>
          </div>
        </div>
      </div>`);
  });
}

function initSlider() {
  let current = 0;
  let interval;

  function showSlide(index) {
    const slides = $(".slide");
    slides.removeClass("active");
    slides.eq(index).addClass("active");
  }

  function nextSlide() {
    const slides = $(".slide");
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  function prevSlide() {
    const slides = $(".slide");
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  }

  $(".next").click(nextSlide);
  $(".prev").click(prevSlide);

  // 🔥 AUTO SLIDE BACK
  function startAuto() {
    interval = setInterval(nextSlide, 4000);
  }

  function stopAuto() {
    clearInterval(interval);
  }

  startAuto();

  $(".slider").on("mouseenter", stopAuto);
  $(".slider").on("mouseleave", startAuto);
}
