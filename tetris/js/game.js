/**
 * Tetris Game Logic
 * Core game mechanics, state management, and scoring
 */

const Game = (function() {
    // Game constants
    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 24; // 4 buffer rows at top
    const VISIBLE_HEIGHT = 20;

    // Game states
    const STATE = {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver'
    };

    // Difficulty settings (drop interval in ms)
    const DIFFICULTY = {
        easy: { baseInterval: 1000, levelDecrease: 50 },
        medium: { baseInterval: 500, levelDecrease: 40 },
        hard: { baseInterval: 200, levelDecrease: 30 }
    };

    // Scoring values
    const SCORE = {
        SOFT_DROP: 1,      // per cell
        HARD_DROP: 2,      // per cell
        SINGLE: 100,
        DOUBLE: 300,
        TRIPLE: 500,
        TETRIS: 800,
        T_SPIN: 400,
        T_SPIN_SINGLE: 800,
        T_SPIN_DOUBLE: 1200,
        T_SPIN_TRIPLE: 1600,
        BACK_TO_BACK_MULTIPLIER: 1.5
    };

    // Game state variables
    let board = [];
    let currentPiece = null;
    let holdPiece = null;
    let canHold = true;
    let nextQueue = [];
    let bag = [];

    let score = 0;
    let level = 1;
    let lines = 0;

    let gameState = STATE.MENU;
    let dropInterval = 500;
    let lastDropTime = 0;
    let lockDelay = 500;
    let lockTimer = null;
    let isLocking = false;

    let difficulty = 'medium';
    let soundEnabled = true;
    let lastMoveWasRotation = false;
    let lastClearWasTSpin = false;
    let backToBack = false;

    // Callbacks
    let onScoreUpdate = null;
    let onLevelUpdate = null;
    let onLinesUpdate = null;
    let onGameOver = null;
    let onLineClear = null;
    let onPieceLock = null;

    /**
     * Initialize the game
     */
    function init() {
        resetBoard();
        loadSettings();
    }

    /**
     * Reset the game board
     */
    function resetBoard() {
        board = [];
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            board[y] = new Array(BOARD_WIDTH).fill(null);
        }
    }

    /**
     * Start a new game
     */
    function startGame() {
        resetBoard();
        score = 0;
        level = 1;
        lines = 0;
        holdPiece = null;
        canHold = true;
        nextQueue = [];
        bag = [];
        backToBack = false;
        lastClearWasTSpin = false;

        // Set drop interval based on difficulty
        const diffSettings = DIFFICULTY[difficulty];
        dropInterval = diffSettings.baseInterval;

        // Fill next queue
        for (let i = 0; i < 3; i++) {
            nextQueue.push(getNextPiece());
        }

        // Spawn first piece
        spawnPiece();

        gameState = STATE.PLAYING;
        lastDropTime = performance.now();

        // Trigger UI updates
        updateScoreDisplay();
        updateLevelDisplay();
        updateLinesDisplay();
    }

    /**
     * Get next piece using 7-bag randomizer
     */
    function getNextPiece() {
        if (bag.length === 0) {
            // Fill bag with all 7 pieces and shuffle
            bag = [...PIECE_TYPES];
            shuffleArray(bag);
        }
        return bag.pop();
    }

    /**
     * Fisher-Yates shuffle
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Spawn a new piece
     */
    function spawnPiece() {
        const pieceType = nextQueue.shift();
        nextQueue.push(getNextPiece());

        currentPiece = createPiece(pieceType);
        canHold = true;
        isLocking = false;
        lastMoveWasRotation = false;

        // Check for game over
        if (checkCollision(currentPiece.x, currentPiece.y, currentPiece.matrix)) {
            gameOver();
        }
    }

    /**
     * Check collision
     */
    function checkCollision(x, y, matrix) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;

                    // Check bounds
                    if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
                        return true;
                    }

                    // Check against placed blocks (ignore above board)
                    if (boardY >= 0 && board[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Move piece left
     */
    function moveLeft() {
        if (gameState !== STATE.PLAYING || !currentPiece) return false;

        if (!checkCollision(currentPiece.x - 1, currentPiece.y, currentPiece.matrix)) {
            currentPiece.x--;
            lastMoveWasRotation = false;
            resetLockDelay();
            return true;
        }
        return false;
    }

    /**
     * Move piece right
     */
    function moveRight() {
        if (gameState !== STATE.PLAYING || !currentPiece) return false;

        if (!checkCollision(currentPiece.x + 1, currentPiece.y, currentPiece.matrix)) {
            currentPiece.x++;
            lastMoveWasRotation = false;
            resetLockDelay();
            return true;
        }
        return false;
    }

    /**
     * Soft drop (move down faster)
     */
    function softDrop() {
        if (gameState !== STATE.PLAYING || !currentPiece) return 0;

        if (!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.matrix)) {
            currentPiece.y++;
            addScore(SCORE.SOFT_DROP);
            return 1;
        }
        return 0;
    }

    /**
     * Hard drop (instant drop)
     */
    function hardDrop() {
        if (gameState !== STATE.PLAYING || !currentPiece) return 0;

        let dropDistance = 0;
        while (!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.matrix)) {
            currentPiece.y++;
            dropDistance++;
        }

        addScore(dropDistance * SCORE.HARD_DROP);
        lockPiece();
        return dropDistance;
    }

    /**
     * Rotate piece
     */
    function rotate(clockwise = true) {
        if (gameState !== STATE.PLAYING || !currentPiece) return false;
        if (currentPiece.type === 'O') return true; // O doesn't rotate

        const oldRotation = currentPiece.rotation;
        const newRotation = rotateDirection(oldRotation, clockwise);
        const newMatrix = getPieceMatrix(currentPiece.type, newRotation);

        // Get wall kick data
        const kicks = getWallKicks(currentPiece.type, oldRotation, newRotation);

        // Try each kick
        for (const [kickX, kickY] of kicks) {
            const newX = currentPiece.x + kickX;
            const newY = currentPiece.y - kickY; // Negative because y increases downward

            if (!checkCollision(newX, newY, newMatrix)) {
                currentPiece.x = newX;
                currentPiece.y = newY;
                currentPiece.rotation = newRotation;
                currentPiece.matrix = newMatrix;
                lastMoveWasRotation = true;
                resetLockDelay();
                return true;
            }
        }

        return false;
    }

    /**
     * Hold piece
     */
    function hold() {
        if (gameState !== STATE.PLAYING || !currentPiece || !canHold) return false;

        canHold = false;
        const currentType = currentPiece.type;

        if (holdPiece) {
            // Swap with hold piece
            currentPiece = createPiece(holdPiece);
        } else {
            // Get new piece from queue
            spawnPiece();
        }

        holdPiece = currentType;
        isLocking = false;
        lastMoveWasRotation = false;

        return true;
    }

    /**
     * Calculate ghost piece position
     */
    function getGhostPosition() {
        if (!currentPiece) return null;

        let ghostY = currentPiece.y;
        while (!checkCollision(currentPiece.x, ghostY + 1, currentPiece.matrix)) {
            ghostY++;
        }
        return ghostY;
    }

    /**
     * Reset lock delay timer
     */
    function resetLockDelay() {
        if (isLocking) {
            clearTimeout(lockTimer);
            lockTimer = null;
            isLocking = false;
        }
    }

    /**
     * Lock the current piece in place
     */
    function lockPiece() {
        if (!currentPiece) return;

        // Check for T-Spin
        const isTSpin = lastMoveWasRotation && detectTSpin(board, currentPiece);
        lastClearWasTSpin = isTSpin;

        // Place piece on board
        for (let row = 0; row < currentPiece.matrix.length; row++) {
            for (let col = 0; col < currentPiece.matrix[row].length; col++) {
                if (currentPiece.matrix[row][col]) {
                    const boardY = currentPiece.y + row;
                    const boardX = currentPiece.x + col;

                    if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                        board[boardY][boardX] = currentPiece.type;
                    }
                }
            }
        }

        // Clear lines
        const clearedLines = clearLines(isTSpin);

        // Callback for piece lock
        if (onPieceLock) onPieceLock();

        // Spawn next piece
        spawnPiece();
    }

    /**
     * Clear completed lines
     */
    function clearLines(isTSpin) {
        const linesToClear = [];

        // Find completed lines
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            if (board[y].every(cell => cell !== null)) {
                linesToClear.push(y);
            }
        }

        if (linesToClear.length === 0) {
            backToBack = false;
            return 0;
        }

        // Calculate score
        let lineScore = 0;
        const lineCount = linesToClear.length;

        if (isTSpin) {
            switch (lineCount) {
                case 1: lineScore = SCORE.T_SPIN_SINGLE; break;
                case 2: lineScore = SCORE.T_SPIN_DOUBLE; break;
                case 3: lineScore = SCORE.T_SPIN_TRIPLE; break;
            }
        } else {
            switch (lineCount) {
                case 1: lineScore = SCORE.SINGLE; break;
                case 2: lineScore = SCORE.DOUBLE; break;
                case 3: lineScore = SCORE.TRIPLE; break;
                case 4: lineScore = SCORE.TETRIS; break;
            }
        }

        // Back-to-back bonus
        if ((lineCount === 4 || isTSpin) && backToBack) {
            lineScore = Math.floor(lineScore * SCORE.BACK_TO_BACK_MULTIPLIER);
        }

        // Update back-to-back status
        if (lineCount === 4 || isTSpin) {
            backToBack = true;
        } else {
            backToBack = false;
        }

        // Apply level multiplier and add score
        addScore(lineScore * level);

        // Update lines
        lines += lineCount;
        updateLinesDisplay();

        // Check for level up
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            updateLevelDisplay();
            updateDropInterval();
        }

        // Remove cleared lines
        for (const y of linesToClear.sort((a, b) => b - a)) {
            board.splice(y, 1);
            board.unshift(new Array(BOARD_WIDTH).fill(null));
        }

        // Callback for line clear
        if (onLineClear) onLineClear(lineCount);

        return lineCount;
    }

    /**
     * Add to score
     */
    function addScore(points) {
        score += points;
        updateScoreDisplay();
    }

    /**
     * Update drop interval based on level
     */
    function updateDropInterval() {
        const diffSettings = DIFFICULTY[difficulty];
        dropInterval = Math.max(
            50,
            diffSettings.baseInterval - ((level - 1) * diffSettings.levelDecrease)
        );
    }

    /**
     * Game loop update
     */
    function update(timestamp) {
        if (gameState !== STATE.PLAYING) return;

        if (timestamp - lastDropTime >= dropInterval) {
            // Try to move piece down
            if (!checkCollision(currentPiece.x, currentPiece.y + 1, currentPiece.matrix)) {
                currentPiece.y++;
                lastDropTime = timestamp;
            } else {
                // Start lock delay
                if (!isLocking) {
                    isLocking = true;
                    lockTimer = setTimeout(() => {
                        if (gameState === STATE.PLAYING && isLocking) {
                            lockPiece();
                        }
                    }, lockDelay);
                }
                lastDropTime = timestamp;
            }
        }
    }

    /**
     * Game over
     */
    function gameOver() {
        gameState = STATE.GAME_OVER;

        // Save best score
        saveBestScore();

        if (onGameOver) onGameOver(score, level, lines);
    }

    /**
     * Pause game
     */
    function pause() {
        if (gameState === STATE.PLAYING) {
            gameState = STATE.PAUSED;
            if (lockTimer) {
                clearTimeout(lockTimer);
                lockTimer = null;
            }
        }
    }

    /**
     * Resume game
     */
    function resume() {
        if (gameState === STATE.PAUSED) {
            gameState = STATE.PLAYING;
            lastDropTime = performance.now();
        }
    }

    /**
     * Quit to menu
     */
    function quit() {
        gameState = STATE.MENU;
        if (lockTimer) {
            clearTimeout(lockTimer);
            lockTimer = null;
        }
    }

    // Display update helpers
    function updateScoreDisplay() {
        if (onScoreUpdate) onScoreUpdate(score);
    }

    function updateLevelDisplay() {
        if (onLevelUpdate) onLevelUpdate(level);
    }

    function updateLinesDisplay() {
        if (onLinesUpdate) onLinesUpdate(lines);
    }

    // Settings
    function loadSettings() {
        const savedDifficulty = localStorage.getItem('tetris_difficulty');
        if (savedDifficulty && DIFFICULTY[savedDifficulty]) {
            difficulty = savedDifficulty;
        }

        const savedSound = localStorage.getItem('tetris_sound');
        if (savedSound !== null) {
            soundEnabled = savedSound === 'true';
        }
    }

    function setDifficulty(diff) {
        if (DIFFICULTY[diff]) {
            difficulty = diff;
            localStorage.setItem('tetris_difficulty', diff);
        }
    }

    function setSoundEnabled(enabled) {
        soundEnabled = enabled;
        localStorage.setItem('tetris_sound', enabled.toString());
    }

    function saveBestScore() {
        const bestScore = localStorage.getItem('tetris_best_score') || 0;
        if (score > bestScore) {
            localStorage.setItem('tetris_best_score', score.toString());
            return true; // New best!
        }
        return false;
    }

    function getBestScore() {
        return parseInt(localStorage.getItem('tetris_best_score') || '0', 10);
    }

    // Callback setters
    function setOnScoreUpdate(callback) { onScoreUpdate = callback; }
    function setOnLevelUpdate(callback) { onLevelUpdate = callback; }
    function setOnLinesUpdate(callback) { onLinesUpdate = callback; }
    function setOnGameOver(callback) { onGameOver = callback; }
    function setOnLineClear(callback) { onLineClear = callback; }
    function setOnPieceLock(callback) { onPieceLock = callback; }

    // Getters
    function getBoard() { return board; }
    function getCurrentPiece() { return currentPiece; }
    function getHoldPiece() { return holdPiece; }
    function getNextQueue() { return nextQueue; }
    function getScore() { return score; }
    function getLevel() { return level; }
    function getLines() { return lines; }
    function getGameState() { return gameState; }
    function getSoundEnabled() { return soundEnabled; }
    function getDifficulty() { return difficulty; }

    // Initialize
    init();

    // Public API
    return {
        STATE,
        BOARD_WIDTH,
        BOARD_HEIGHT,
        VISIBLE_HEIGHT,

        // Game control
        startGame,
        pause,
        resume,
        quit,
        update,

        // Piece movement
        moveLeft,
        moveRight,
        softDrop,
        hardDrop,
        rotate,
        hold,

        // Getters
        getBoard,
        getCurrentPiece,
        getHoldPiece,
        getNextQueue,
        getScore,
        getLevel,
        getLines,
        getGameState,
        getSoundEnabled,
        getDifficulty,
        getBestScore,
        getGhostPosition,

        // Settings
        setDifficulty,
        setSoundEnabled,

        // Callbacks
        setOnScoreUpdate,
        setOnLevelUpdate,
        setOnLinesUpdate,
        setOnGameOver,
        setOnLineClear,
        setOnPieceLock
    };
})();
