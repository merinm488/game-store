// ============================================
// SOKOBAN GAME ENGINE
// ============================================

class SokobanGame {
    constructor() {
        // Game state
        this.currentLevel = 1;
        this.gameState = null; // Parsed level state
        this.moves = 0;
        this.time = 0;
        this.timerInterval = null;
        this.isPaused = false;
        this.moveHistory = []; // For undo functionality

        // Settings
        this.settings = {
            theme: 'classic',
            sound: true,
            lastLevel: 1,
            completedLevels: []
        };

        // Tutorial
        this.tutorialActive = false;
        this.currentTutorialStep = 0;
        this.tutorialSteps = [];

        // DOM elements
        this.elements = {};

        // Touch state
        this.touchStartX = 0;
        this.touchStartY = 0;

        // Audio context for sounds
        this.audioContext = null;

        this.init();
    }

    init() {
        this.cacheElements();
        this.loadSettings();
        this.setupEventListeners();
        this.populateLevelSelect();
        this.applyTheme();
        this.showScreen('menu-screen');
    }

    cacheElements() {
        // Screens
        this.elements.menuScreen = document.getElementById('menu-screen');
        this.elements.howToPlayScreen = document.getElementById('how-to-play-screen');
        this.elements.settingsScreen = document.getElementById('settings-screen');
        this.elements.gameScreen = document.getElementById('game-screen');

        // Game elements
        this.elements.gameBoard = document.getElementById('game-board');
        this.elements.gameMain = document.querySelector('.game-main');
        this.elements.movesDisplay = document.getElementById('moves-display');
        this.elements.timerDisplay = document.getElementById('timer-display');
        this.elements.levelDisplay = document.getElementById('level-display');
        this.elements.bestMovesDisplay = document.getElementById('best-moves-display');
        this.elements.bestTimeDisplay = document.getElementById('best-time-display');

        // Buttons
        this.elements.btnPlay = document.getElementById('btn-play');
        this.elements.btnHowToPlay = document.getElementById('btn-how-to-play');
        this.elements.btnSettings = document.getElementById('btn-settings');
        this.elements.btnBackFromHowTo = document.getElementById('btn-back-from-how-to');
        this.elements.btnBackFromSettings = document.getElementById('btn-back-from-settings');
        this.elements.btnPause = document.getElementById('btn-pause');
        this.elements.btnUndo = document.getElementById('btn-undo');
        this.elements.btnReset = document.getElementById('btn-reset');
        this.elements.btnQuit = document.getElementById('btn-quit');
        this.elements.btnResume = document.getElementById('btn-resume');
        this.elements.btnRestart = document.getElementById('btn-restart');
        this.elements.btnQuitPause = document.getElementById('btn-quit-pause');
        this.elements.btnNextLevel = document.getElementById('btn-next-level');
        this.elements.btnPlayAgain = document.getElementById('btn-play-again');
        this.elements.btnQuitComplete = document.getElementById('btn-quit-complete');

        // Modals
        this.elements.pauseModal = document.getElementById('pause-modal');
        this.elements.levelCompleteModal = document.getElementById('level-complete-modal');
        this.elements.newBest = document.getElementById('new-best');

        // Settings
        this.elements.themeSelect = document.getElementById('theme-select');
        this.elements.levelSelect = document.getElementById('level-select');
        this.elements.soundToggle = document.getElementById('sound-toggle');

        // Level complete stats
        this.elements.completeMoves = document.getElementById('complete-moves');
        this.elements.completeTime = document.getElementById('complete-time');

        // Tutorial
        this.elements.tutorialOverlay = document.getElementById('tutorial-overlay');
        this.elements.tooltipTitle = document.getElementById('tooltip-title');
        this.elements.tooltipMessage = document.getElementById('tooltip-message');
        this.elements.tooltipStep = document.getElementById('tooltip-step');
        this.elements.tooltipTotal = document.getElementById('tooltip-total');
        this.elements.btnTooltipSkip = document.getElementById('btn-tooltip-skip');
        this.elements.btnTooltipNext = document.getElementById('btn-tooltip-next');
        this.elements.tutorialSpotlight = document.getElementById('tutorial-spotlight');
    }

    loadSettings() {
        const saved = localStorage.getItem('sokoban-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.elements.themeSelect.value = this.settings.theme;
            this.elements.soundToggle.checked = this.settings.sound;
            // Load last played level
            if (this.settings.lastLevel) {
                this.currentLevel = this.settings.lastLevel;
            }
            // Ensure completedLevels is an array
            if (!this.settings.completedLevels) {
                this.settings.completedLevels = [];
            }
        }
    }

    saveSettings() {
        this.settings.theme = this.elements.themeSelect.value;
        this.settings.sound = this.elements.soundToggle.checked;
        this.settings.lastLevel = this.currentLevel;
        localStorage.setItem('sokoban-settings', JSON.stringify(this.settings));
    }

    saveCurrentLevel() {
        this.settings.lastLevel = this.currentLevel;
        localStorage.setItem('sokoban-settings', JSON.stringify(this.settings));
    }

    populateLevelSelect() {
        this.elements.levelSelect.innerHTML = '';
        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level.id;
            const isCompleted = this.settings.completedLevels.includes(level.id);
            const checkmark = isCompleted ? '✓ ' : '';
            option.textContent = `${checkmark}Level ${level.id} - ${level.name}`;
            if (isCompleted) {
                option.style.fontWeight = 'bold';
                option.style.color = 'var(--accent)';
            }
            this.elements.levelSelect.appendChild(option);
        });
        // Set to saved level
        this.elements.levelSelect.value = this.currentLevel;
    }

    setupEventListeners() {
        // Menu buttons
        this.elements.btnPlay.addEventListener('click', () => this.startGame());
        this.elements.btnHowToPlay.addEventListener('click', () => this.showScreen('how-to-play-screen'));
        this.elements.btnSettings.addEventListener('click', () => {
            this.populateLevelSelect(); // Refresh to show completed levels
            this.showScreen('settings-screen');
        });
        this.elements.btnBackFromHowTo.addEventListener('click', () => this.showScreen('menu-screen'));
        this.elements.btnBackFromSettings.addEventListener('click', () => {
            this.saveSettings();
            this.applyTheme();
            this.showScreen('menu-screen');
        });

        // Theme change
        this.elements.themeSelect.addEventListener('change', () => {
            this.saveSettings();
            this.applyTheme();
        });

        // Sound toggle
        this.elements.soundToggle.addEventListener('change', () => {
            this.saveSettings();
        });

        // Level select change
        this.elements.levelSelect.addEventListener('change', () => {
            this.currentLevel = parseInt(this.elements.levelSelect.value);
        });

        // Tutorial controls
        this.elements.btnTooltipNext.addEventListener('click', () => this.nextTutorialStep());
        this.elements.btnTooltipSkip.addEventListener('click', () => this.endTutorial());

        // Game controls
        this.elements.btnPause.addEventListener('click', () => this.pauseGame());
        this.elements.btnUndo.addEventListener('click', () => this.undo());
        this.elements.btnReset.addEventListener('click', () => this.resetLevel());
        this.elements.btnQuit.addEventListener('click', () => this.quitToMenu());

        // Pause modal
        this.elements.btnResume.addEventListener('click', () => this.resumeGame());
        this.elements.btnRestart.addEventListener('click', () => {
            this.hideModal(this.elements.pauseModal);
            this.resetLevel();
        });
        this.elements.btnQuitPause.addEventListener('click', () => {
            this.hideModal(this.elements.pauseModal);
            this.quitToMenu();
        });

        // Level complete modal
        this.elements.btnNextLevel.addEventListener('click', () => this.nextLevel());
        this.elements.btnPlayAgain.addEventListener('click', () => {
            this.hideModal(this.elements.levelCompleteModal);
            this.resetLevel();
        });
        this.elements.btnQuitComplete.addEventListener('click', () => {
            this.hideModal(this.elements.levelCompleteModal);
            this.quitToMenu();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Touch controls - work on entire game area between header and footer
        this.elements.gameMain.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.elements.gameMain.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }

    hideModal(modal) {
        modal.classList.add('hidden');
    }

    showModal(modal) {
        modal.classList.remove('hidden');
    }

    startGame() {
        this.currentLevel = parseInt(this.elements.levelSelect.value);
        this.saveCurrentLevel();
        this.loadLevel(this.currentLevel);
        this.showScreen('game-screen');
        this.startTimer();

        // Check if first-time user and show tutorial
        if (this.checkFirstTimeUser()) {
            // Small delay to ensure game screen is fully rendered
            setTimeout(() => {
                this.startTutorial();
            }, 500);
        }
    }

    loadLevel(levelId) {
        const level = levels.find(l => l.id === levelId);
        if (!level) return;

        this.currentLevel = levelId;
        this.gameState = parseLevel(level);
        this.moves = 0;
        this.time = 0;
        this.moveHistory = [];
        this.isPaused = false;

        this.renderBoard();
        this.updateStats();
        this.updateBestStats();
    }

    renderBoard() {
        const board = this.elements.gameBoard;
        board.innerHTML = '';

        // Set grid dimensions and CSS variable for responsive cell sizing
        board.style.gridTemplateColumns = `repeat(${this.gameState.width}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${this.gameState.height}, 1fr)`;
        board.style.setProperty('--grid-columns', this.gameState.width);

        // Create cells
        for (let y = 0; y < this.gameState.height; y++) {
            for (let x = 0; x < this.gameState.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Add classes based on what's in the cell
                if (this.isWall(x, y)) {
                    cell.classList.add('wall');
                } else {
                    if (this.isTarget(x, y)) {
                        cell.classList.add('target');
                    }
                    if (this.isBox(x, y)) {
                        if (this.isTarget(x, y)) {
                            cell.classList.add('box-on-target');
                        } else {
                            cell.classList.add('box');
                        }
                    }
                    if (this.isPlayer(x, y)) {
                        if (this.isTarget(x, y)) {
                            cell.classList.add('player-on-target');
                        } else {
                            cell.classList.add('player');
                        }
                    }
                }

                board.appendChild(cell);
            }
        }
    }

    isWall(x, y) {
        return this.gameState.walls.some(w => w.x === x && w.y === y);
    }

    isTarget(x, y) {
        return this.gameState.targets.some(t => t.x === x && t.y === y);
    }

    isBox(x, y) {
        return this.gameState.boxes.some(b => b.x === x && b.y === y);
    }

    isPlayer(x, y) {
        return this.gameState.player.x === x && this.gameState.player.y === y;
    }

    handleKeyDown(e) {
        // Only handle game controls when game screen is active
        if (!this.elements.gameScreen.classList.contains('active')) return;

        let dx = 0, dy = 0;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.isPaused) return;
                dy = -1;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.isPaused) return;
                dy = 1;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.isPaused) return;
                dx = -1;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.isPaused) return;
                dx = 1;
                break;
            case 'z':
            case 'Z':
                if (this.isPaused) return;
                this.undo();
                return;
            case ' ':
            case 'p':
            case 'P':
            case 'Escape':
                e.preventDefault();
                if (this.isPaused) {
                    this.resumeGame();
                } else {
                    this.pauseGame();
                }
                return;
            case 'r':
            case 'R':
                if (this.isPaused) return;
                this.resetLevel();
                return;
            default:
                return;
        }

        if (dx !== 0 || dy !== 0) {
            e.preventDefault();
            this.move(dx, dy);
        }
    }

    handleTouchStart(e) {
        if (this.isPaused) return;
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    handleTouchEnd(e) {
        if (this.isPaused) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStartX;
        const dy = touch.clientY - this.touchStartY;

        const minSwipeDistance = 30;

        if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
            return; // Not a swipe
        }

        // Determine primary direction and make move
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal
            this.move(dx > 0 ? 1 : -1, 0);
        } else {
            // Vertical
            this.move(0, dy > 0 ? 1 : -1);
        }

        // Prevent default scrolling when a game move is made
        e.preventDefault();
    }

    move(dx, dy) {
        const newX = this.gameState.player.x + dx;
        const newY = this.gameState.player.y + dy;

        // Check if move is valid
        if (this.isWall(newX, newY)) {
            return; // Can't move into wall
        }

        if (this.isBox(newX, newY)) {
            // Try to push box
            const boxNewX = newX + dx;
            const boxNewY = newY + dy;

            // Check if box can be pushed
            if (this.isWall(boxNewX, boxNewY) || this.isBox(boxNewX, boxNewY)) {
                return; // Can't push box into wall or another box
            }

            // Save state for undo
            this.saveStateForUndo();

            // Move box
            const box = this.gameState.boxes.find(b => b.x === newX && b.y === newY);
            box.x = boxNewX;
            box.y = boxNewY;
            box.onTarget = this.isTarget(boxNewX, boxNewY);

            this.playSound('push');
        } else {
            // Save state for undo
            this.saveStateForUndo();
            this.playSound('move');
        }

        // Move player
        this.gameState.player.x = newX;
        this.gameState.player.y = newY;
        this.moves++;

        this.updateCellVisuals(newX - dx, newY - dy); // Old position
        this.updateCellVisuals(newX, newY); // New position
        if (this.isBox(newX + dx, newY + dy)) {
            this.updateCellVisuals(newX + dx, newY + dy); // Box new position
        }

        this.updateStats();

        // Check for win
        if (this.checkWin()) {
            this.levelComplete();
        }
    }

    saveStateForUndo() {
        // Deep copy relevant state
        const state = {
            player: { ...this.gameState.player },
            boxes: this.gameState.boxes.map(b => ({ ...b })),
            moves: this.moves
        };
        this.moveHistory.push(state);
    }

    undo() {
        if (this.moveHistory.length === 0) return;

        const prevState = this.moveHistory.pop();

        // Restore state
        this.gameState.player = prevState.player;
        this.gameState.boxes = prevState.boxes;
        this.moves = prevState.moves;

        // Re-render board
        this.renderBoard();
        this.updateStats();
        this.playSound('move');
    }

    updateCellVisuals(x, y) {
        const cell = this.elements.gameBoard.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (!cell) return;

        // Remove all dynamic classes
        cell.classList.remove('player', 'player-on-target', 'box', 'box-on-target');

        // Add appropriate classes
        if (this.isPlayer(x, y)) {
            if (this.isTarget(x, y)) {
                cell.classList.add('player-on-target');
            } else {
                cell.classList.add('player');
            }
        } else if (this.isBox(x, y)) {
            if (this.isTarget(x, y)) {
                cell.classList.add('box-on-target');
            } else {
                cell.classList.add('box');
            }
        }
    }

    checkWin() {
        return this.gameState.boxes.every(box => box.onTarget);
    }

    levelComplete() {
        this.stopTimer();

        // Mark level as completed
        if (!this.settings.completedLevels.includes(this.currentLevel)) {
            this.settings.completedLevels.push(this.currentLevel);
            this.saveSettings();
        }

        // Check for new best scores
        const { newBestMoves, newBestTime } = saveBestScore(
            this.currentLevel,
            this.moves,
            this.time
        );

        // Update level complete modal
        this.elements.completeMoves.textContent = this.moves;
        this.elements.completeTime.textContent = formatTime(this.time);

        // Show new best messages
        this.elements.newBest.classList.add('hidden');
        const bestMovesEl = this.elements.newBest.querySelector('.best-moves');
        const bestTimeEl = this.elements.newBest.querySelector('.best-time');

        bestMovesEl.style.display = newBestMoves ? 'block' : 'none';
        bestTimeEl.style.display = newBestTime ? 'block' : 'none';

        if (newBestMoves || newBestTime) {
            this.elements.newBest.classList.remove('hidden');
        }

        this.playSound('win');

        // Trigger celebration effects
        this.triggerCelebration();

        // Delay showing the modal by 1 second
        setTimeout(() => {
            this.showModal(this.elements.levelCompleteModal);
        }, 1000);
    }

    nextLevel() {
        this.hideModal(this.elements.levelCompleteModal);

        if (this.currentLevel < levels.length) {
            this.currentLevel++;
            this.elements.levelSelect.value = this.currentLevel;
            this.saveCurrentLevel();
            this.loadLevel(this.currentLevel);
            this.startTimer();
        } else {
            // All levels complete - go to menu
            this.quitToMenu();
        }
    }

    resetLevel() {
        this.stopTimer();
        this.loadLevel(this.currentLevel);
        this.startTimer();
    }

    quitToMenu() {
        this.stopTimer();
        this.showScreen('menu-screen');
    }

    pauseGame() {
        if (this.isPaused) return;
        this.isPaused = true;
        this.stopTimer();
        this.showModal(this.elements.pauseModal);
    }

    resumeGame() {
        this.hideModal(this.elements.pauseModal);
        this.isPaused = false;
        this.startTimer();
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.time++;
            this.elements.timerDisplay.textContent = formatTime(this.time);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStats() {
        this.elements.movesDisplay.textContent = this.moves;
        this.elements.timerDisplay.textContent = formatTime(this.time);
        this.elements.levelDisplay.textContent = this.currentLevel;

        // Update undo button state
        this.elements.btnUndo.disabled = this.moveHistory.length === 0;
    }

    updateBestStats() {
        const bestScore = getBestScore(this.currentLevel);

        this.elements.bestMovesDisplay.textContent =
            bestScore.bestMoves !== null ? bestScore.bestMoves : '-';

        this.elements.bestTimeDisplay.textContent =
            bestScore.bestTime !== null ? formatTime(bestScore.bestTime) : '-';
    }

    playSound(type) {
        if (!this.settings.sound) return;

        // Create audio context on first interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Sound presets
        const sounds = {
            move: { freq: 300, duration: 0.05, type: 'sine' },
            push: { freq: 200, duration: 0.1, type: 'square' },
            win: { freq: 523, duration: 0.3, type: 'sine' }
        };

        const sound = sounds[type] || sounds.move;
        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + sound.duration
        );

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + sound.duration);
    }

    triggerCelebration() {
        // Add celebrating class to game board for glow effect
        this.elements.gameBoard.classList.add('celebrating');

        // Add celebrating class to all boxes on targets
        const boxesOnTarget = this.elements.gameBoard.querySelectorAll('.cell.box-on-target');
        boxesOnTarget.forEach(cell => {
            cell.classList.add('celebrating');
        });

        // Add celebrating class to targets for sparkle effect
        const targets = this.elements.gameBoard.querySelectorAll('.cell.target');
        targets.forEach(cell => {
            cell.classList.add('celebrating');
        });

        // Add celebrating class to player
        const player = this.elements.gameBoard.querySelector('.cell.player, .cell.player-on-target');
        if (player) {
            player.classList.add('celebrating');
        }

        // Create confetti particles
        this.createConfetti();

        // Remove celebration classes after animations complete
        setTimeout(() => {
            this.elements.gameBoard.classList.remove('celebrating');
            boxesOnTarget.forEach(cell => {
                cell.classList.remove('celebrating');
            });
            targets.forEach(cell => {
                cell.classList.remove('celebrating');
            });
            if (player) {
                player.classList.remove('celebrating');
            }
        }, 2000);
    }

    createConfetti() {
        const board = this.elements.gameBoard;
        const colors = ['#ff9800', '#4caf50', '#2196f3', '#ffeb3b', '#ff5722', '#9c27b0'];

        // Create a confetti container that covers the board
        const container = document.createElement('div');
        container.className = 'confetti-container';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.overflow = 'hidden';
        container.style.zIndex = '10';
        board.appendChild(container);

        // Create 50 confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;

            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            piece.style.width = `${Math.random() * 8 + 6}px`;
            piece.style.height = `${Math.random() * 8 + 6}px`;

            confetti.appendChild(piece);
            container.appendChild(confetti);
        }

        // Remove confetti container after animation
        setTimeout(() => {
            container.remove();
        }, 2500);
    }

    // ============================================
    // TUTORIAL SYSTEM
    // ============================================

    initTutorial() {
        // Define tutorial steps
        this.tutorialSteps = [
            {
                title: "Welcome to Sokoban! 🎮",
                message: "Push all boxes onto the target locations to complete each level. Let's take a quick tour of the game!",
                target: null,
                position: 'center'
            },
            {
                title: "Game Board",
                message: "This is where the action happens! You'll move the blue player to push orange boxes onto green targets.",
                target: () => this.elements.gameBoard,
                position: 'center'
            },
            {
                title: "Your Stats",
                message: "Track your moves and time at the top. Try to complete levels in fewer moves for a better score!",
                target: () => document.querySelector('.game-header'),
                position: 'top'
            },
            {
                title: "Controls",
                message: "On desktop: Use Arrow Keys or WASD to move. Press Z to undo moves. On mobile: Swipe in the direction you want to move.",
                target: () => this.elements.gameBoard,
                position: 'top'
            },
            {
                title: "Ready to Play! 🎯",
                message: "Press the Undo button if you make a mistake, or Reset to restart the level. Good luck and have fun!",
                target: () => this.elements.btnUndo,
                highlightMultiple: ['btnUndo', 'btnReset'],
                position: 'bottom'
            }
        ];

        this.elements.tooltipTotal.textContent = this.tutorialSteps.length;
    }

    checkFirstTimeUser() {
        const hasSeenTutorial = localStorage.getItem('sokoban-tutorial-completed');
        return !hasSeenTutorial;
    }

    startTutorial() {
        this.initTutorial();
        this.tutorialActive = true;
        this.currentTutorialStep = 0;

        // Pause the timer while tutorial is active
        if (!this.isPaused) {
            this.stopTimer();
        }

        this.showTutorialStep(0);
    }

    showTutorialStep(stepIndex) {
        if (stepIndex >= this.tutorialSteps.length) {
            this.endTutorial();
            return;
        }

        const step = this.tutorialSteps[stepIndex];
        this.currentTutorialStep = stepIndex;

        // Remove any existing highlight
        this.clearTutorialHighlight();

        // Update content
        this.elements.tooltipTitle.textContent = step.title;
        this.elements.tooltipMessage.textContent = step.message;
        this.elements.tooltipStep.textContent = stepIndex + 1;

        // Update button text
        this.elements.btnTooltipNext.textContent =
            stepIndex === this.tutorialSteps.length - 1 ? 'Got it!' : 'Next';

        // Clear all position classes
        this.elements.tutorialOverlay.classList.remove('positioned', 'position-bottom', 'position-center', 'position-top');

        // Show overlay
        this.elements.tutorialOverlay.classList.remove('hidden');

        // Handle highlighting and positioning
        if (step.target) {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                const targetElement = step.target();
                if (targetElement) {
                    // Check if we need to highlight multiple elements
                    if (step.highlightMultiple) {
                        // For multiple elements, create a bounding box around all of them
                        const elements = step.highlightMultiple.map(key => this.elements[key]);
                        const rects = elements.map(el => el.getBoundingClientRect());

                        // Calculate bounding box
                        const minX = Math.min(...rects.map(r => r.left));
                        const minY = Math.min(...rects.map(r => r.top));
                        const maxX = Math.max(...rects.map(r => r.right));
                        const maxY = Math.max(...rects.map(r => r.bottom));

                        // Add some padding
                        const padding = 8;
                        this.elements.tutorialSpotlight.style.width = (maxX - minX + padding * 2) + 'px';
                        this.elements.tutorialSpotlight.style.height = (maxY - minY + padding * 2) + 'px';
                        this.elements.tutorialSpotlight.style.top = (minY - padding) + 'px';
                        this.elements.tutorialSpotlight.style.left = (minX - padding) + 'px';
                    } else {
                        // Single element highlight
                        const rect = targetElement.getBoundingClientRect();
                        this.elements.tutorialSpotlight.style.width = rect.width + 'px';
                        this.elements.tutorialSpotlight.style.height = rect.height + 'px';
                        this.elements.tutorialSpotlight.style.top = rect.top + 'px';
                        this.elements.tutorialSpotlight.style.left = rect.left + 'px';
                    }

                    this.elements.tutorialSpotlight.classList.add('active');

                    // Hide the overlay's dark background so spotlight effect is visible
                    this.elements.tutorialOverlay.classList.add('positioned');

                    // For step 2 and 4 (game board), move tooltip to top so it doesn't cover the board
                    if (stepIndex === 1 || stepIndex === 3) {
                        this.elements.tutorialOverlay.classList.remove('position-center');
                        this.elements.tutorialOverlay.classList.add('position-top');
                    } else {
                        this.elements.tutorialOverlay.classList.add('position-center');
                    }
                }
            }, 50);
        } else {
            // No target - center position (default flex behavior)
            this.elements.tutorialOverlay.classList.add('position-center');
        }
    }

    clearTutorialHighlight() {
        // Hide spotlight
        this.elements.tutorialSpotlight.classList.remove('active');
    }

    nextTutorialStep() {
        this.showTutorialStep(this.currentTutorialStep + 1);
    }

    endTutorial() {
        this.tutorialActive = false;
        this.clearTutorialHighlight();
        this.elements.tutorialOverlay.classList.add('hidden');

        // Mark tutorial as completed
        localStorage.setItem('sokoban-tutorial-completed', 'true');

        // Resume the timer if game is not paused
        if (!this.isPaused) {
            this.startTimer();
        }
    }
}

// Initialize game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SokobanGame();
});
