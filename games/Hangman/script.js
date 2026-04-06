/* script.js - Non-Repeating Words Update */

$(document).ready(function() {
    // --- Data Grouped by Category ---
    const wordLists = {
        easy: {
            "Animal": ["CAT", "DOG", "BIRD", "FISH"],
            "Nature": ["SUN", "TREE", "LEAF"],
            "Color": ["BLUE", "RED", "PINK"],
            "Action": ["PLAY", "JUMP", "RUN"]
        },
        medium: {
            "Building": ["HOUSE", "CABIN", "HOTEL"],
            "Food": ["APPLE", "PIZZA", "BREAD"],
            "Nature": ["WATER", "RIVER", "STONE"],
            "Art": ["MUSIC", "PAINT", "DANCE"]
        },
        hard: {
            "Nature": ["MOUNTAIN", "VOLCANO", "TORNADO"],
            "Technology": ["COMPUTER", "INTERNET", "ROBOTICS"],
            "Place": ["LIBRARY", "HOSPITAL", "AIRPORT"],
            "Instrument": ["GUITAR", "PIANO", "VIOLIN"]
        }
    };

    const MAX_ATTEMPTS = 5;

    // --- State ---
    let gameState = {
        currentLevel: null,
        score: 0,
        attemptsLeft: MAX_ATTEMPTS,
        currentWordObj: null,
        guessedLetters: [],
        correctGuessed: [],
        availableWordsPool: {} // NEW: This will hold our temporary, shrinking list of words
    };

    // --- Screen Management ---
    function showScreen(screenId) {
        $('.screen').removeClass('visible');
        $(`#${screenId}`).addClass('visible');
    }

    // --- Helper: Clone the word list ---
    // Creates a fresh copy of the words for the selected level so we can delete from it
    function getFreshWordPool(level) {
        return JSON.parse(JSON.stringify(wordLists[level]));
    }

    // --- Event Listeners ---

    // 1. Landing -> Level Selection
    $('#play-now-btn').on('click', function() {
        showScreen('level-selection-page');
    });

    // 2. Level Selection -> Gameplay
    $('.level-btn').on('click', function() {
        const selectedLevel = $(this).data('level');
        
        // NEW: When starting a brand new session from the menu, grab a fresh pool of words
        gameState.availableWordsPool = getFreshWordPool(selectedLevel);
        
        startGameSession(selectedLevel);
    });

    // 3. Gameplay -> Back to Level Selection
    $('#back-btn').on('click', function() {
        resetSessionState();
        showScreen('level-selection-page');
    });

    // 4. Keyboard Interaction
    $('.key').on('click', function() {
        if ($(this).prop('disabled')) return;
        handleGuess($(this).data('key').toUpperCase(), $(this));
    });

    // 5. Game Over Popups
    $('#restart-btn').on('click', function() {
        $('#result-popup').removeClass('visible');
        // Restarting continues using the SAME shrinking pool of words
        startGameSession(gameState.currentLevel); 
    });

    $('#home-btn').on('click', function() {
        $('#result-popup').removeClass('visible');
        resetSessionState();
        gameState.score = 0; 
        gameState.attemptsLeft = 5;
        updateDisplay(); 
        showScreen('landing-page');
    });

    // --- Game Logic ---

    function startGameSession(level) {
        gameState.currentLevel = level;
        gameState.attemptsLeft = MAX_ATTEMPTS;
        gameState.guessedLetters = [];
        gameState.correctGuessed = [];

        // --- NEW: Word Selection Logic with Removal ---
        let levelCategories = gameState.availableWordsPool;
        let categoryNames = Object.keys(levelCategories);

        // Safety check: If they played EVERY word, refill the pool automatically
        if (categoryNames.length === 0) {
            gameState.availableWordsPool = getFreshWordPool(level);
            levelCategories = gameState.availableWordsPool;
            categoryNames = Object.keys(levelCategories);
        }

        // 1. Pick a random category
        const randomCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
        const wordsInCategory = levelCategories[randomCategory];
        
        // 2. Pick a random word from that category
        const randomIndex = Math.floor(Math.random() * wordsInCategory.length);
        const randomWord = wordsInCategory[randomIndex];
        
        // 3. REMOVE the word from the pool so it can't be picked again
        wordsInCategory.splice(randomIndex, 1);
        
        // 4. If that was the last word in the category, remove the whole category
        if (wordsInCategory.length === 0) {
            delete levelCategories[randomCategory];
        }

        gameState.currentWordObj = {
            word: randomWord,
            category: randomCategory
        };
        // ----------------------------------------------
        
        // Reset Image using jQuery effects
        $('#game-image').css('opacity', '1').attr({
            'src': 'images/hangman_start.png',
            'alt': 'Hiding Stickman'
        });

        enableKeyboard();
        showScreen('gameplay-page');
        updateDisplay();
    }

    function handleGuess(letter, $keyElement) {
        if (gameState.guessedLetters.includes(letter) || gameState.attemptsLeft <= 0) return;

        gameState.guessedLetters.push(letter);

        if (gameState.currentWordObj.word.includes(letter)) {
            gameState.correctGuessed.push(letter);
            $keyElement.addClass('correct').prop('disabled', true);
            checkWinCondition();
        } else {
            gameState.attemptsLeft--;
            $keyElement.addClass('incorrect').prop('disabled', true);
            checkGameOverCondition();
        }

        updateDisplay();
    }

    function checkWinCondition() {
        const uniqueLettersInWord = new Set(gameState.currentWordObj.word.split(''));
        const hasWonWord = [...uniqueLettersInWord].every(letter => 
            gameState.correctGuessed.includes(letter)
        );

        if (hasWonWord) {
            gameState.score += 10;
            updateDisplay();
            setTimeout(() => startGameSession(gameState.currentLevel), 800); 
        }
    }

    function checkGameOverCondition() {
        if (gameState.attemptsLeft <= 0) {
            disableKeyboard();
            
            $('#game-image').fadeTo(500, 0, function() {
                $(this).attr('src', 'images/hangman_gameover.png').attr('alt', 'Hanged Stickman').fadeTo(500, 1);
                setTimeout(showResultPopup, 500); 
            });
        }
    }

    // --- Updates ---
    function updateDisplay() {
        $('#current-score').text(gameState.score);
        $('#attempts-left-text').text(`Attempts left: ${gameState.attemptsLeft}`);
        
        if (gameState.currentWordObj) {
            $('#word-category').text(`Category: ${gameState.currentWordObj.category}`); 
            
            let displayStr = '';
            const wordSplit = gameState.currentWordObj.word.split('');

            wordSplit.forEach(letter => {
                if (gameState.correctGuessed.includes(letter)) {
                    displayStr += `${letter} `;
                } else {
                    displayStr += '_ ';
                }
            });

            $('#word-display').text(displayStr.trim());
        } else {
            $('#word-category').text('Category'); 
            $('#word-display').text('_ _ _ _ _');
        }
    }

    // --- Helper Functions ---
    function disableKeyboard() {
        $('.key').prop('disabled', true);
    }

    function enableKeyboard() {
        $('.key').prop('disabled', false).removeClass('correct incorrect');
    }

    function resetSessionState() {
        gameState.currentWordObj = null;
        gameState.correctGuessed = [];
        enableKeyboard();
    }

    function showResultPopup() {
        $('#final-score').text(gameState.score);
        $('#result-popup').addClass('visible');
    }
});