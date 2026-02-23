/**
 * Tetris Renderer
 * Canvas-based rendering for game board and queues
 */

const Renderer = (function() {
    // Canvas references
    let boardCanvas = null;
    let boardCtx = null;
    let holdCanvas = null;
    let holdCtx = null;
    let nextCanvas = null;
    let nextCtx = null;

    // Dimensions
    let cellSize = 30;
    let holdCellSize = 20;
    let nextCellSize = 20;

    // Colors
    const BOARD_BG = '#000000';
    const GRID_COLOR = '#1a1a1a';
    const GHOST_OPACITY = 0.3;

    // Animation state
    let clearingLines = [];
    let clearAnimationStart = 0;
    const CLEAR_ANIMATION_DURATION = 200;

    /**
     * Initialize renderer
     */
    function init() {
        boardCanvas = document.getElementById('gameBoard');
        holdCanvas = document.getElementById('holdCanvas');
        nextCanvas = document.getElementById('nextCanvas');

        if (boardCanvas) {
            boardCtx = boardCanvas.getContext('2d');
        }
        if (holdCanvas) {
            holdCtx = holdCanvas.getContext('2d');
        }
        if (nextCanvas) {
            nextCtx = nextCanvas.getContext('2d');
        }

        // Calculate cell sizes based on canvas dimensions
        updateCellSizes();

        // Handle responsive resizing
        handleResize();
        window.addEventListener('resize', handleResize);
    }

    /**
     * Handle responsive resize
     */
    function handleResize() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Mobile portrait
        if (vw < 600 && vh > vw) {
            const sidePanelWidth = 55;  // Reduced from 70
            const gap = 4;              // Reduced from 6
            const padding = 12;         // Reduced from 16
            const availableWidth = vw - (sidePanelWidth * 2) - (gap * 2) - padding;
            const boardWidth = Math.min(availableWidth, 220);  // Increased max from 180
            const cellSize = Math.floor(boardWidth / 10);
            const actualBoardWidth = cellSize * 10;
            const actualBoardHeight = cellSize * 20;

            if (boardCanvas) {
                boardCanvas.width = actualBoardWidth;
                boardCanvas.height = actualBoardHeight;
            }
            if (holdCanvas) {
                holdCanvas.width = 48;   // Reduced from 60
                holdCanvas.height = 48;
            }
            if (nextCanvas) {
                nextCanvas.width = 48;   // Reduced from 60
                nextCanvas.height = 144; // Reduced from 180
            }
        }
        // Mobile landscape
        else if (vh < 500 && vw > vh) {
            const maxBoardHeight = vh * 0.75;
            const cellSize = Math.floor(maxBoardHeight / 20);
            const actualBoardWidth = cellSize * 10;
            const actualBoardHeight = cellSize * 20;

            if (boardCanvas) {
                boardCanvas.width = actualBoardWidth;
                boardCanvas.height = actualBoardHeight;
            }
            if (holdCanvas) {
                holdCanvas.width = 50;
                holdCanvas.height = 50;
            }
            if (nextCanvas) {
                nextCanvas.width = 50;
                nextCanvas.height = 150;
            }
        }
        // Tablet
        else if (vw >= 600 && vw < 1024) {
            if (boardCanvas) {
                boardCanvas.width = 280;
                boardCanvas.height = 560;
            }
            if (holdCanvas) {
                holdCanvas.width = 80;
                holdCanvas.height = 80;
            }
            if (nextCanvas) {
                nextCanvas.width = 80;
                nextCanvas.height = 240;
            }
        }
        // Desktop
        else {
            if (boardCanvas) {
                boardCanvas.width = 300;
                boardCanvas.height = 600;
            }
            if (holdCanvas) {
                holdCanvas.width = 100;
                holdCanvas.height = 100;
            }
            if (nextCanvas) {
                nextCanvas.width = 100;
                nextCanvas.height = 300;
            }
        }

        updateCellSizes();
    }

    /**
     * Update cell sizes based on canvas dimensions
     */
    function updateCellSizes() {
        if (boardCanvas) {
            cellSize = boardCanvas.width / Game.BOARD_WIDTH;
        }
        if (holdCanvas) {
            holdCellSize = holdCanvas.width / 4;
        }
        if (nextCanvas) {
            nextCellSize = nextCanvas.width / 4;
        }
    }

    /**
     * Resize canvases
     */
    function resize(boardWidth, boardHeight, holdWidth, holdHeight, nextWidth, nextHeight) {
        if (boardCanvas) {
            boardCanvas.width = boardWidth;
            boardCanvas.height = boardHeight;
        }
        if (holdCanvas) {
            holdCanvas.width = holdWidth;
            holdCanvas.height = holdHeight;
        }
        if (nextCanvas) {
            nextCanvas.width = nextWidth;
            nextCanvas.height = nextHeight;
        }

        updateCellSizes();
    }

    /**
     * Main render function
     */
    function render() {
        renderBoard();
        renderHold();
        renderNext();
    }

    /**
     * Render the main game board
     */
    function renderBoard() {
        if (!boardCtx) return;

        const ctx = boardCtx;
        const width = boardCanvas.width;
        const height = boardCanvas.height;

        // Clear canvas
        ctx.fillStyle = BOARD_BG;
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 0.5;

        for (let x = 0; x <= Game.BOARD_WIDTH; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, height);
            ctx.stroke();
        }

        for (let y = 0; y <= Game.VISIBLE_HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(width, y * cellSize);
            ctx.stroke();
        }

        // Get board data
        const board = Game.getBoard();
        const offsetY = Game.BOARD_HEIGHT - Game.VISIBLE_HEIGHT; // 4 buffer rows

        // Draw placed blocks
        for (let y = offsetY; y < Game.BOARD_HEIGHT; y++) {
            for (let x = 0; x < Game.BOARD_WIDTH; x++) {
                if (board[y] && board[y][x]) {
                    const drawY = y - offsetY;
                    drawBlock(ctx, x * cellSize, drawY * cellSize, cellSize, getPieceColor(board[y][x]));
                }
            }
        }

        // Draw ghost piece
        const currentPiece = Game.getCurrentPiece();
        const ghostY = Game.getGhostPosition();

        if (currentPiece && ghostY !== null) {
            const matrix = currentPiece.matrix;
            const color = currentPiece.color;

            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (matrix[row][col]) {
                        const x = (currentPiece.x + col) * cellSize;
                        const y = (ghostY + row - offsetY) * cellSize;

                        if (ghostY + row >= offsetY) {
                            drawGhostBlock(ctx, x, y, cellSize, color);
                        }
                    }
                }
            }
        }

        // Draw current piece
        if (currentPiece) {
            const matrix = currentPiece.matrix;
            const color = currentPiece.color;

            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (matrix[row][col]) {
                        const x = (currentPiece.x + col) * cellSize;
                        const y = (currentPiece.y + row - offsetY) * cellSize;

                        if (currentPiece.y + row >= offsetY) {
                            drawBlock(ctx, x, y, cellSize, color);
                        }
                    }
                }
            }
        }

        // Draw line clear animation
        if (clearingLines.length > 0) {
            renderClearAnimation(ctx);
        }
    }

    /**
     * Draw a single block with 3D effect
     */
    function drawBlock(ctx, x, y, size, color) {
        const padding = 1;

        // Main block
        ctx.fillStyle = color;
        ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);

        // Highlight (top and left)
        ctx.fillStyle = lightenColor(color, 30);
        ctx.beginPath();
        ctx.moveTo(x + padding, y + padding);
        ctx.lineTo(x + size - padding, y + padding);
        ctx.lineTo(x + size - padding - 3, y + padding + 3);
        ctx.lineTo(x + padding + 3, y + padding + 3);
        ctx.lineTo(x + padding + 3, y + size - padding - 3);
        ctx.lineTo(x + padding, y + size - padding);
        ctx.closePath();
        ctx.fill();

        // Shadow (bottom and right)
        ctx.fillStyle = darkenColor(color, 30);
        ctx.beginPath();
        ctx.moveTo(x + size - padding, y + padding);
        ctx.lineTo(x + size - padding, y + size - padding);
        ctx.lineTo(x + padding, y + size - padding);
        ctx.lineTo(x + padding + 3, y + size - padding - 3);
        ctx.lineTo(x + size - padding - 3, y + size - padding - 3);
        ctx.lineTo(x + size - padding - 3, y + padding + 3);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw a ghost block (semi-transparent)
     */
    function drawGhostBlock(ctx, x, y, size, color) {
        const padding = 1;

        ctx.fillStyle = color;
        ctx.globalAlpha = GHOST_OPACITY;
        ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);

        // Draw outline
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + padding, y + padding, size - padding * 2, size - padding * 2);

        ctx.globalAlpha = 1;
    }

    /**
     * Render hold queue
     */
    function renderHold() {
        if (!holdCtx) return;

        const ctx = holdCtx;
        const width = holdCanvas.width;
        const height = holdCanvas.height;

        // Clear canvas
        ctx.fillStyle = BOARD_BG;
        ctx.fillRect(0, 0, width, height);

        // Get held piece
        const heldPieceType = Game.getHoldPiece();

        if (heldPieceType) {
            const matrix = getPieceMatrix(heldPieceType, 0);
            const color = getPieceColor(heldPieceType);
            const pieceSize = getPieceSize(heldPieceType);

            // Center the piece
            const offsetX = (4 - pieceSize) / 2 * holdCellSize;
            const offsetY = (4 - pieceSize) / 2 * holdCellSize;

            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (matrix[row][col]) {
                        const x = offsetX + col * holdCellSize;
                        const y = offsetY + row * holdCellSize;
                        drawBlock(ctx, x, y, holdCellSize, color);
                    }
                }
            }
        }
    }

    /**
     * Render next queue (3 pieces)
     */
    function renderNext() {
        if (!nextCtx) return;

        const ctx = nextCtx;
        const width = nextCanvas.width;
        const height = nextCanvas.height;

        // Clear canvas
        ctx.fillStyle = BOARD_BG;
        ctx.fillRect(0, 0, width, height);

        // Get next pieces
        const nextQueue = Game.getNextQueue();

        const pieceSpacing = nextCellSize * 4.5;

        for (let i = 0; i < Math.min(nextQueue.length, 3); i++) {
            const pieceType = nextQueue[i];
            const matrix = getPieceMatrix(pieceType, 0);
            const color = getPieceColor(pieceType);
            const pieceSize = getPieceSize(pieceType);

            // Center each piece horizontally
            const offsetX = (4 - pieceSize) / 2 * nextCellSize;
            const offsetY = i * pieceSpacing + (4 - pieceSize) / 2 * nextCellSize;

            for (let row = 0; row < matrix.length; row++) {
                for (let col = 0; col < matrix[row].length; col++) {
                    if (matrix[row][col]) {
                        const x = offsetX + col * nextCellSize;
                        const y = offsetY + row * nextCellSize;
                        drawBlock(ctx, x, y, nextCellSize, color);
                    }
                }
            }
        }
    }

    /**
     * Start line clear animation
     */
    function startClearAnimation(lineIndices) {
        clearingLines = lineIndices.map(y => y - (Game.BOARD_HEIGHT - Game.VISIBLE_HEIGHT));
        clearAnimationStart = performance.now();
    }

    /**
     * Render line clear animation
     */
    function renderClearAnimation(ctx) {
        const elapsed = performance.now() - clearAnimationStart;
        const progress = Math.min(elapsed / CLEAR_ANIMATION_DURATION, 1);

        if (progress >= 1) {
            clearingLines = [];
            return;
        }

        // Flash effect
        const alpha = Math.sin(progress * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;

        for (const y of clearingLines) {
            ctx.fillRect(0, y * cellSize, boardCanvas.width, cellSize);
        }
    }

    /**
     * Lighten a color
     */
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    /**
     * Darken a color
     */
    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // Initialize
    init();

    // Public API
    return {
        init,
        render,
        resize,
        startClearAnimation
    };
})();
