/**
 * Chess Renderer
 * Handles board rendering, SVG pieces, and visual updates
 */

const Renderer = (function() {
    // DOM elements
    let boardElement = null;
    let moveListElement = null;
    let capturedBlackElement = null;
    let capturedWhiteElement = null;
    let turnColorElement = null;
    let turnTextElement = null;
    let gameStatusElement = null;

    // Current state
    let currentTheme = 'classic';

    /**
     * Initialize the renderer
     */
    function init() {
        boardElement = document.getElementById('chessBoard');
        moveListElement = document.getElementById('moveList');
        capturedBlackElement = document.getElementById('capturedBlack');
        capturedWhiteElement = document.getElementById('capturedWhite');
        turnColorElement = document.getElementById('turnColor');
        turnTextElement = document.getElementById('turnText');
        gameStatusElement = document.getElementById('gameStatus');

        // Apply saved theme
        const savedTheme = localStorage.getItem('chessTheme') || 'classic';
        setTheme(savedTheme);

        return true;
    }

    /**
     * Set theme
     */
    function setTheme(theme) {
        currentTheme = theme;
        document.body.className = `theme-${theme}`;
        localStorage.setItem('chessTheme', theme);
    }

    /**
     * Get current theme
     */
    function getTheme() {
        return currentTheme;
    }

    /**
     * Render the complete board
     */
    function renderBoard(board, gameState) {
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = createSquare(row, col, board, gameState);
                boardElement.appendChild(square);
            }
        }
    }

    /**
     * Create a single square element
     */
    function createSquare(row, col, board, gameState) {
        const square = document.createElement('div');
        square.className = 'square';
        square.dataset.row = row;
        square.dataset.col = col;

        // Light or dark square
        const isLight = (row + col) % 2 === 0;
        square.classList.add(isLight ? 'light' : 'dark');

        const piece = board[row][col];

        // Check for highlights
        // Selected square
        if (gameState.selectedSquare &&
            gameState.selectedSquare.row === row &&
            gameState.selectedSquare.col === col) {
            square.classList.add('selected');
        }

        // Valid move highlight
        const isValidMove = gameState.validMoves.some(m =>
            m.to.row === row && m.to.col === col
        );
        if (isValidMove) {
            square.classList.add('valid-move');
            if (piece) {
                square.classList.add('has-piece');
            }
        }

        // Last move highlight
        if (gameState.lastMove) {
            if ((gameState.lastMove.from.row === row && gameState.lastMove.from.col === col) ||
                (gameState.lastMove.to.row === row && gameState.lastMove.to.col === col)) {
                square.classList.add('last-move');
            }
        }

        // Check highlight
        if (gameState.isCheck && piece) {
            const pieceType = piece.toLowerCase();
            const pieceColor = PIECES.getColor(piece);
            if (pieceType === 'k' && pieceColor === gameState.turn) {
                square.classList.add('in-check');
            }
        }

        // Add piece if present
        if (piece) {
            const pieceSVG = PIECES.createSVG(piece);
            square.appendChild(pieceSVG);
        }

        // Add coordinates on edges
        // File labels (a-h) on bottom row
        if (row === 7) {
            const fileLabel = document.createElement('span');
            fileLabel.className = 'coordinate file';
            fileLabel.textContent = 'abcdefgh'[col];
            square.appendChild(fileLabel);
        }

        // Rank labels (1-8) on left column
        if (col === 0) {
            const rankLabel = document.createElement('span');
            rankLabel.className = 'coordinate rank';
            rankLabel.textContent = 8 - row;
            square.appendChild(rankLabel);
        }

        return square;
    }

    /**
     * Update turn indicator
     */
    function updateTurnIndicator(turn, isCheck = false) {
        if (turnColorElement) {
            turnColorElement.className = `turn-color ${turn}`;
        }

        if (turnTextElement) {
            turnTextElement.textContent = `${turn === 'white' ? 'White' : 'Black'}'s Turn`;
        }

        if (gameStatusElement) {
            if (isCheck) {
                gameStatusElement.textContent = 'CHECK!';
                gameStatusElement.classList.add('check');
            } else {
                gameStatusElement.textContent = '';
                gameStatusElement.classList.remove('check');
            }
        }
    }

    /**
     * Update game status display
     */
    function updateGameStatus(status, type = 'info') {
        if (!gameStatusElement) return;

        gameStatusElement.textContent = status;
        gameStatusElement.className = 'game-status';

        if (type === 'check') {
            gameStatusElement.classList.add('check');
        } else if (type === 'checkmate') {
            gameStatusElement.classList.add('checkmate');
        }
    }

    /**
     * Render captured pieces
     */
    function renderCapturedPieces(capturedWhite, capturedBlack) {
        if (capturedWhiteElement) {
            capturedWhiteElement.innerHTML = '';
            // Sort by value for display
            const sorted = [...capturedWhite].sort((a, b) =>
                PIECES.getValue(b) - PIECES.getValue(a)
            );
            sorted.forEach(piece => {
                const span = document.createElement('span');
                span.className = 'captured-piece';
                span.textContent = PIECES.getUnicode(piece);
                capturedWhiteElement.appendChild(span);
            });
        }

        if (capturedBlackElement) {
            capturedBlackElement.innerHTML = '';
            const sorted = [...capturedBlack].sort((a, b) =>
                PIECES.getValue(b) - PIECES.getValue(a)
            );
            sorted.forEach(piece => {
                const span = document.createElement('span');
                span.className = 'captured-piece';
                span.textContent = PIECES.getUnicode(piece);
                capturedBlackElement.appendChild(span);
            });
        }
    }

    /**
     * Render move history
     */
    function renderMoveHistory(moveHistory) {
        if (!moveListElement) return;

        moveListElement.innerHTML = '';

        // Group moves by pairs (white, black)
        for (let i = 0; i < moveHistory.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moveHistory[i];
            const blackMove = moveHistory[i + 1];

            const entry = document.createElement('div');
            entry.className = 'move-entry';

            // Move number
            const numSpan = document.createElement('span');
            numSpan.className = 'move-number';
            numSpan.textContent = `${moveNumber}.`;
            entry.appendChild(numSpan);

            // White's move
            const whiteSpan = document.createElement('span');
            whiteSpan.className = 'move-white';
            whiteSpan.textContent = whiteMove.notation;
            entry.appendChild(whiteSpan);

            // Black's move (if exists)
            if (blackMove) {
                const blackSpan = document.createElement('span');
                blackSpan.className = 'move-black';
                blackSpan.textContent = blackMove.notation;
                entry.appendChild(blackSpan);
            }

            moveListElement.appendChild(entry);
        }

        // Scroll to bottom
        moveListElement.scrollTop = moveListElement.scrollHeight;
    }

    /**
     * Highlight valid moves for selected piece
     */
    function highlightValidMoves(validMoves) {
        // Remove all existing highlights
        document.querySelectorAll('.square.valid-move').forEach(sq => {
            sq.classList.remove('valid-move', 'has-piece');
        });

        // Add new highlights
        validMoves.forEach(move => {
            const square = document.querySelector(
                `.square[data-row="${move.to.row}"][data-col="${move.to.col}"]`
            );
            if (square) {
                square.classList.add('valid-move');
                if (square.querySelector('.piece')) {
                    square.classList.add('has-piece');
                }
            }
        });
    }

    /**
     * Clear selection highlight
     */
    function clearSelection() {
        document.querySelectorAll('.square.selected').forEach(sq => {
            sq.classList.remove('selected');
        });
        document.querySelectorAll('.square.valid-move').forEach(sq => {
            sq.classList.remove('valid-move', 'has-piece');
        });
    }

    /**
     * Animate piece movement
     */
    function animateMove(fromRow, fromCol, toRow, toCol, callback) {
        const fromSquare = document.querySelector(
            `.square[data-row="${fromRow}"][data-col="${fromCol}"]`
        );
        const toSquare = document.querySelector(
            `.square[data-row="${toRow}"][data-col="${toCol}"]`
        );

        if (!fromSquare || !toSquare) {
            if (callback) callback();
            return;
        }

        const piece = fromSquare.querySelector('.piece');
        if (!piece) {
            if (callback) callback();
            return;
        }

        // Get positions
        const fromRect = fromSquare.getBoundingClientRect();
        const toRect = toSquare.getBoundingClientRect();

        // Calculate offset
        const dx = toRect.left - fromRect.left;
        const dy = toRect.top - fromRect.top;

        // Animate
        piece.classList.add('animating');
        piece.style.transform = `translate(${dx}px, ${dy}px)`;

        setTimeout(() => {
            piece.classList.remove('animating');
            piece.style.transform = '';
            if (callback) callback();
        }, 150);
    }

    /**
     * Show promotion modal
     */
    function showPromotionModal(color, callback) {
        const modal = document.getElementById('promotionModal');
        const piecesContainer = document.getElementById('promotionPieces');

        if (!modal || !piecesContainer) return;

        piecesContainer.innerHTML = '';

        const promotionPieces = ['q', 'r', 'b', 'n'];

        promotionPieces.forEach(pieceType => {
            const piece = color === 'white' ? pieceType.toUpperCase() : pieceType;
            const btn = document.createElement('button');
            btn.className = 'promotion-piece';
            btn.appendChild(PIECES.createSVG(piece));
            btn.addEventListener('click', () => {
                modal.classList.remove('active');
                callback(pieceType);
            });
            piecesContainer.appendChild(btn);
        });

        modal.classList.add('active');
    }

    /**
     * Hide promotion modal
     */
    function hidePromotionModal() {
        const modal = document.getElementById('promotionModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Update menu score display
     */
    function updateMenuScores(record) {
        const winsEl = document.getElementById('winsMenu');
        const drawsEl = document.getElementById('drawsMenu');
        const lossesEl = document.getElementById('lossesMenu');

        if (winsEl) winsEl.textContent = record.wins || 0;
        if (drawsEl) drawsEl.textContent = record.draws || 0;
        if (lossesEl) lossesEl.textContent = record.losses || 0;
    }

    /**
     * Update game over statistics
     */
    function updateGameOverStats(moves, captures) {
        const movesEl = document.getElementById('movesCount');
        const capturesEl = document.getElementById('capturedPieces');

        if (movesEl) movesEl.textContent = moves;
        if (capturesEl) capturesEl.textContent = captures;
    }

    /**
     * Show game result
     */
    function showGameResult(title, resultText) {
        const titleEl = document.getElementById('gameOverTitle');
        const resultEl = document.getElementById('resultText');

        if (titleEl) titleEl.textContent = title;
        if (resultEl) resultEl.textContent = resultText;
    }

    // Public API
    return {
        init,
        setTheme,
        getTheme,
        renderBoard,
        updateTurnIndicator,
        updateGameStatus,
        renderCapturedPieces,
        renderMoveHistory,
        highlightValidMoves,
        clearSelection,
        animateMove,
        showPromotionModal,
        hidePromotionModal,
        updateMenuScores,
        updateGameOverStats,
        showGameResult
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}
