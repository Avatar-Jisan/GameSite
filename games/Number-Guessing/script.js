let randomNumber;
let attempts;
let maxAttempts;
let maxRange;
let startTime;
let timerInterval;

function setDifficulty() {
    let difficulty = document.getElementById("difficulty").value;

    if (difficulty === "easy") {
        maxRange = 50;
        maxAttempts = 10;
    } else if (difficulty === "medium") {
        maxRange = 100;
        maxAttempts = 7;
    } else {
        maxRange = 200;
        maxAttempts = 5;
    }

    document.getElementById("rangeText").textContent =
        `Guess a number between 1 and ${maxRange}`;

    restartGame();
}

function restartGame() {
    randomNumber = Math.floor(Math.random() * maxRange) + 1;
    attempts = 0;

    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    document.getElementById("message").textContent = "";
    document.getElementById("attempts").textContent = "";
    document.getElementById("guessInput").value = "";
}

function updateTimer() {
    let seconds = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").textContent = `⏱ Time: ${seconds}s`;
}

function checkGuess() {
    let userGuess = Number(document.getElementById("guessInput").value);
    let playerName = document.getElementById("playerName").value.trim();
    let message = document.getElementById("message");

    if (!playerName) {
        message.textContent = "❌ Enter your name!";
        return;
    }

    if (!userGuess) {
        message.textContent = "❌ Enter a number!";
        return;
    }

    attempts++;

    if (userGuess < randomNumber) {
        message.textContent = "📉 Too low!";
    } else if (userGuess > randomNumber) {
        message.textContent = "📈 Too high!";
    } else {
        let timeTaken = Math.floor((Date.now() - startTime) / 1000);
        message.textContent = `🎉 ${playerName} wins in ${attempts} tries & ${timeTaken}s!`;
        message.classList.add("win");
        clearInterval(timerInterval);
        saveScore(playerName, attempts, timeTaken);
        return;
    }

    if (attempts >= maxAttempts) {
        message.textContent = `💀 Game Over! Number was ${randomNumber}`;
        clearInterval(timerInterval);
    }

    document.getElementById("attempts").textContent =
        `Attempts: ${attempts}/${maxAttempts}`;
}

function saveScore(name, attempts, time) {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    scores.push({ name, attempts, time });

    scores.sort((a, b) => {
        if (a.attempts === b.attempts) {
            return a.time - b.time;
        }
        return a.attempts - b.attempts;
    });

    scores = scores.slice(0, 5);

    localStorage.setItem("scores", JSON.stringify(scores));
    showLeaderboard();
}

function showLeaderboard() {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    let list = document.getElementById("leaderboard");
    list.innerHTML = "";

    scores.forEach((player, index) => {
        let li = document.createElement("li");
        li.textContent =
            `#${index + 1} - ${player.name} | ${player.attempts} tries | ${player.time}s`;
        list.appendChild(li);
    });
}

// Start
setDifficulty();
showLeaderboard();