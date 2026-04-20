$(document).ready(function() {
    // --- GAME LOGIC & STATE ---
    const WINNING_SCORE = 10;
    let playerScore = 0;
    let computerScore = 0;
    let roundsWon = 0;
    let roundsTied = 0;
    let roundsLost = 0;
    let isAnimating = false;
    let gameStartTime = null; // Track when the game session started

    // FontAwesome classes for the hands
    const icons = {
        'rock': '<i class="fa-solid fa-hand-back-fist"></i>',
        'paper': '<i class="fa-solid fa-hand"></i>',
        'scissors': '<i class="fa-solid fa-hand-scissors"></i>'
    };

    // --- AUDIO SYSTEM (Web Audio API Synthesizer) ---
    let audioCtx;
    let musicInterval;
    let isMusicPlaying = false;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playTone(freq, type, duration, vol) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.stop(audioCtx.currentTime + duration);
    }

    function playSFX(type) {
        if (!isMusicPlaying) return;
        initAudio();
        if(type === 'shake') {
            playTone(200, 'triangle', 0.1, 0.1); 
        } else if (type === 'win') {
            playTone(600, 'sine', 0.3, 0.2); 
            setTimeout(() => playTone(800, 'sine', 0.5, 0.2), 100);
        } else if (type === 'lose') {
            playTone(300, 'sawtooth', 0.4, 0.2); 
        } else if (type === 'tie') {
            playTone(400, 'square', 0.3, 0.1); 
        }
    }

    // --- EVENT LISTENERS (Using jQuery) ---
    $('#start-btn').on('click', function() {
        $('#landing-page').addClass('hidden');
        $('#game-page').removeClass('hidden');
        initAudio();
        gameStartTime = Date.now(); // Record start time
        resetStats();
    });
    // this listener for the Back button
    $('#back-btn').on('click', function() {
        $('#result-modal, #game-page').addClass('hidden');
        $('#landing-page').removeClass('hidden');
        resetStats();
    });

    $('#menu-btn').on('click', function() {
        $('#result-modal, #game-page').addClass('hidden');
        $('#landing-page').removeClass('hidden');
        resetStats();
    });

    $('#restart-btn').on('click', function() {
        $('#result-modal').addClass('hidden');
        resetStats();
    });

    $('.control-btn').on('click', function() {
        const choice = $(this).data('choice');
        playRound(choice);
    });

    $('#music-btn').on('click', function() {
        initAudio();
        if (isMusicPlaying) {
            clearInterval(musicInterval);
            isMusicPlaying = false;
            $(this).html('<i class="fa-solid fa-volume-xmark"></i> Music').css({
                'border-color': 'var(--text-pink)',
                'box-shadow': '0 4px 0 var(--text-pink)'
            });
        } else {
            isMusicPlaying = true;
            $(this).html('<i class="fa-solid fa-music"></i> Music').css({
                'border-color': 'var(--text-green)',
                'box-shadow': '0 4px 0 var(--text-green)'
            });
            
            // Background music loop
            const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
            let noteIndex = 0;
            musicInterval = setInterval(() => {
                playTone(notes[noteIndex], 'square', 0.2, 0.05);
                noteIndex = (noteIndex + 1) % notes.length;
            }, 300);
        }
    });

    // --- GAME FUNCTIONS ---
    function resetStats() {
        playerScore = 0;
        computerScore = 0;
        roundsWon = 0;
        roundsTied = 0;
        roundsLost = 0;
        updateUI();
        $('#game-status').text('Choose your weapon!').css('color', 'var(--dark-blue)');
        $('#player-hand').html(icons['rock']);
        $('#computer-hand').html(icons['rock']);
    }

    function updateUI() {
        $('#p-score').text(playerScore);
        $('#c-score').text(computerScore);
    }

    function playRound(playerChoice) {
        if (isAnimating) return; 
        isAnimating = true;

        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        
        // Reset hands to rock for shaking animation
        $('#player-hand').html(icons['rock']).addClass('shake-player');
        $('#computer-hand').html(icons['rock']).addClass('shake-computer');
        $('#game-status').text('Rock... Paper... Scissors...').css('color', 'var(--dark-blue)');

        // Play sound effects
        setTimeout(() => playSFX('shake'), 200);
        setTimeout(() => playSFX('shake'), 700);
        setTimeout(() => playSFX('shake'), 1200);

        // Wait for animation to finish
        setTimeout(() => {
            $('#player-hand').removeClass('shake-player').html(icons[playerChoice]);
            $('#computer-hand').removeClass('shake-computer').html(icons[computerChoice]);

            checkWinner(playerChoice, computerChoice);
            isAnimating = false;
        }, 1500);
    }

    function checkWinner(player, computer) {
        let statusElement = $('#game-status');
        
        if (player === computer) {
            statusElement.text("It's a TIE!").css('color', 'var(--dark-blue)');
            roundsTied++;
            playSFX('tie');
        } else if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            statusElement.text("Point for YOU!").css('color', 'var(--text-green)');
            playerScore++;
            roundsWon++;
            playSFX('win');
        } else {
            statusElement.text("Point for SYSTEM!").css('color', 'var(--text-pink)');
            computerScore++;
            roundsLost++;
            playSFX('lose');
        }

        updateUI();

        if (playerScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
            setTimeout(showResultModal, 500); 
        }
    }

    function showResultModal() {
    // Display the basic stats
    $('#stat-won').text(roundsWon);
    $('#stat-tied').text(roundsTied);
    $('#stat-lost').text(roundsLost);

    // --- SCORE CALCULATION ---
    const finalScore = roundsWon * 10;
    $('#stat-score').text(finalScore);

    const didWin = playerScore === WINNING_SCORE;

    // Set the title based on who won the race to 10
    if (didWin) {
        $('#final-result-title').text("VICTORY!").removeClass('pink').addClass('green');
    } else {
        $('#final-result-title').text("DEFEAT!").removeClass('green').addClass('pink');
    }

    // Send result to backend
    sendScoreToBackend(finalScore, didWin);

    // Show the modal
    $('#result-modal').removeClass('hidden');
}

    // --- BACKEND SCORE SUBMISSION ---
    async function sendScoreToBackend(score, didWin) {
        const userId = localStorage.getItem('userId');
        if (!userId) return; // Not logged in, skip

        const timePlayed = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
        const xpEarned = didWin ? 50 + Math.floor(score / 2) : 10;
        const result = didWin ? 'Victory' : 'Defeat';

        try {
            await fetch('http://localhost:3000/api/game-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    game: 'rock-paper-scissors',
                    score,
                    win: didWin,
                    xpEarned,
                    timePlayed,
                    result
                })
            });
            console.log('RPS score sent to backend ✅');
        } catch (err) {
            console.error('Failed to send RPS score:', err);
        }
    }

    // --- FULLSCREEN LOGIC ---
$('#fullscreen-btn').on('click', function() {
    // Check if the browser is already in fullscreen mode
    if (!document.fullscreenElement) {
        // If not, request to enter fullscreen
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
        // Change the icon to 'compress'
        $(this).html('<i class="fa-solid fa-compress"></i>');
    } else {
        // If already in fullscreen, exit it
        if (document.exitFullscreen) {
            document.exitFullscreen();
            // Change the icon back to 'expand'
            $(this).html('<i class="fa-solid fa-expand"></i>');
        }
    }
});

// Listener for the 'Esc' key or system-level exit
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        // Reset the button icon to 'expand' if fullscreen is closed via Esc key
        $('#fullscreen-btn').html('<i class="fa-solid fa-expand"></i>');
    }
});


});