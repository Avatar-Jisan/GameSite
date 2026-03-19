// 1. Initialise Scores
let userScore = 0;
let computerScore = 0;

// 2. Casting ID from HTML
const userScore_span = document.getElementById("user-score");
const computerScore_span = document.getElementById("computer-score");
const resultText_h2 = document.getElementById("result-text");
const userChoiceIcon = document.getElementById("user-choice-icon");
const computerChoiceIcon = document.getElementById("computer-choice-icon");
const choices = document.querySelectorAll(".choice-btn");
const resetBtn = document.getElementById("reset-btn");

// 3. Computer Choice Logic
function getComputerChoice() {
    const options = ['rock', 'paper', 'scissors'];
    const randomNumber = Math.floor(Math.random() * 3); // Picks 0, 1, or 2
    return options[randomNumber];
}

// 4. Update Icons based on selection
function updateIcons(userChoice, computerChoice) {
    const icons = {
        rock: "fa-hand-back-fist",
        paper: "fa-hand",
        scissors: "fa-hand-scissors"
    };

    // Reset icons then apply new ones
    userChoiceIcon.className = `fa-solid ${icons[userChoice]} fa-3x`;
    computerChoiceIcon.className = `fa-solid ${icons[computerChoice]} fa-3x`;
}

// 5. Game Logic: Who wins?
function play(userChoice) {
    const computerChoice = getComputerChoice();
    updateIcons(userChoice, computerChoice);

    if (userChoice === computerChoice) {
        resultText_h2.innerHTML = "It's a draw! 🤝";
    } else if (
        (userChoice === "rock" && computerChoice === "scissors") ||
        (userChoice === "paper" && computerChoice === "rock") ||
        (userChoice === "scissors" && computerChoice === "paper")
    ) {
        userScore++;
        userScore_span.innerHTML = userScore;
        resultText_h2.innerHTML = `You win! ${userChoice} beats ${computerChoice} 🔥`;
    } else {
        computerScore++;
        computerScore_span.innerHTML = computerScore;
        resultText_h2.innerHTML = `AI wins! ${computerChoice} beats ${userChoice} 🤖`;
    }
}

// 6. Event Listeners for buttons
choices.forEach(button => {
    button.addEventListener("click", () => {
        const userChoice = button.getAttribute("data-selection");
        play(userChoice);
    });
});

// 7. Reset Game
resetBtn.addEventListener("click", () => {
    userScore = 0;
    computerScore = 0;
    userScore_span.innerHTML = "0";
    computerScore_span.innerHTML = "0";
    resultText_h2.innerHTML = "Choose your move!";
    userChoiceIcon.className = "fa-solid fa-question fa-3x";
    computerChoiceIcon.className = "fa-solid fa-question fa-3x";
});