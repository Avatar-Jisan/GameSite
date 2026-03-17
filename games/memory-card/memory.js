const modeBtns = document.querySelectorAll(".mode-btn");
const diffBtns = document.querySelectorAll(".diff-btn");

const modeSection = document.getElementById("modeSection");
const diffSection = document.getElementById("difficultySection");

let selectedMode = null;
let selectedDifficulty = null;

modeBtns.forEach(btn => {
  btn.addEventListener("click", () => {

    selectedMode = btn.dataset.mode;
    console.log("Mode selected:", selectedMode);

    /* switch UI */
    modeSection.style.display = "none";
    diffSection.style.display = "flex";

  });
});

diffBtns.forEach(btn => {
  btn.addEventListener("click", () => {

    selectedDifficulty = btn.dataset.diff;
    console.log("Difficulty selected:", selectedDifficulty);

    /* hide overlay */
    document.getElementById("startOverlay").style.display = "none";
  });
});