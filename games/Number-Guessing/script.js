let randomNumber, attempts, maxAttempts, maxRange;
let currentPlayer=1;
let startTime, timerInterval, timeLeft=60;

const canvas=document.getElementById("confettiCanvas");
const ctx=canvas.getContext("2d");
let confettiParticles=[];

// Difficulty
function setDifficulty(){
    const diff=document.getElementById("difficulty").value;
    if(diff==="easy"){ maxRange=50; maxAttempts=10;}
    else if(diff==="medium"){ maxRange=100; maxAttempts=7;}
    else{ maxRange=200; maxAttempts=5;}
    document.getElementById("rangeText").textContent=`Guess a number between 1 and ${maxRange}`;
    restartGame();
}

// Restart
function restartGame(){
    randomNumber=Math.floor(Math.random()*maxRange)+1;
    attempts=0;
    currentPlayer=1;
    timeLeft=60;
    startTime=Date.now();
    clearInterval(timerInterval);
    timerInterval=setInterval(updateTimer,1000);
    document.getElementById("message").textContent="";
    document.getElementById("attempts").textContent="";
    document.getElementById("guessInput").value="";
    updateTimer();
}

// Timer
function updateTimer(){
    document.getElementById("overlayTimer").textContent=`${timeLeft}s`;
    if(timeLeft<=0){
        clearInterval(timerInterval);
        playSound('lose');
        showResultOverlay("Time's up!","Game Over! Number was "+randomNumber);
    }
    timeLeft--;
}

// Check Guess
function checkGuess(){
    const guess=Number(document.getElementById("guessInput").value);
    const p1=document.getElementById("player1Name").value.trim();
    const p2=document.getElementById("player2Name").value.trim();
    const message=document.getElementById("message");
    if(!p1 || !p2){ message.textContent="❌ Enter both player names!"; return;}
    if(!guess){ message.textContent="❌ Enter a number!"; return;}

    attempts++;
    if(guess<randomNumber){ message.textContent=`📉 Player ${currentPlayer} too low!`; playSound('wrong'); nextPlayer();}
    else if(guess>randomNumber){ message.textContent=`📈 Player ${currentPlayer} too high!`; playSound('wrong'); nextPlayer();}
    else{
        clearInterval(timerInterval);
        const timeTaken=60-timeLeft;
        const winner=currentPlayer===1?p1:p2;
        saveScore(winner,attempts,timeTaken);
        playSound('win');
        showResultOverlay(`${winner} wins!`,`Tries: ${attempts} | Time: ${timeTaken}s`);
        startConfetti();
        return;
    }

    if(attempts>=maxAttempts){
        clearInterval(timerInterval);
        playSound('lose');
        showResultOverlay("Max attempts reached!","Number was "+randomNumber);
    }
    document.getElementById("attempts").textContent=`Attempts: ${attempts}/${maxAttempts}`;
}

// Switch player
function nextPlayer(){ currentPlayer=currentPlayer===1?2:1; }

// Sounds
function playSound(type){
    if(type==='win') document.getElementById("winSound").play();
    else if(type==='lose') document.getElementById("loseSound").play();
    else document.getElementById("wrongSound").play();
}

// Result Overlay
function showResultOverlay(title,info){
    document.getElementById("resultMessage").textContent=title;
    document.getElementById("resultInfo").textContent=info;
    document.getElementById("resultOverlay").classList.add("show");
}
function closeResultOverlay(){
    document.getElementById("resultOverlay").classList.remove("show");
}

// Leaderboard
function saveScore(name,attempts,time){
    let scores=JSON.parse(localStorage.getItem("scores"))||[];
    scores.push({name,attempts,time});
    scores.sort((a,b)=> a.attempts===b.attempts? a.time-b.time : a.attempts-b.attempts);
    scores=scores.slice(0,5);
    localStorage.setItem("scores",JSON.stringify(scores));
    showLeaderboard();
}
function showLeaderboard(){
    const scores=JSON.parse(localStorage.getItem("scores"))||[];
    const list=document.getElementById("leaderboard");
    list.innerHTML="";
    scores.forEach(p=>{
        const li=document.createElement("li");
        li.textContent=`${p.name} | ${p.attempts} tries | ${p.time}s`;
        list.appendChild(li);
    });
}

// Confetti
function startConfetti(){
    resizeCanvas();
    confettiParticles=[];
    for(let i=0;i<200;i++){
        confettiParticles.push({
            x:Math.random()*canvas.width,
            y:Math.random()*canvas.height-canvas.height,
            r:Math.random()*6+4,
            d:Math.random()*50+10,
            color:`hsl(${Math.random()*360},100%,50%)`,
            tilt:Math.random()*10-10
        });
    }
    requestAnimationFrame(updateConfetti);
}
function resizeCanvas(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight;}
function updateConfetti(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    confettiParticles.forEach(p=>{
        ctx.beginPath();
        ctx.lineWidth=p.r;
        ctx.strokeStyle=p.color;
        ctx.moveTo(p.x+p.tilt+p.r/2,p.y);
        ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/2);
        ctx.stroke();
        p.y+=2; p.tilt+=0.1;
        if(p.y>canvas.height){ p.y=0; p.x=Math.random()*canvas.width;}
    });
    requestAnimationFrame(updateConfetti);
}

// Init
setDifficulty();
showLeaderboard();
window.addEventListener('resize',resizeCanvas);