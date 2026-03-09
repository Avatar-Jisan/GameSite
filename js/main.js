const slides = document.querySelectorAll(".slide");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let current = 0;

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[index].classList.add("active");
}

nextBtn.addEventListener("click", () => {
  current++;
  if (current >= slides.length) current = 0;
  showSlide(current);
});

prevBtn.addEventListener("click", () => {
  current--;
  if (current < 0) current = slides.length - 1;
  showSlide(current);
});