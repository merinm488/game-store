/**
 * Chess UI System
 * Handles menus, modals, settings, and game flow
 */

const UISystem = (function() {
    // Screen elements
    const screens = {
        mainMenu: document.getElementById('mainMenu'),
        gameScreen: document.getElementById('gameScreen')
    };

    // Modal elements
    const modals = {
        pause: document.getElementById('pauseMenu'),
        gameOver: document.getElementById('gameOverScreen'),
        promotion: document.getElementById('promotionModal'),
        howToPlay: document.getElementById('howToPlayModal'),
        settings: document.getElementById('settingsModal')
    };

    // Settings controls
    const settingsControls = {
        opponent: document.getElementById('opponentSelect'),
        color: document.getElementById('colorSelect'),
        difficulty: document.getElementById('difficultySelect'),
        theme: document.getElementById('themeSelect'),
        masterSound: document.getElementById('masterSoundToggle'),
        colorGroup: document.getElementById('colorSelectGroup'),
        difficultyGroup: document.getElementById('difficultyGroup')
    };

    // Game state
    let gameState = {
        opponent: 'ai',
        playerColor: 'white',
        difficulty: 'medium',
        isAIThinking: false,
        moveCount: 0,
        captureCount: 0
    };

    /**
     * Initialize the UI system
     */
    function init() {
        // Initialize systems
        AudioSystem.init();
        Renderer.init();

        // Load saved settings
        loadSettings();

        // Set up event listeners
        setupEventListeners();

        // Play intro animation
        playIntroAnimation();
    }

    /**
     * Play intro animation sequence
     */
    function playIntroAnimation() {
        const introSplash = document.getElementById('introSplash');

        setTimeout(() => {
            introSplash.classList.add('fade-out');
        }, 1500);

        setTimeout(() => {
            introSplash.classList.add('hidden');
            screens.mainMenu.classList.add('active');
            updateMenuScores();
        }, 2300);
    }

    /**
     * Load settings from localStorage
     */
    function loadSettings() {
        try {
            const saved = localStorage.getItem('chessSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                gameState.opponent = settings.opponent || 'ai';
                gameState.playerColor = settings.playerColor || 'white';
                gameState.difficulty = settings.difficulty || 'medium';

                if (settingsControls.opponent) settingsControls.opponent.value = gameState.opponent;
                if (settingsControls.color) settingsControls.color.value = gameState.playerColor;
                if (settingsControls.difficulty) settingsControls.difficulty.value = gameState.difficulty;
                if (settingsControls.theme) settingsControls.theme.value = settings.theme || 'classic';

                // Set AI difficulty
                ChessAI.setDifficulty(gameState.difficulty);
            }

            // Load audio settings
            const audioSettings = AudioSystem.getSettings();
            if (settingsControls.masterSound) settingsControls.masterSound.checked = audioSettings.master;

            // Update visibility based on opponent
            updateColorSelectVisibility();
            updateDifficultyVisibility();
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }

    /**
     * Save settings to localStorage
     */
    function saveSettings() {
        try {
            const settings = {
                opponent: gameState.opponent,
                playerColor: gameState.playerColor,
                difficulty: gameState.difficulty,
                theme: Renderer.getTheme()
            };
            localStorage.setItem('chessSettings', JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    /**
     * Update color select visibility based on opponent type
     */
    function updateColorSelectVisibility() {
        if (settingsControls.colorGroup) {
            if (gameState.opponent === 'human') {
                settingsControls.colorGroup.style.display = 'none';
            } else {
                settingsControls.colorGroup.style.display = 'flex';
            }
        }
    }

    /**
     * Update difficulty visibility based on opponent type
     */
    function updateDifficultyVisibility() {
        if (settingsControls.difficultyGroup) {
            if (gameState.opponent === 'human') {
                settingsControls.difficultyGroup.style.display = 'none';
            } else {
                settingsControls.difficultyGroup.style.display = 'flex';
            }
        }
    }

    /**
     * Update menu score display
     */
    function updateMenuScores() {
        // If leaderboard is available, use TextDB data
        if (window.leaderboard && window.leaderboard.getCurrentPlayerName()) {
            window.leaderboard.updateMenuWins();
        } else {
            // Fallback to localStorage for guests
            const record = getWinLossRecord();
            Renderer.updateMenuScores(record);
        }
    }

    /**
     * Get win/loss record from localStorage
     */
    function getWinLossRecord() {
        try {
            const saved = localStorage.getItem('chessRecord');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            // Ignore errors
        }
        return { wins: 0, losses: 0, draws: 0 };
    }

    /**
     * Update win/loss record
     */
    function updateRecord(result) {
        const record = getWinLossRecord();

        if (result === 'win') record.wins++;
        else if (result === 'loss') record.losses++;
        else if (result === 'draw') record.draws++;

        try {
            localStorage.setItem('chessRecord', JSON.stringify(record));
        } catch (e) {
            // Ignore errors
        }

        return record;
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Main menu buttons
        document.getElementById('playBtn')?.addEventListener('click', startGame);
        document.getElementById('howToPlayBtn')?.addEventListener('click', () => showModal('howToPlay'));
        document.getElementById('settingsBtn')?.addEventListener('click', () => showModal('settings'));

        // Modal close buttons
        document.getElementById('closeHowToPlay')?.addEventListener('click', () => hideModal('howToPlay'));
        document.getElementById('closeSettings')?.addEventListener('click', saveAndCloseSettings);

        // Pause menu buttons
        document.getElementById('pauseBtn')?.addEventListener('click', togglePause);
        document.getElementById('resumeBtn')?.addEventListener('click', resumeGame);
        document.getElementById('restartBtn')?.addEventListener('click', restartGame);
        document.getElementById('quitBtn')?.addEventListener('click', quitToMenu);
        document.getElementById('quitBtnHeader')?.addEventListener('click', quitToMenu);

        // Game over buttons
        document.getElementById('playAgainBtn')?.addEventListener('click', restartGame);
        document.getElementById('menuBtn')?.addEventListener('click', quitToMenu);

        // Board click handler
        document.getElementById('chessBoard')?.addEventListener('click', handleBoardClick);

        // Settings controls
        if (settingsControls.opponent) {
            settingsControls.opponent.addEventListener('change', (e) => {
                gameState.opponent = e.target.value;
                updateColorSelectVisibility();
                updateDifficultyVisibility();
                saveSettings();
                AudioSystem.playClick();
            });
        }

        if (settingsControls.color) {
            settingsControls.color.addEventListener('change', (e) => {
                gameState.playerColor = e.target.value;
                saveSettings();
                AudioSystem.playClick();
            });
        }

        if (settingsControls.difficulty) {
            settingsControls.difficulty.addEventListener('change', (e) => {
                gameState.difficulty = e.target.value;
                ChessAI.setDifficulty(gameState.difficulty);
                saveSettings();
                AudioSystem.playClick();
            });
        }

        if (settingsControls.theme) {
            settingsControls.theme.addEventListener('change', (e) => {
                Renderer.setTheme(e.target.value);
                saveSettings();
                AudioSystem.playClick();
            });
        }

        if (settingsControls.masterSound) {
            settingsControls.masterSound.addEventListener('change', (e) => {
                AudioSystem.setMasterEnabled(e.target.checked);
                AudioSystem.playClick();
            });
        }

        // Close modals on outside click
        Object.keys(modals).forEach(key => {
            modals[key]?.addEventListener('click', (e) => {
                if (e.target === modals[key]) {
                    if (key === 'settings') {
                        saveAndCloseSettings();
                    } else if (key !== 'pause' && key !== 'gameOver' && key !== 'promotion') {
                        hideModal(key);
                    }
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeydown);
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeydown(e) {
        // Space bar to pause/resume
        if (e.key === ' ' || e.code === 'Space') {
            // Only handle space when game screen is active and no text input is focused
            if (screens.gameScreen?.classList.contains('active') &&
                document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                togglePause();
                return;
            }
        }

        if (e.key === 'Escape') {
            const openModal = getOpenModal();
            if (openModal === 'settings' || openModal === 'howToPlay') {
                if (openModal === 'settings') {
                    saveAndCloseSettings();
                } else {
                    hideModal(openModal);
                }
            } else if (screens.gameScreen?.classList.contains('active')) {
                togglePause();
            }
        }
    }

    /**
     * Get currently open modal
     */
    function getOpenModal() {
        for (const [key, modal] of Object.entries(modals)) {
            if (modal?.classList.contains('active')) {
                return key;
            }
        }
        return null;
    }

    /**
     * Show a modal
     */
    function showModal(name) {
        AudioSystem.playClick();
        modals[name]?.classList.add('active');
    }

    /**
     * Hide a modal
     */
    function hideModal(name) {
        AudioSystem.playClick();
        modals[name]?.classList.remove('active');
    }

    /**
     * Save and close settings modal
     */
    function saveAndCloseSettings() {
        saveSettings();
        hideModal('settings');
    }

    /**
     * Start a new game
     */
    function startGame() {
        // Check if leaderboard is ready, if not wait a bit and retry
        if (!window.leaderboard) {
            console.log('Leaderboard not ready yet, waiting...');
            setTimeout(() => startGame(), 100);
            return;
        }

        // Check if player name is set, show prompt if not
        if (!window.leaderboard.getCurrentPlayerName()) {
            window.leaderboard.showPlayerNamePrompt(() => {
                startGameInternal();
            });
        } else {
            startGameInternal();
        }
    }

    /**
     * Start a new game (internal)
     */
    function startGameInternal() {
        AudioSystem.playStart();
        AudioSystem.playClick();

        // Determine player color
        let color = gameState.playerColor;
        if (color === 'random') {
            color = Math.random() < 0.5 ? 'white' : 'black';
        }

        // Reset game state
        gameState.moveCount = 0;
        gameState.captureCount = 0;
        gameState.isAIThinking = false;

        // Initialize game
        Game.init(gameState.opponent, color);

        // Set game callbacks
        Game.setCallbacks({
            onMove: handleMove,
            onCapture: handleCapture,
            onCheck: handleCheck,
            onCheckmate: handleCheckmate,
            onStalemate: handleStalemate,
            onDraw: handleDraw,
            onPromotion: handlePromotion,
            onTurnChange: handleTurnChange
        });

        // Switch to game screen
        screens.mainMenu?.classList.remove('active');
        screens.gameScreen?.classList.add('active');

        // Clear captured pieces display
        Renderer.renderCapturedPieces([], []);

        // Render initial board
        Renderer.renderBoard(Game.getBoard(), Game.getState());
        Renderer.updateTurnIndicator(Game.getState().turn);

        // If AI plays first (player is black), make AI move
        if (gameState.opponent === 'ai' && color === 'black') {
            setTimeout(makeAIMove, 500);
        }
    }

    /**
     * Handle board click
     */
    function handleBoardClick(e) {
        if (gameState.isAIThinking) return;

        const state = Game.getState();
        if (state.gameOver) return;

        // For AI games, only allow clicks on player's turn
        if (gameState.opponent === 'ai' && state.turn !== gameState.playerColor) {
            return;
        }

        const square = e.target.closest('.square');
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        const result = Game.selectSquare(row, col);

        if (result.needsPromotion) {
            handlePromotion(result.move);
        } else if (result.moved) {
            gameState.moveCount++;
            AudioSystem.playMove();

            if (result.move.castling) {
                AudioSystem.playCastle();
            }

            renderGame();

            // Check for AI move
            if (gameState.opponent === 'ai' && !Game.getState().gameOver) {
                setTimeout(makeAIMove, 1000);
            }
        } else if (result.selected) {
            Renderer.renderBoard(Game.getBoard(), Game.getState());
        }
    }

    /**
     * Make AI move
     */
    function makeAIMove() {
        const state = Game.getState();
        if (state.gameOver || state.turn === gameState.playerColor) return;

        gameState.isAIThinking = true;

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            const aiMove = ChessAI.getBestMove(Game.getBoard(), state.turn, state);

            if (aiMove) {
                // Handle promotion if needed
                if (aiMove.promotion) {
                    aiMove.promotion = 'q'; // Always promote to queen for AI
                }

                Game.makeMove(aiMove);
                gameState.moveCount++;
                AudioSystem.playMove();

                if (aiMove.castling) {
                    AudioSystem.playCastle();
                }
            }

            gameState.isAIThinking = false;
            renderGame();
        }, 100);
    }

    /**
     * Render current game state
     */
    function renderGame() {
        const state = Game.getState();
        Renderer.renderBoard(Game.getBoard(), state);
        Renderer.updateTurnIndicator(state.turn, state.isCheck);
        Renderer.renderCapturedPieces(state.capturedWhite, state.capturedBlack);
    }

    /**
     * Handle move callback
     */
    function handleMove(move) {
        // Update captured pieces display
        Renderer.renderCapturedPieces(
            Game.getState().capturedWhite,
            Game.getState().capturedBlack
        );
    }

    /**
     * Handle capture callback
     */
    function handleCapture(piece) {
        gameState.captureCount++;
        AudioSystem.playCapture();
    }

    /**
     * Handle check callback
     */
    function handleCheck() {
        AudioSystem.playCheck();
        Renderer.updateTurnIndicator(Game.getState().turn, true);
    }

    /**
     * Handle checkmate callback
     */
    function handleCheckmate(winner) {
        AudioSystem.playCheckmate();

        const state = Game.getState();
        let resultText = `${winner === 'white' ? 'White' : 'Black'} wins!`;
        let recordResult;

        if (gameState.opponent === 'ai') {
            if (winner === gameState.playerColor) {
                recordResult = 'win';
                // Trigger confetti celebration when player wins
                triggerConfetti();
            } else {
                recordResult = 'loss';
            }
            // Submit result to leaderboard
            if (window.leaderboard) {
                window.leaderboard.updateRecord(recordResult);
            }
        } else {
            recordResult = 'draw'; // For human vs human, don't track
        }

        const record = updateRecord(recordResult);
        Renderer.showGameResult('Checkmate!', resultText);
        Renderer.updateGameOverStats(state.moveHistory.length, gameState.captureCount);
        showModal('gameOver');
    }

    /**
     * Handle stalemate callback
     */
    function handleStalemate() {
        AudioSystem.playDraw();

        const state = Game.getState();
        updateRecord('draw');

        // Submit draw to leaderboard (AI games only)
        if (gameState.opponent === 'ai' && window.leaderboard) {
            window.leaderboard.updateRecord('draw');
        }

        Renderer.showGameResult('Stalemate', 'The game is a draw.');
        Renderer.updateGameOverStats(state.moveHistory.length, gameState.captureCount);
        showModal('gameOver');
    }

    /**
     * Handle draw callback
     */
    function handleDraw(reason) {
        AudioSystem.playDraw();

        const state = Game.getState();
        updateRecord('draw');

        // Submit draw to leaderboard (AI games only)
        if (gameState.opponent === 'ai' && window.leaderboard) {
            window.leaderboard.updateRecord('draw');
        }

        let message = 'The game is a draw.';
        if (reason === 'fifty-move') {
            message = 'Draw by 50-move rule.';
        }

        Renderer.showGameResult('Draw', message);
        Renderer.updateGameOverStats(state.moveHistory.length, gameState.captureCount);
        showModal('gameOver');
    }

    /**
     * Handle promotion callback
     */
    function handlePromotion(move) {
        AudioSystem.playPromotion();

        const color = Game.getState().turn;

        // For AI games, if it's AI's turn, auto-promote to queen
        if (gameState.opponent === 'ai' && color !== gameState.playerColor) {
            Game.makeMove(move, 'q');
            renderGame();
            return;
        }

        // Show promotion modal for player
        Renderer.showPromotionModal(color, (pieceType) => {
            Game.makeMove(move, pieceType);
            gameState.moveCount++;
            AudioSystem.playMove();
            renderGame();

            // Check for AI move
            if (gameState.opponent === 'ai' && !Game.getState().gameOver) {
                setTimeout(makeAIMove, 1000);
            }
        });
    }

    /**
     * Handle turn change callback
     */
    function handleTurnChange(turn) {
        Renderer.updateTurnIndicator(turn, Game.getState().isCheck);
    }

    /**
     * Toggle pause
     */
    function togglePause() {
        const pauseModal = modals.pause;

        if (pauseModal?.classList.contains('active')) {
            resumeGame();
        } else {
            AudioSystem.playClick();
            showModal('pause');
        }
    }

    /**
     * Resume game
     */
    function resumeGame() {
        hideModal('pause');
        AudioSystem.playClick();
    }

    /**
     * Restart game
     */
    function restartGame() {
        hideModal('pause');
        hideModal('gameOver');
        startGame();
    }

    /**
     * Quit to main menu
     */
    function quitToMenu() {
        hideModal('pause');
        hideModal('gameOver');
        screens.gameScreen?.classList.remove('active');
        screens.mainMenu?.classList.add('active');
        updateMenuScores();
        AudioSystem.playClick();
    }

    /**
     * Trigger confetti celebration using ES6 canvas-confetti module
     */
    function triggerConfetti() {
        if (typeof window.confetti === 'function') {
            // First burst - center
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#2196F3']
            });

            // Second burst - left side
            setTimeout(() => {
                window.confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF6347']
                });
            }, 200);

            // Third burst - right side
            setTimeout(() => {
                window.confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.6 },
                    colors: ['#4CAF50', '#2196F3', '#9C27B0']
                });
            }, 400);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        init,
        startGame,
        showModal,
        hideModal
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UISystem;
}
