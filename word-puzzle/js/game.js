/**
 * Word Puzzle - Core Game Logic
 */

const WordGame = {
    // Game state
    state: {
        currentLevel: 1,
        score: 0,
        wordsFound: [],
        targetWords: 10,
        letters: [],
        allPossibleWords: [],
        selectedIndices: [],
        currentWord: "",
        soundEnabled: true,
        theme: "dark",
        isPlaying: false
    },

    // Letter frequency pools by difficulty
    letterPools: {
        easy: ['a', 'e', 'i', 'o', 'u', 'r', 's', 't', 'l', 'n', 'e', 'a', 'r', 's', 't'],
        medium: ['a', 'e', 'i', 'o', 'u', 'r', 's', 't', 'l', 'n', 'd', 'c', 'm', 'p', 'b', 'g', 'h', 'k', 'w', 'y'],
        hard: ['a', 'e', 'i', 'o', 'u', 'r', 's', 't', 'l', 'n', 'd', 'c', 'm', 'p', 'b', 'g', 'h', 'k', 'w', 'y', 'f', 'j', 'v', 'x', 'z', 'q']
    },

    /**
     * Initialize a new game
     * @param {number} level - Starting level (1-10)
     */
    init(level = 1) {
        this.state.currentLevel = level;
        this.state.score = 0;
        this.state.wordsFound = [];
        this.state.selectedIndices = [];
        this.state.currentWord = "";
        this.state.isPlaying = true;
        this.loadSettings();
        this.generatePuzzle();
    },

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const savedTheme = localStorage.getItem('wordPuzzleTheme') || 'dark';
        const savedSound = localStorage.getItem('wordPuzzleSound');

        this.state.theme = savedTheme;
        this.state.soundEnabled = savedSound !== 'false';
    },

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('wordPuzzleTheme', this.state.theme);
        localStorage.setItem('wordPuzzleSound', this.state.soundEnabled);
    },

    /**
     * Generate a valid puzzle with 7 letters
     */
    generatePuzzle() {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            this.state.letters = this.generateLetters(this.state.currentLevel);
            this.state.allPossibleWords = Dictionary.getWordsFromLetters(this.state.letters);

            // Ensure at least 15 possible words for a good game
            if (this.state.allPossibleWords.length >= 15) {
                break;
            }
            attempts++;
        }

        // Fallback: use a known good combination
        if (this.state.allPossibleWords.length < 10) {
            this.state.letters = ['t', 'a', 'r', 's', 'e', 'l', 'i'];
            this.state.allPossibleWords = Dictionary.getWordsFromLetters(this.state.letters);
        }

        this.shuffleLetters();
    },

    /**
     * Generate 7 random letters based on difficulty level
     * @param {number} level - Current level
     * @returns {string[]} - Array of 7 letters
     */
    generateLetters(level) {
        let pool;
        let vowelCount = 2;

        if (level <= 3) {
            pool = this.letterPools.easy;
            vowelCount = 3;
        } else if (level <= 6) {
            pool = this.letterPools.medium;
            vowelCount = 2;
        } else {
            pool = this.letterPools.hard;
            vowelCount = 2;
        }

        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const letters = [];
        const usedIndices = new Set();

        // Ensure minimum vowels
        const availableVowels = pool.filter(l => vowels.includes(l));
        while (letters.length < vowelCount && availableVowels.length > 0) {
            const idx = Math.floor(Math.random() * availableVowels.length);
            const vowel = availableVowels[idx];
            if (letters.filter(l => l === vowel).length < 2) {
                letters.push(vowel);
            }
            availableVowels.splice(idx, 1);
        }

        // Fill remaining slots with random letters from pool
        while (letters.length < 7) {
            const idx = Math.floor(Math.random() * pool.length);
            const letter = pool[idx];
            // Allow max 2 of same letter
            if (letters.filter(l => l === letter).length < 2) {
                letters.push(letter);
            }
        }

        return letters.slice(0, 7);
    },

    /**
     * Shuffle the letter positions
     */
    shuffleLetters() {
        for (let i = this.state.letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.state.letters[i], this.state.letters[j]] = [this.state.letters[j], this.state.letters[i]];
        }
    },

    /**
     * Select a letter at given index
     * @param {number} index - Index of letter to select
     * @returns {boolean} - Whether selection was successful
     */
    selectLetter(index) {
        if (!this.state.isPlaying) return false;
        if (index < 0 || index >= this.state.letters.length) return false;
        if (this.state.selectedIndices.includes(index)) return false;

        this.state.selectedIndices.push(index);
        this.state.currentWord += this.state.letters[index];

        if (this.state.soundEnabled) {
            this.playSound('select');
        }

        return true;
    },

    /**
     * Deselect the last selected letter
     * @returns {boolean} - Whether deselection was successful
     */
    deselectLast() {
        if (this.state.selectedIndices.length === 0) return false;

        this.state.selectedIndices.pop();
        this.state.currentWord = this.state.currentWord.slice(0, -1);
        return true;
    },

    /**
     * Clear current selection
     */
    clearSelection() {
        this.state.selectedIndices = [];
        this.state.currentWord = "";
    },

    /**
     * Submit the current word
     * @returns {Object} - Result of submission {success, message, points}
     */
    submitWord() {
        if (!this.state.isPlaying) {
            return { success: false, message: "Game not in progress" };
        }

        const word = this.state.currentWord.toLowerCase();

        // Validation checks
        if (word.length < 3) {
            return { success: false, message: "Word must be at least 3 letters" };
        }

        if (this.state.wordsFound.includes(word)) {
            return { success: false, message: "Already found!" };
        }

        if (!Dictionary.isValidWord(word)) {
            if (this.state.soundEnabled) {
                this.playSound('error');
            }
            return { success: false, message: "Not a valid word" };
        }

        // Word is valid!
        const points = this.calculateScore(word.length);
        this.state.score += points;
        this.state.wordsFound.push(word);
        this.clearSelection();

        if (this.state.soundEnabled) {
            this.playSound('success');
        }

        // Check if level complete
        if (this.state.wordsFound.length >= this.state.targetWords) {
            return {
                success: true,
                message: `+${points} points!`,
                points,
                levelComplete: true
            };
        }

        return {
            success: true,
            message: `+${points} points!`,
            points
        };
    },

    /**
     * Calculate score for a word
     * @param {number} length - Word length
     * @returns {number} - Score points
     */
    calculateScore(length) {
        return length * 10;
    },

    /**
     * Get current game progress
     * @returns {Object} - Progress info
     */
    getProgress() {
        return {
            found: this.state.wordsFound.length,
            target: this.state.targetWords,
            percentage: Math.round((this.state.wordsFound.length / this.state.targetWords) * 100)
        };
    },

    /**
     * Get all possible words with found status
     * @returns {Object[]} - Words with found status
     */
    getAllWordsStatus() {
        return this.state.allPossibleWords.map(word => ({
            word,
            found: this.state.wordsFound.includes(word)
        }));
    },

    /**
     * End the current game
     */
    endGame() {
        this.state.isPlaying = false;
        this.saveBestScore();
    },

    /**
     * Save best score to localStorage
     */
    saveBestScore() {
        const bestScore = parseInt(localStorage.getItem('wordPuzzleBestScore') || '0');
        const bestLevel = parseInt(localStorage.getItem('wordPuzzleBestLevel') || '1');

        if (this.state.score > bestScore) {
            localStorage.setItem('wordPuzzleBestScore', this.state.score.toString());
        }
        if (this.state.currentLevel > bestLevel) {
            localStorage.setItem('wordPuzzleBestLevel', this.state.currentLevel.toString());
        }
    },

    /**
     * Get best scores from localStorage
     * @returns {Object} - Best scores
     */
    getBestScores() {
        return {
            bestScore: parseInt(localStorage.getItem('wordPuzzleBestScore') || '0'),
            bestLevel: parseInt(localStorage.getItem('wordPuzzleBestLevel') || '1')
        };
    },

    /**
     * Check if current score is a new record
     * @returns {boolean}
     */
    isNewRecord() {
        const bestScore = parseInt(localStorage.getItem('wordPuzzleBestScore') || '0');
        return this.state.score > bestScore;
    },

    /**
     * Set game theme
     * @param {string} theme - Theme name
     */
    setTheme(theme) {
        this.state.theme = theme;
        this.saveSettings();
    },

    /**
     * Toggle sound
     * @param {boolean} enabled
     */
    setSound(enabled) {
        this.state.soundEnabled = enabled;
        this.saveSettings();
    },

    /**
     * Play sound effect
     * @param {string} type - Sound type
     */
    playSound(type) {
        // Simple beep sounds using Web Audio API
        if (!this.state.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            switch (type) {
                case 'select':
                    oscillator.frequency.value = 400;
                    oscillator.type = 'sine';
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.05);
                    break;
                case 'success':
                    oscillator.frequency.value = 523.25; // C5
                    oscillator.type = 'sine';
                    gainNode.gain.value = 0.15;
                    oscillator.start();
                    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                case 'error':
                    oscillator.frequency.value = 200;
                    oscillator.type = 'square';
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.15);
                    break;
            }
        } catch (e) {
            // Audio not supported
        }
    }
};

// Export
window.WordGame = WordGame;
