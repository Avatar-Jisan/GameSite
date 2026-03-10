const slides = document.querySelectorAll(".slide");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const slider = document.querySelector(".slider");

let current = 0;
let slideInterval;

/* Show slide */

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");
}

/* Next slide */

function nextSlide() {
  current++;

  if (current >= slides.length) {
    current = 0;
  }

  showSlide(current);
}

/* Previous slide */

function prevSlide() {
  current--;

  if (current < 0) {
    current = slides.length - 1;
  }

  showSlide(current);
}

/* Button controls */

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