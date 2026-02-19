/**
 * Chess AI - Simplified Adaptive AI
 * Uses minimax with alpha-beta pruning
 */

const ChessAI = (function() {
    // AI configuration
    let config = {
        difficulty: 'medium' // 'easy', 'medium', 'hard'
    };

    // Depth settings for each difficulty
    const difficultySettings = {
        easy: { depth: 2, randomFactor: 0.3 },    // Makes occasional random moves
        medium: { depth: 3, randomFactor: 0 },    // Solid play
        hard: { depth: 4, randomFactor: 0 }       // Strong play
    };

    /**
     * Set AI difficulty
     */
    function setDifficulty(difficulty) {
        if (['easy', 'medium', 'hard'].includes(difficulty)) {
            config.difficulty = difficulty;
        }
    }

    /**
     * Get current difficulty
     */
    function getDifficulty() {
        return config.difficulty;
    }

    /**
     * Get piece value
     */
    function getPieceValue(piece) {
        if (!piece) return 0;
        const values = {
            'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000,
            'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000
        };
        return values[piece] || 0;
    }

    /**
     * Piece Square Tables - encourage good positional play
     * Values from white's perspective, flipped for black
     */
    const PST = {
        pawn: [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 45, 45, 10,  5,  5],
            [0,  0,  0, 40, 40,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-25,-25, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ],
        knight: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ],
        bishop: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ],
        rook: [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [0,  0,  0, 10, 10,  0,  0,  0]
        ],
        queen: [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [-5,  0,  5,  5,  5,  5,  0, -5],
            [0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ],
        kingMiddle: [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [20, 20,  0,  0,  0,  0, 20, 20],
            [20, 40, 10,  0,  0, 10, 40, 20]
        ]
    };

    /**
     * Evaluate position with comprehensive factors
     */
    function evaluatePosition(board) {
        let score = 0;
        let whiteMaterial = 0;
        let blackMaterial = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (!piece) continue;

                const isWhite = piece === piece.toUpperCase();
                const type = piece.toLowerCase();
                const value = getPieceValue(piece);
                const pstRow = isWhite ? row : 7 - row;

                let positionBonus = 0;

                // Apply Piece Square Tables for positional evaluation
                switch (type) {
                    case 'p': positionBonus = PST.pawn[pstRow][col]; break;
                    case 'n': positionBonus = PST.knight[pstRow][col]; break;
                    case 'b': positionBonus = PST.bishop[pstRow][col]; break;
                    case 'r': positionBonus = PST.rook[pstRow][col]; break;
                    case 'q': positionBonus = PST.queen[pstRow][col]; break;
                    case 'k': positionBonus = PST.kingMiddle[pstRow][col]; break;
                }

                if (isWhite) {
                    whiteMaterial += value;
                    score += value + positionBonus;
                } else {
                    blackMaterial += value;
                    score -= value + positionBonus;
                }
            }
        }

        // Center control bonus
        const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
        for (const [r, c] of centerSquares) {
            if (isSquareAttacked(board, r, c, 'white')) score += 8;
            if (isSquareAttacked(board, r, c, 'black')) score -= 8;
        }

        // Extended center control
        const extendedCenter = [[2,2], [2,3], [2,4], [2,5], [3,2], [3,5], [4,2], [4,5], [5,2], [5,3], [5,4], [5,5]];
        for (const [r, c] of extendedCenter) {
            if (isSquareAttacked(board, r, c, 'white')) score += 3;
            if (isSquareAttacked(board, r, c, 'black')) score -= 3;
        }

        // King safety - encourage castling
        const whiteKing = findKing(board, 'white');
        const blackKing = findKing(board, 'black');

        if (whiteKing) {
            if (whiteKing.row === 7 && (whiteKing.col === 6 || whiteKing.col === 2)) {
                score += 40; // Castled bonus
            }
            if (whiteKing.row === 7 && whiteKing.col >= 3 && whiteKing.col <= 4) {
                score -= 30; // King in center penalty
            }
        }

        if (blackKing) {
            if (blackKing.row === 0 && (blackKing.col === 6 || blackKing.col === 2)) {
                score -= 40;
            }
            if (blackKing.row === 0 && blackKing.col >= 3 && blackKing.col <= 4) {
                score += 30;
            }
        }

        // Mobility - count legal moves (simplified)
        const whiteMoves = getAllMoves(board, 'white').length;
        const blackMoves = getAllMoves(board, 'black').length;
        score += (whiteMoves - blackMoves) * 5;

        return score;
    }

    /**
     * Make a temporary move on a copy of the board
     */
    function makeTemporaryMove(board, move) {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[move.from.row][move.from.col];
        const color = piece === piece.toUpperCase() ? 'white' : 'black';

        // Move the piece
        newBoard[move.to.row][move.to.col] = piece;
        newBoard[move.from.row][move.from.col] = null;

        // Handle en passant
        if (move.enPassant) {
            const captureRow = color === 'white' ? move.to.row + 1 : move.to.row - 1;
            newBoard[captureRow][move.to.col] = null;
        }

        // Handle promotion
        if (move.promotion) {
            newBoard[move.to.row][move.to.col] = color === 'white'
                ? move.promotion.toUpperCase()
                : move.promotion.toLowerCase();
        }

        // Handle castling
        if (move.castling) {
            const kingRow = color === 'white' ? 7 : 0;
            if (move.castling === 'kingside') {
                newBoard[kingRow][5] = newBoard[kingRow][7];
                newBoard[kingRow][7] = null;
            } else {
                newBoard[kingRow][3] = newBoard[kingRow][0];
                newBoard[kingRow][0] = null;
            }
        }

        return newBoard;
    }

    /**
     * Find king position
     */
    function findKing(board, color) {
        const king = color === 'white' ? 'K' : 'k';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === king) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    /**
     * Check if square is attacked
     */
    function isSquareAttacked(board, row, col, byColor) {
        const pawn = byColor === 'white' ? 'P' : 'p';
        const knight = byColor === 'white' ? 'N' : 'n';
        const king = byColor === 'white' ? 'K' : 'k';
        const rook = byColor === 'white' ? 'R' : 'r';
        const bishop = byColor === 'white' ? 'B' : 'b';
        const queen = byColor === 'white' ? 'Q' : 'q';

        // Pawn attacks
        const pawnDir = byColor === 'white' ? 1 : -1;
        if (row + pawnDir >= 0 && row + pawnDir < 8) {
            if (col - 1 >= 0 && board[row + pawnDir][col - 1] === pawn) return true;
            if (col + 1 < 8 && board[row + pawnDir][col + 1] === pawn) return true;
        }

        // Knight attacks
        const knightMoves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
        for (const [dr, dc] of knightMoves) {
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === knight) return true;
        }

        // King attacks
        const kingMoves = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
        for (const [dr, dc] of kingMoves) {
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === king) return true;
        }

        // Rook/Queen attacks (straight lines)
        const rookDirs = [[0,1],[0,-1],[1,0],[-1,0]];
        for (const [dr, dc] of rookDirs) {
            let r = row + dr, c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const p = board[r][c];
                if (p) {
                    if (p === rook || p === queen) return true;
                    break;
                }
                r += dr; c += dc;
            }
        }

        // Bishop/Queen attacks (diagonals)
        const bishopDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
        for (const [dr, dc] of bishopDirs) {
            let r = row + dr, c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const p = board[r][c];
                if (p) {
                    if (p === bishop || p === queen) return true;
                    break;
                }
                r += dr; c += dc;
            }
        }

        return false;
    }

    /**
     * Check if color is in check
     */
    function isInCheck(board, color) {
        const kingPos = findKing(board, color);
        if (!kingPos) return false;
        const opponent = color === 'white' ? 'black' : 'white';
        return isSquareAttacked(board, kingPos.row, kingPos.col, opponent);
    }

    /**
     * Get search depth based on difficulty
     */
    function getSearchDepth() {
        return difficultySettings[config.difficulty].depth;
    }

    /**
     * Minimax with alpha-beta pruning
     */
    function minimax(board, depth, alpha, beta, maximizingPlayer, moves) {
        const color = maximizingPlayer ? 'white' : 'black';

        // Get moves for current position
        const currentMoves = moves || getAllMoves(board, color);

        // Terminal conditions
        if (currentMoves.length === 0) {
            if (isInCheck(board, color)) {
                return maximizingPlayer ? -100000 : 100000;
            }
            return 0; // Stalemate
        }

        if (depth === 0) {
            return evaluatePosition(board);
        }

        // Sort moves for better pruning (captures first)
        currentMoves.sort((a, b) => {
            const captureA = board[a.to.row][a.to.col] ? getPieceValue(board[a.to.row][a.to.col]) : 0;
            const captureB = board[b.to.row][b.to.col] ? getPieceValue(board[b.to.row][b.to.col]) : 0;
            return captureB - captureA;
        });

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of currentMoves) {
                const newBoard = makeTemporaryMove(board, move);
                const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, null);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of currentMoves) {
                const newBoard = makeTemporaryMove(board, move);
                const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, null);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    /**
     * Get all legal moves for a color using Game module
     */
    function getAllMoves(board, color) {
        const moves = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';
                    if (pieceColor === color) {
                        // Get moves from Game module for this piece
                        const pieceMoves = Game.generateLegalMoves(row, col);
                        moves.push(...pieceMoves);
                    }
                }
            }
        }

        return moves;
    }

    /**
     * Get best move for AI
     */
    function getBestMove(board, turn, gameState) {
        const depth = getSearchDepth();
        const settings = difficultySettings[config.difficulty];
        const maximizing = turn === 'white';
        const color = turn;

        // Get all legal moves
        const moves = getAllMoves(board, color);

        if (moves.length === 0) {
            return null;
        }

        // For easy mode, sometimes make a random move
        if (settings.randomFactor > 0 && Math.random() < settings.randomFactor) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        // Sort moves for better pruning (captures first)
        moves.sort((a, b) => {
            const captureA = board[a.to.row][a.to.col] ? getPieceValue(board[a.to.row][a.to.col]) : 0;
            const captureB = board[b.to.row][b.to.col] ? getPieceValue(board[b.to.row][b.to.col]) : 0;
            return captureB - captureA;
        });

        let bestMove = moves[0];
        let bestScore = maximizing ? -Infinity : Infinity;

        for (const move of moves) {
            const newBoard = makeTemporaryMove(board, move);
            const score = minimax(newBoard, depth - 1, -Infinity, Infinity, !maximizing, null);

            if (maximizing) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }

        return bestMove;
    }

    // Public API
    return {
        getBestMove,
        setDifficulty,
        getDifficulty,
        getSearchDepth
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessAI;
}
