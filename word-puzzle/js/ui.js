/**
 * Word Puzzle - UI Management
 */

const WordUI = {
    // DOM Elements
    elements: {},

    /**
     * Initialize UI
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSettings();
        this.updateBestScores();
    },

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            // Screens
            mainMenu: document.getElementById('mainMenu'),
            gameScreen: document.getElementById('gameScreen'),

            // Modals
            settingsModal: document.getElementById('settingsModal'),
            howToPlayModal: document.getElementById('howToPlayModal'),
            gameOverModal: document.getElementById('gameOverModal'),

            // Menu elements
            playBtn: document.getElementById('playBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            howToPlayBtn: document.getElementById('howToPlayBtn'),
            bestScoreMenu: document.getElementById('bestScoreMenu'),
            bestLevelMenu: document.getElementById('bestLevelMenu'),

            // Game elements
            currentScore: document.getElementById('currentScore'),
            currentLevel: document.getElementById('currentLevel'),
            wordsFound: document.getElementById('wordsFound'),
            currentWordDisplay: document.getElementById('currentWordDisplay'),
            letterTiles: document.getElementById('letterTiles'),
            foundWordsList: document.getElementById('foundWordsList'),
            endGameBtn: document.getElementById('endGameBtn'),

            // Game action buttons
            shuffleBtn: document.getElementById('shuffleBtn'),
            clearBtn: document.getElementById('clearBtn'),
            submitBtn: document.getElementById('submitBtn'),

            // Settings elements
            themeSelect: document.getElementById('themeSelect'),
            levelSelect: document.getElementById('levelSelect'),
            soundToggle: document.getElementById('soundToggle'),
            closeSettings: document.getElementById('closeSettings'),

            // How to Play
            closeHowToPlay: document.getElementById('closeHowToPlay'),

            // Game Over elements
            gameOverTitle: document.getElementById('gameOverTitle'),
            finalScore: document.getElementById('finalScore'),
            finalLevel: document.getElementById('finalLevel'),
            finalWords: document.getElementById('finalWords'),
            newBestRecord: document.getElementById('newBestRecord'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            nextLevelBtn: document.getElementById('nextLevelBtn'),
            menuBtn: document.getElementById('menuBtn'),
            allWordsList: document.getElementById('allWordsList'),

            // Toast
            messageToast: document.getElementById('messageToast')
        };
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Menu buttons
        this.elements.playBtn.addEventListener('click', () => this.startGame());
        this.elements.settingsBtn.addEventListener('click', () => this.showModal('settingsModal'));
        this.elements.howToPlayBtn.addEventListener('click', () => this.showModal('howToPlayModal'));

        // Game buttons
        this.elements.shuffleBtn.addEventListener('click', () => this.shuffleLetters());
        this.elements.clearBtn.addEventListener('click', () => this.clearSelection());
        this.elements.submitBtn.addEventListener('click', () => this.submitWord());
        this.elements.endGameBtn.addEventListener('click', () => this.confirmEndGame());

        // Settings
        this.elements.themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        this.elements.soundToggle.addEventListener('change', (e) => this.toggleSound(e.target.checked));
        this.elements.closeSettings.addEventListener('click', () => this.hideModal('settingsModal'));

        // How to Play
        this.elements.closeHowToPlay.addEventListener('click', () => this.hideModal('howToPlayModal'));

        // Game Over
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.elements.nextLevelBtn.addEventListener('click', () => this.nextLevel());
        this.elements.menuBtn.addEventListener('click', () => this.returnToMenu());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideModal(overlay.id);
                }
            });
        });
    },

    /**
     * Load saved settings
     */
    loadSettings() {
        const theme = localStorage.getItem('wordPuzzleTheme') || 'dark';
        const soundEnabled = localStorage.getItem('wordPuzzleSound') !== 'false';
        const startLevel = localStorage.getItem('wordPuzzleStartLevel') || '1';

        this.elements.themeSelect.value = theme;
        this.elements.soundToggle.checked = soundEnabled;
        this.elements.levelSelect.value = startLevel;

        this.changeTheme(theme);
        WordGame.setSound(soundEnabled);
    },

    /**
     * Update best scores display
     */
    updateBestScores() {
        // Leaderboard module handles updating from TextDB
        if (window.leaderboard && window.leaderboard.updateMenuBestScore) {
            window.leaderboard.updateMenuBestScore();
        }
        // Also update local best scores as fallback
        const scores = WordGame.getBestScores();
        if (!window.leaderboard?.getOverallBestScore()) {
            this.elements.bestScoreMenu.textContent = scores.bestScore;
        }
        if (!window.leaderboard?.getOverallBestLevel()) {
            this.elements.bestLevelMenu.textContent = scores.bestLevel;
        }
    },

    /**
     * Show a screen
     * @param {string} screenId
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    },

    /**
     * Show a modal
     * @param {string} modalId
     */
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    },

    /**
     * Hide a modal
     * @param {string} modalId
     */
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },

    /**
     * Start a new game
     */
    startGame() {
        // Check if leaderboard is ready and prompt for player name if needed
        if (window.leaderboard && !window.leaderboard.getCurrentPlayerName()) {
            window.leaderboard.showPlayerNamePrompt(() => {
                this.proceedWithGameStart();
            });
            return;
        }
        this.proceedWithGameStart();
    },

    /**
     * Actually start the game (after player name check)
     */
    proceedWithGameStart() {
        const level = parseInt(this.elements.levelSelect.value);
        WordGame.init(level);
        this.showScreen('gameScreen');
        this.renderLetterTiles();
        this.updateGameUI();
        this.updateCurrentWord();
    },

    /**
     * Render letter tiles
     */
    renderLetterTiles() {
        this.elements.letterTiles.innerHTML = '';

        WordGame.state.letters.forEach((letter, index) => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = letter.toUpperCase();
            tile.dataset.index = index;
            tile.addEventListener('click', () => this.handleTileClick(index));
            this.elements.letterTiles.appendChild(tile);
        });
    },

    /**
     * Handle letter tile click
     * @param {number} index
     */
    handleTileClick(index) {
        const tile = this.elements.letterTiles.children[index];

        if (tile.classList.contains('used')) {
            return;
        }

        if (tile.classList.contains('selected')) {
            // Deselect if clicking the last selected
            const lastSelected = WordGame.state.selectedIndices[WordGame.state.selectedIndices.length - 1];
            if (index === lastSelected) {
                WordGame.deselectLast();
                tile.classList.remove('selected');
            }
        } else {
            WordGame.selectLetter(index);
            tile.classList.add('selected');
        }

        this.updateCurrentWord();
    },

    /**
     * Update current word display
     */
    updateCurrentWord() {
        if (WordGame.state.currentWord.length === 0) {
            this.elements.currentWordDisplay.innerHTML = '<span class="placeholder-text">Select letters to form a word</span>';
        } else {
            this.elements.currentWordDisplay.innerHTML = WordGame.state.currentWord
                .split('')
                .map(l => `<span class="word-letter">${l.toUpperCase()}</span>`)
                .join('');
        }
    },

    /**
     * Clear current selection
     */
    clearSelection() {
        WordGame.clearSelection();
        this.updateCurrentWord();
        this.clearTileSelections();
    },

    /**
     * Clear all tile selections
     */
    clearTileSelections() {
        this.elements.letterTiles.querySelectorAll('.letter-tile').forEach(tile => {
            tile.classList.remove('selected');
        });
    },

    /**
     * Shuffle letters
     */
    shuffleLetters() {
        WordGame.shuffleLetters();
        this.clearSelection();
        this.renderLetterTiles();
        if (WordGame.state.soundEnabled) {
            WordGame.playSound('select');
        }
    },

    /**
     * Submit current word
     */
    submitWord() {
        const result = WordGame.submitWord();

        if (result.success) {
            this.showMessage(result.message, 'success');
            this.addFoundWord(WordGame.state.wordsFound[WordGame.state.wordsFound.length - 1], result.points);
            this.clearSelection();
            this.updateGameUI();

            if (result.levelComplete) {
                setTimeout(() => this.showGameOver(true), 500);
            }
        } else {
            this.showMessage(result.message, 'error');
            this.clearSelection();
        }
    },

    /**
     * Add a found word to the list
     * @param {string} word
     * @param {number} points
     */
    addFoundWord(word, points) {
        const wordEl = document.createElement('span');
        wordEl.className = 'found-word';
        wordEl.textContent = `${word.toUpperCase()} +${points}`;
        this.elements.foundWordsList.appendChild(wordEl);

        // Scroll to show latest word
        this.elements.foundWordsList.scrollTop = this.elements.foundWordsList.scrollHeight;
    },

    /**
     * Update game UI elements
     */
    updateGameUI() {
        this.elements.currentScore.textContent = WordGame.state.score;
        this.elements.currentLevel.textContent = WordGame.state.currentLevel;
        this.elements.wordsFound.textContent = WordGame.state.wordsFound.length;
    },

    /**
     * Show message toast
     * @param {string} message
     * @param {string} type - success, error, info
     */
    showMessage(message, type = 'info') {
        this.elements.messageToast.textContent = message;
        this.elements.messageToast.className = `message-toast show ${type}`;

        setTimeout(() => {
            this.elements.messageToast.classList.remove('show');
        }, 1500);
    },

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e
     */
    handleKeyboard(e) {
        // Only handle if game screen is active
        if (!this.elements.gameScreen.classList.contains('active')) return;

        const key = e.key.toLowerCase();

        // Letter keys
        if (/^[a-z]$/.test(key)) {
            // Find first available (not selected) tile with this letter
            const tiles = this.elements.letterTiles.querySelectorAll('.letter-tile');
            for (const tile of tiles) {
                if (tile.textContent.toLowerCase() === key && !tile.classList.contains('selected')) {
                    this.handleTileClick(parseInt(tile.dataset.index));
                    break;
                }
            }
        }

        // Enter - submit
        if (e.key === 'Enter') {
            this.submitWord();
        }

        // Backspace - delete last
        if (e.key === 'Backspace') {
            if (WordGame.state.selectedIndices.length > 0) {
                const lastIndex = WordGame.state.selectedIndices[WordGame.state.selectedIndices.length - 1];
                WordGame.deselectLast();
                this.elements.letterTiles.children[lastIndex].classList.remove('selected');
                this.updateCurrentWord();
            }
        }

        // Escape - clear
        if (e.key === 'Escape') {
            this.clearSelection();
        }
    },

    /**
     * Change theme
     * @param {string} theme
     */
    changeTheme(theme) {
        document.body.className = '';
        if (theme !== 'dark') {
            document.body.classList.add(`theme-${theme}`);
        }
        WordGame.setTheme(theme);
    },

    /**
     * Toggle sound
     * @param {boolean} enabled
     */
    toggleSound(enabled) {
        WordGame.setSound(enabled);
    },

    /**
     * Confirm end game
     */
    confirmEndGame() {
        WordGame.endGame();
        this.showGameOver(false);
    },

    /**
     * Show game over modal
     * @param {boolean} levelComplete
     */
    async showGameOver(levelComplete) {
        WordGame.endGame();

        this.elements.gameOverTitle.textContent = levelComplete ? 'Level Complete!' : 'Game Over';
        this.elements.finalScore.textContent = WordGame.state.score;
        this.elements.finalLevel.textContent = WordGame.state.currentLevel;
        this.elements.finalWords.textContent = WordGame.state.wordsFound.length;

        // Submit score to leaderboard
        let isNewBestFromLeaderboard = false;
        if (window.leaderboard && WordGame.state.score > 0) {
            try {
                await window.leaderboard.submitScore(
                    WordGame.state.score,
                    WordGame.state.currentLevel,
                    WordGame.state.wordsFound.length
                );
                // Check if this is a new best from leaderboard
                const overallBest = window.leaderboard.getOverallBestScore();
                isNewBestFromLeaderboard = (overallBest === WordGame.state.score);
            } catch (error) {
                console.error('Failed to submit score to leaderboard:', error);
            }
        }

        // Show/hide next level button
        this.elements.nextLevelBtn.style.display = levelComplete ? 'block' : 'none';

        // Show new record (local or leaderboard)
        if (WordGame.isNewRecord() || isNewBestFromLeaderboard) {
            this.elements.newBestRecord.classList.add('show');
        } else {
            this.elements.newBestRecord.classList.remove('show');
        }

        // Show all possible words
        this.renderAllWords();

        this.showModal('gameOverModal');
    },

    /**
     * Render all possible words in game over
     */
    renderAllWords() {
        const wordsStatus = WordGame.getAllWordsStatus();
        this.elements.allWordsList.innerHTML = '';

        wordsStatus.forEach(({ word, found }) => {
            const wordEl = document.createElement('span');
            wordEl.className = `word ${found ? 'found' : 'missed'}`;
            wordEl.textContent = word.toUpperCase();
            this.elements.allWordsList.appendChild(wordEl);
        });
    },

    /**
     * Play again at same level
     */
    playAgain() {
        this.elements.foundWordsList.innerHTML = '';
        this.hideModal('gameOverModal');
        this.startGame();
        this.updateBestScores();
    },

    /**
     * Go to next level
     */
    nextLevel() {
        this.elements.foundWordsList.innerHTML = '';
        this.hideModal('gameOverModal');

        // Increment level for next game
        const nextLevelNum = WordGame.state.currentLevel + 1;
        this.elements.levelSelect.value = Math.min(nextLevelNum, 10);

        WordGame.init(nextLevelNum);
        this.renderLetterTiles();
        this.updateGameUI();
        this.updateCurrentWord();
        this.updateBestScores();
    },

    /**
     * Return to main menu
     */
    returnToMenu() {
        this.elements.foundWordsList.innerHTML = '';
        this.hideModal('gameOverModal');
        this.showScreen('mainMenu');
        this.updateBestScores();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    WordUI.init();
});
