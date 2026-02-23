/**
 * Tetris UI Controller
 * Screen management, event handling, and user interactions
 */

const UI = (function() {
    // DOM Elements
    let screens = {};
    let modals = {};
    let buttons = {};
    let displays = {};

    // Touch handling
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTapTime = 0;

    // Game loop
    let animationFrameId = null;
    let isRunning = false;

    // Theme
    let currentTheme = 'dark';

    /**
     * Initialize UI
     */
    function init() {
        cacheElements();
        setupEventListeners();
        loadSettings();
        updateBestScoreDisplay();

        // Set up game callbacks
        setupGameCallbacks();
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        // Screens
        screens = {
            mainMenu: document.getElementById('mainMenu'),
            gameScreen: document.getElementById('gameScreen')
        };

        // Modals
        modals = {
            pause: document.getElementById('pauseMenu'),
            gameOver: document.getElementById('gameOverScreen'),
            howToPlay: document.getElementById('howToPlayModal'),
            settings: document.getElementById('settingsModal')
        };

        // Buttons
        buttons = {
            play: document.getElementById('playBtn'),
            settings: document.getElementById('settingsBtn'),
            howToPlay: document.getElementById('howToPlayBtn'),
            pause: document.getElementById('pauseBtn'),
            resume: document.getElementById('resumeBtn'),
            restart: document.getElementById('restartBtn'),
            quit: document.getElementById('quitBtn'),
            playAgain: document.getElementById('playAgainBtn'),
            menu: document.getElementById('menuBtn'),
            closeHowToPlay: document.getElementById('closeHowToPlay'),
            closeSettings: document.getElementById('closeSettings')
        };

        // Displays
        displays = {
            bestScore: document.getElementById('bestScoreMenu'),
            currentScore: document.getElementById('currentScore'),
            currentLevel: document.getElementById('currentLevel'),
            currentLines: document.getElementById('currentLines'),
            finalScore: document.getElementById('finalScore'),
            finalLevel: document.getElementById('finalLevel'),
            finalLines: document.getElementById('finalLines'),
            newBest: document.getElementById('newBestRecord')
        };

        // Settings
        buttons.themeSelect = document.getElementById('themeSelect');
        buttons.difficultySelect = document.getElementById('difficultySelect');
        buttons.soundToggle = document.getElementById('soundToggle');
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Menu buttons
        buttons.play.addEventListener('click', startGame);
        buttons.settings.addEventListener('click', showSettings);
        buttons.howToPlay.addEventListener('click', showHowToPlay);

        // Pause menu
        buttons.pause.addEventListener('click', togglePause);
        buttons.resume.addEventListener('click', resumeGame);
        buttons.restart.addEventListener('click', restartGame);
        buttons.quit.addEventListener('click', quitToMenu);

        // Game over
        buttons.playAgain.addEventListener('click', restartGame);
        buttons.menu.addEventListener('click', quitToMenu);

        // Modal close buttons
        buttons.closeHowToPlay.addEventListener('click', hideHowToPlay);
        buttons.closeSettings.addEventListener('click', hideSettings);

        // Settings changes
        buttons.themeSelect.addEventListener('change', changeTheme);
        buttons.difficultySelect.addEventListener('change', changeDifficulty);
        buttons.soundToggle.addEventListener('change', toggleSound);

        // Hold queue click
        const holdQueue = document.getElementById('holdQueue');
        if (holdQueue) {
            holdQueue.addEventListener('click', handleHoldClick);
        }

        // Keyboard controls
        document.addEventListener('keydown', handleKeyDown);

        // Touch controls
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
            gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
            gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });
        }
    }

    /**
     * Set up game callbacks
     */
    function setupGameCallbacks() {
        Game.setOnScoreUpdate((score) => {
            displays.currentScore.textContent = score.toLocaleString();
        });

        Game.setOnLevelUpdate((level) => {
            displays.currentLevel.textContent = level;
        });

        Game.setOnLinesUpdate((lines) => {
            displays.currentLines.textContent = lines;
        });

        Game.setOnGameOver((score, level, lines) => {
            showGameOver(score, level, lines);
        });

        Game.setOnLineClear((count) => {
            Audio.playLineClear(count);
        });

        Game.setOnPieceLock(() => {
            Audio.playDrop();
        });
    }

    /**
     * Load saved settings
     */
    function loadSettings() {
        // Load theme
        const savedTheme = localStorage.getItem('tetris_theme') || 'dark';
        currentTheme = savedTheme;
        buttons.themeSelect.value = savedTheme;
        applyTheme(savedTheme);

        // Load difficulty
        const savedDifficulty = Game.getDifficulty();
        buttons.difficultySelect.value = savedDifficulty;

        // Load sound setting
        const soundEnabled = Game.getSoundEnabled();
        buttons.soundToggle.checked = soundEnabled;
    }

    /**
     * Start game
     */
    function startGame() {
        Audio.playStart();
        hideAllModals();
        showScreen('gameScreen');
        Game.startGame();
        startGameLoop();
    }

    /**
     * Toggle pause
     */
    function togglePause() {
        const state = Game.getGameState();

        if (state === Game.STATE.PLAYING) {
            Game.pause();
            showModal('pause');
            stopGameLoop();
        } else if (state === Game.STATE.PAUSED) {
            resumeGame();
        }
    }

    /**
     * Resume game
     */
    function resumeGame() {
        hideModal('pause');
        Game.resume();
        startGameLoop();
    }

    /**
     * Restart game
     */
    function restartGame() {
        hideAllModals();
        showScreen('gameScreen');
        Game.startGame();
        startGameLoop();
    }

    /**
     * Quit to menu
     */
    function quitToMenu() {
        stopGameLoop();
        hideAllModals();
        showScreen('mainMenu');
        Game.quit();
        updateBestScoreDisplay();
    }

    /**
     * Show game over screen
     */
    function showGameOver(score, level, lines) {
        stopGameLoop();

        displays.finalScore.textContent = score.toLocaleString();
        displays.finalLevel.textContent = level;
        displays.finalLines.textContent = lines;

        // Check for new best score
        const bestScore = Game.getBestScore();
        if (score >= bestScore && score > 0) {
            displays.newBest.classList.add('show');
        } else {
            displays.newBest.classList.remove('show');
        }

        showModal('gameOver');
        Audio.playGameOver();
    }

    /**
     * Show settings modal
     */
    function showSettings() {
        showModal('settings');
    }

    /**
     * Hide settings modal
     */
    function hideSettings() {
        hideModal('settings');
    }

    /**
     * Show how to play modal
     */
    function showHowToPlay() {
        showModal('howToPlay');
    }

    /**
     * Hide how to play modal
     */
    function hideHowToPlay() {
        hideModal('howToPlay');
    }

    /**
     * Change theme
     */
    function changeTheme(e) {
        const theme = e.target.value;
        applyTheme(theme);
        localStorage.setItem('tetris_theme', theme);
        currentTheme = theme;
    }

    /**
     * Apply theme to body
     */
    function applyTheme(theme) {
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
    }

    /**
     * Change difficulty
     */
    function changeDifficulty(e) {
        Game.setDifficulty(e.target.value);
    }

    /**
     * Toggle sound
     */
    function toggleSound(e) {
        Game.setSoundEnabled(e.target.checked);
        if (e.target.checked) {
            Audio.init();
        }
    }

    /**
     * Handle hold click
     */
    function handleHoldClick() {
        if (Game.getGameState() === Game.STATE.PLAYING) {
            if (Game.hold()) {
                Audio.playMove();
            }
        }
    }

    /**
     * Handle keyboard input
     */
    function handleKeyDown(e) {
        const state = Game.getGameState();

        // Pause/Resume with Space
        if (e.code === 'Space') {
            e.preventDefault();
            if (state === Game.STATE.PLAYING) {
                togglePause();
            } else if (state === Game.STATE.PAUSED) {
                resumeGame();
            }
            return;
        }

        // Only process game controls when playing
        if (state !== Game.STATE.PLAYING) return;

        switch (e.code) {
            case 'ArrowLeft':
                e.preventDefault();
                if (Game.moveLeft()) Audio.playMove();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (Game.moveRight()) Audio.playMove();
                break;
            case 'ArrowDown':
                e.preventDefault();
                Game.softDrop();
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (Game.rotate(true)) Audio.playRotate();
                break;
            case 'Enter':
                e.preventDefault();
                Game.hardDrop();
                Audio.playDrop();
                break;
            case 'KeyC':
            case 'ShiftLeft':
            case 'ShiftRight':
                e.preventDefault();
                if (Game.hold()) Audio.playMove();
                break;
            case 'Escape':
                e.preventDefault();
                togglePause();
                break;
        }
    }

    /**
     * Handle touch start
     */
    function handleTouchStart(e) {
        if (Game.getGameState() !== Game.STATE.PLAYING) return;

        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();

        e.preventDefault();
    }

    /**
     * Handle touch move
     */
    function handleTouchMove(e) {
        if (Game.getGameState() !== Game.STATE.PLAYING) return;

        e.preventDefault();
    }

    /**
     * Handle touch end
     */
    function handleTouchEnd(e) {
        if (Game.getGameState() !== Game.STATE.PLAYING) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;

        const minSwipeDistance = 30;
        const maxTapTime = 200;

        // Detect gesture type
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < maxTapTime) {
            // Tap - check for double tap
            const now = Date.now();
            if (now - lastTapTime < 300) {
                // Double tap - hard drop
                Game.hardDrop();
                Audio.playDrop();
            } else {
                // Single tap - rotate
                if (Game.rotate(true)) Audio.playRotate();
            }
            lastTapTime = now;
        } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > minSwipeDistance) {
                if (Game.moveRight()) Audio.playMove();
            } else if (deltaX < -minSwipeDistance) {
                if (Game.moveLeft()) Audio.playMove();
            }
        } else {
            // Vertical swipe
            if (deltaY > minSwipeDistance) {
                Game.hardDrop();
                Audio.playDrop();
            }
        }

        e.preventDefault();
    }

    /**
     * Update best score display
     */
    function updateBestScoreDisplay() {
        const bestScore = Game.getBestScore();
        displays.bestScore.textContent = bestScore.toLocaleString();
    }

    /**
     * Show screen
     */
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });

        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        }
    }

    /**
     * Show modal
     */
    function showModal(modalName) {
        if (modals[modalName]) {
            modals[modalName].classList.add('active');
        }
    }

    /**
     * Hide modal
     */
    function hideModal(modalName) {
        if (modals[modalName]) {
            modals[modalName].classList.remove('active');
        }
    }

    /**
     * Hide all modals
     */
    function hideAllModals() {
        Object.values(modals).forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /**
     * Start game loop
     */
    function startGameLoop() {
        if (isRunning) return;
        isRunning = true;
        gameLoop();
    }

    /**
     * Stop game loop
     */
    function stopGameLoop() {
        isRunning = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    /**
     * Main game loop
     */
    function gameLoop(timestamp) {
        if (!isRunning) return;

        Game.update(timestamp);
        Renderer.render();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        init,
        startGame,
        togglePause,
        resumeGame,
        restartGame,
        quitToMenu
    };
})();
