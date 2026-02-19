/**
 * Chess Game Logic
 * Core chess engine with move generation, validation, and game state
 */

const Game = (function() {
    // Board representation - 8x8 array
    // Uppercase = white, lowercase = black
    // K=King, Q=Queen, R=Rook, B=Bishop, N=Knight, P=Pawn
    let board = [];

    // Game state
    let state = {
        turn: 'white',              // Current turn
        selectedSquare: null,       // Currently selected square
        validMoves: [],             // Valid moves for selected piece
        lastMove: null,             // Last move made {from, to}
        isCheck: false,             // Is current player in check
        isCheckmate: false,         // Is checkmate
        isStalemate: false,         // Is stalemate
        isDraw: false,              // Other draw conditions
        gameOver: false,            // Game over flag
        winner: null,               // Winner if game over

        // Castling rights
        castling: {
            whiteKingside: true,
            whiteQueenside: true,
            blackKingside: true,
            blackQueenside: true
        },

        // En passant target square
        enPassantTarget: null,

        // Move counters
        halfMoveClock: 0,           // For 50-move rule
        fullMoveNumber: 1,

        // Captured pieces
        capturedWhite: [],          // Pieces captured by black
        capturedBlack: [],          // Pieces captured by white

        // Move history
        moveHistory: [],

        // Game settings
        opponent: 'ai',             // 'ai' or 'human'
        playerColor: 'white',       // Player's color (for AI games)

        // Callbacks
        onMove: null,
        onCapture: null,
        onCheck: null,
        onCheckmate: null,
        onStalemate: null,
        onDraw: null,
        onPromotion: null,
        onTurnChange: null
    };

    // Initial board position
    const INITIAL_POSITION = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];

    // Direction vectors for piece movement
    const DIRECTIONS = {
        rook: [[0, 1], [0, -1], [1, 0], [-1, 0]],
        bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        queen: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        king: [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        knight: [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]
    };

    /**
     * Initialize a new game
     */
    function init(opponent = 'ai', playerColor = 'white') {
        board = INITIAL_POSITION.map(row => [...row]);

        state = {
            turn: 'white',
            selectedSquare: null,
            validMoves: [],
            lastMove: null,
            isCheck: false,
            isCheckmate: false,
            isStalemate: false,
            isDraw: false,
            gameOver: false,
            winner: null,
            castling: {
                whiteKingside: true,
                whiteQueenside: true,
                blackKingside: true,
                blackQueenside: true
            },
            enPassantTarget: null,
            halfMoveClock: 0,
            fullMoveNumber: 1,
            capturedWhite: [],
            capturedBlack: [],
            moveHistory: [],
            opponent: opponent,
            playerColor: playerColor,
            onMove: null,
            onCapture: null,
            onCheck: null,
            onCheckmate: null,
            onStalemate: null,
            onDraw: null,
            onPromotion: null,
            onTurnChange: null
        };

        return state;
    }

    /**
     * Set callbacks for game events
     */
    function setCallbacks(callbacks) {
        Object.keys(callbacks).forEach(key => {
            if (state.hasOwnProperty(key)) {
                state[key] = callbacks[key];
            }
        });
    }

    /**
     * Get current board state
     */
    function getBoard() {
        return board;
    }

    /**
     * Get current game state
     */
    function getState() {
        return state;
    }

    /**
     * Check if position is on board
     */
    function isOnBoard(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    /**
     * Get piece at position
     */
    function getPiece(row, col) {
        if (!isOnBoard(row, col)) return null;
        return board[row][col];
    }

    /**
     * Get piece color
     */
    function getPieceColor(piece) {
        if (!piece) return null;
        return piece === piece.toUpperCase() ? 'white' : 'black';
    }

    /**
     * Get piece type (lowercase)
     */
    function getPieceType(piece) {
        if (!piece) return null;
        return piece.toLowerCase();
    }

    /**
     * Find king position for a color
     */
    function findKing(color) {
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
     * Check if a square is attacked by opponent
     */
    function isSquareAttacked(row, col, byColor) {
        // Check for pawn attacks
        const pawnDir = byColor === 'white' ? 1 : -1;
        const pawn = byColor === 'white' ? 'P' : 'p';
        if (isOnBoard(row + pawnDir, col - 1) && board[row + pawnDir][col - 1] === pawn) return true;
        if (isOnBoard(row + pawnDir, col + 1) && board[row + pawnDir][col + 1] === pawn) return true;

        // Check for knight attacks
        const knight = byColor === 'white' ? 'N' : 'n';
        for (const [dr, dc] of DIRECTIONS.knight) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (isOnBoard(newRow, newCol) && board[newRow][newCol] === knight) {
                return true;
            }
        }

        // Check for king attacks
        const king = byColor === 'white' ? 'K' : 'k';
        for (const [dr, dc] of DIRECTIONS.king) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (isOnBoard(newRow, newCol) && board[newRow][newCol] === king) {
                return true;
            }
        }

        // Check for rook/queen attacks (straight lines)
        const rook = byColor === 'white' ? 'R' : 'r';
        const queen = byColor === 'white' ? 'Q' : 'q';
        for (const [dr, dc] of DIRECTIONS.rook) {
            let newRow = row + dr;
            let newCol = col + dc;
            while (isOnBoard(newRow, newCol)) {
                const piece = board[newRow][newCol];
                if (piece) {
                    if (piece === rook || piece === queen) return true;
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }

        // Check for bishop/queen attacks (diagonals)
        const bishop = byColor === 'white' ? 'B' : 'b';
        for (const [dr, dc] of DIRECTIONS.bishop) {
            let newRow = row + dr;
            let newCol = col + dc;
            while (isOnBoard(newRow, newCol)) {
                const piece = board[newRow][newCol];
                if (piece) {
                    if (piece === bishop || piece === queen) return true;
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }

        return false;
    }

    /**
     * Check if current player is in check
     */
    function isInCheck(color) {
        const kingPos = findKing(color);
        if (!kingPos) return false;
        const opponent = color === 'white' ? 'black' : 'white';
        return isSquareAttacked(kingPos.row, kingPos.col, opponent);
    }

    /**
     * Generate pseudo-legal moves (doesn't consider check)
     */
    function generatePseudoLegalMoves(row, col) {
        const piece = board[row][col];
        if (!piece) return [];

        const moves = [];
        const color = getPieceColor(piece);
        const type = getPieceType(piece);

        switch (type) {
            case 'p':
                // Pawn moves
                generatePawnMoves(row, col, color, moves);
                break;

            case 'n':
                // Knight moves
                for (const [dr, dc] of DIRECTIONS.knight) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (isOnBoard(newRow, newCol)) {
                        const target = board[newRow][newCol];
                        if (!target || getPieceColor(target) !== color) {
                            moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                        }
                    }
                }
                break;

            case 'b':
                // Bishop moves
                generateSlidingMoves(row, col, color, DIRECTIONS.bishop, moves);
                break;

            case 'r':
                // Rook moves
                generateSlidingMoves(row, col, color, DIRECTIONS.rook, moves);
                break;

            case 'q':
                // Queen moves
                generateSlidingMoves(row, col, color, DIRECTIONS.queen, moves);
                break;

            case 'k':
                // King moves
                for (const [dr, dc] of DIRECTIONS.king) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (isOnBoard(newRow, newCol)) {
                        const target = board[newRow][newCol];
                        if (!target || getPieceColor(target) !== color) {
                            moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                        }
                    }
                }
                // Castling
                generateCastlingMoves(row, col, color, moves);
                break;
        }

        return moves;
    }

    /**
     * Generate pawn moves
     */
    function generatePawnMoves(row, col, color, moves) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        const promotionRow = color === 'white' ? 0 : 7;

        // Forward move
        const oneForward = row + direction;
        if (isOnBoard(oneForward, col) && !board[oneForward][col]) {
            if (oneForward === promotionRow) {
                // Promotion
                ['q', 'r', 'b', 'n'].forEach(promoPiece => {
                    moves.push({
                        from: { row, col },
                        to: { row: oneForward, col },
                        promotion: promoPiece
                    });
                });
            } else {
                moves.push({ from: { row, col }, to: { row: oneForward, col } });
            }

            // Two squares forward from starting position
            if (row === startRow) {
                const twoForward = row + 2 * direction;
                if (!board[twoForward][col]) {
                    moves.push({ from: { row, col }, to: { row: twoForward, col }, isDoublePush: true });
                }
            }
        }

        // Captures
        for (const dc of [-1, 1]) {
            const newCol = col + dc;
            if (isOnBoard(oneForward, newCol)) {
                const target = board[oneForward][newCol];
                if (target && getPieceColor(target) !== color) {
                    if (oneForward === promotionRow) {
                        ['q', 'r', 'b', 'n'].forEach(promoPiece => {
                            moves.push({
                                from: { row, col },
                                to: { row: oneForward, col: newCol },
                                promotion: promoPiece,
                                capture: target
                            });
                        });
                    } else {
                        moves.push({ from: { row, col }, to: { row: oneForward, col: newCol }, capture: target });
                    }
                }

                // En passant
                if (state.enPassantTarget &&
                    state.enPassantTarget.row === oneForward &&
                    state.enPassantTarget.col === newCol) {
                    const capturedPawn = color === 'white' ? 'p' : 'P';
                    moves.push({
                        from: { row, col },
                        to: { row: oneForward, col: newCol },
                        enPassant: true,
                        capture: capturedPawn
                    });
                }
            }
        }
    }

    /**
     * Generate sliding piece moves (bishop, rook, queen)
     */
    function generateSlidingMoves(row, col, color, directions, moves) {
        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;
            while (isOnBoard(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (!target) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
                } else {
                    if (getPieceColor(target) !== color) {
                        moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, capture: target });
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }
    }

    /**
     * Generate castling moves
     */
    function generateCastlingMoves(row, col, color, moves) {
        if (isInCheck(color)) return;

        const kingRow = color === 'white' ? 7 : 0;
        const opponent = color === 'white' ? 'black' : 'white';

        // Kingside castling
        const canKingside = color === 'white' ? state.castling.whiteKingside : state.castling.blackKingside;
        if (canKingside) {
            if (!board[kingRow][5] && !board[kingRow][6]) {
                if (!isSquareAttacked(kingRow, 5, opponent) && !isSquareAttacked(kingRow, 6, opponent)) {
                    moves.push({
                        from: { row, col },
                        to: { row: kingRow, col: 6 },
                        castling: 'kingside'
                    });
                }
            }
        }

        // Queenside castling
        const canQueenside = color === 'white' ? state.castling.whiteQueenside : state.castling.blackQueenside;
        if (canQueenside) {
            if (!board[kingRow][1] && !board[kingRow][2] && !board[kingRow][3]) {
                if (!isSquareAttacked(kingRow, 2, opponent) && !isSquareAttacked(kingRow, 3, opponent)) {
                    moves.push({
                        from: { row, col },
                        to: { row: kingRow, col: 2 },
                        castling: 'queenside'
                    });
                }
            }
        }
    }

    /**
     * Generate legal moves (filters out moves that leave king in check)
     */
    function generateLegalMoves(row, col) {
        const pseudoMoves = generatePseudoLegalMoves(row, col);
        const color = getPieceColor(board[row][col]);

        return pseudoMoves.filter(move => {
            // Make the move temporarily
            const originalPiece = board[move.from.row][move.from.col];
            const capturedPiece = board[move.to.row][move.to.col];

            board[move.to.row][move.to.col] = originalPiece;
            board[move.from.row][move.from.col] = null;

            // Handle en passant capture
            let enPassantCaptured = null;
            if (move.enPassant) {
                const captureRow = color === 'white' ? move.to.row + 1 : move.to.row - 1;
                enPassantCaptured = board[captureRow][move.to.col];
                board[captureRow][move.to.col] = null;
            }

            // Check if king is in check
            const inCheck = isInCheck(color);

            // Restore the board
            board[move.from.row][move.from.col] = originalPiece;
            board[move.to.row][move.to.col] = capturedPiece;

            if (move.enPassant) {
                const captureRow = color === 'white' ? move.to.row + 1 : move.to.row - 1;
                board[captureRow][move.to.col] = enPassantCaptured;
            }

            return !inCheck;
        });
    }

    /**
     * Get all legal moves for a color
     */
    function getAllLegalMoves(color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && getPieceColor(piece) === color) {
                    moves.push(...generateLegalMoves(row, col));
                }
            }
        }
        return moves;
    }

    /**
     * Check if there are any legal moves for a color
     */
    function hasLegalMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && getPieceColor(piece) === color) {
                    if (generateLegalMoves(row, col).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Select a square
     */
    function selectSquare(row, col) {
        const piece = board[row][col];
        const pieceColor = getPieceColor(piece);

        // If clicking on own piece, select it
        if (piece && pieceColor === state.turn) {
            state.selectedSquare = { row, col };
            state.validMoves = generateLegalMoves(row, col);
            return { selected: true, validMoves: state.validMoves };
        }

        // If a piece is selected and clicking on valid move, make the move
        if (state.selectedSquare) {
            const move = state.validMoves.find(m =>
                m.to.row === row && m.to.col === col
            );

            if (move) {
                // Check for promotion
                if (move.promotion && state.onPromotion) {
                    return { needsPromotion: true, move: move };
                }

                makeMove(move);
                return { moved: true, move: move };
            }
        }

        // Deselect
        state.selectedSquare = null;
        state.validMoves = [];
        return { selected: false };
    }

    /**
     * Make a move
     */
    function makeMove(move, promotionPiece = 'q') {
        const piece = board[move.from.row][move.from.col];
        const color = getPieceColor(piece);
        const type = getPieceType(piece);

        // Store captured piece
        let captured = move.capture;
        if (!captured && board[move.to.row][move.to.col]) {
            captured = board[move.to.row][move.to.col];
        }

        // Handle en passant capture
        if (move.enPassant) {
            const captureRow = color === 'white' ? move.to.row + 1 : move.to.row - 1;
            captured = board[captureRow][move.to.col];
            board[captureRow][move.to.col] = null;
        }

        // Add to captured pieces
        if (captured) {
            if (getPieceColor(captured) === 'white') {
                state.capturedBlack.push(captured);
            } else {
                state.capturedWhite.push(captured);
            }
            if (state.onCapture) state.onCapture(captured);
        }

        // Move the piece
        let newPiece = piece;
        if (move.promotion) {
            newPiece = color === 'white' ? promotionPiece.toUpperCase() : promotionPiece.toLowerCase();
        }
        board[move.to.row][move.to.col] = newPiece;
        board[move.from.row][move.from.col] = null;

        // Handle castling
        if (move.castling) {
            const kingRow = color === 'white' ? 7 : 0;
            if (move.castling === 'kingside') {
                board[kingRow][5] = board[kingRow][7];
                board[kingRow][7] = null;
            } else {
                board[kingRow][3] = board[kingRow][0];
                board[kingRow][0] = null;
            }
        }

        // Update castling rights
        if (type === 'k') {
            if (color === 'white') {
                state.castling.whiteKingside = false;
                state.castling.whiteQueenside = false;
            } else {
                state.castling.blackKingside = false;
                state.castling.blackQueenside = false;
            }
        }
        if (type === 'r') {
            if (move.from.row === 7 && move.from.col === 0) state.castling.whiteQueenside = false;
            if (move.from.row === 7 && move.from.col === 7) state.castling.whiteKingside = false;
            if (move.from.row === 0 && move.from.col === 0) state.castling.blackQueenside = false;
            if (move.from.row === 0 && move.from.col === 7) state.castling.blackKingside = false;
        }

        // Update en passant target
        if (move.isDoublePush) {
            state.enPassantTarget = {
                row: (move.from.row + move.to.row) / 2,
                col: move.from.col
            };
        } else {
            state.enPassantTarget = null;
        }

        // Update move counters
        if (type === 'p' || captured) {
            state.halfMoveClock = 0;
        } else {
            state.halfMoveClock++;
        }
        if (color === 'black') {
            state.fullMoveNumber++;
        }

        // Store last move
        state.lastMove = move;

        // Add to move history
        const notation = getMoveNotation(move, piece, captured, promotionPiece);
        state.moveHistory.push({
            notation: notation,
            color: color,
            from: move.from,
            to: move.to
        });

        // Switch turns
        state.turn = state.turn === 'white' ? 'black' : 'white';

        // Check game state
        state.isCheck = isInCheck(state.turn);

        if (!hasLegalMoves(state.turn)) {
            if (state.isCheck) {
                state.isCheckmate = true;
                state.gameOver = true;
                state.winner = color;
                if (state.onCheckmate) state.onCheckmate(color);
            } else {
                state.isStalemate = true;
                state.gameOver = true;
                if (state.onStalemate) state.onStalemate();
            }
        } else if (state.isCheck) {
            if (state.onCheck) state.onCheck();
        }

        // Check for draw by 50-move rule
        if (state.halfMoveClock >= 100) {
            state.isDraw = true;
            state.gameOver = true;
            if (state.onDraw) state.onDraw('fifty-move');
        }

        // Clear selection
        state.selectedSquare = null;
        state.validMoves = [];

        if (state.onMove) state.onMove(move);
        if (state.onTurnChange) state.onTurnChange(state.turn);

        return state;
    }

    /**
     * Get algebraic notation for a move
     */
    function getMoveNotation(move, piece, captured, promotionPiece) {
        const files = 'abcdefgh';
        const ranks = '87654321';

        let notation = '';

        // Castling
        if (move.castling) {
            return move.castling === 'kingside' ? 'O-O' : 'O-O-O';
        }

        // Piece letter (not for pawns)
        const type = getPieceType(piece);
        if (type !== 'p') {
            notation += type.toUpperCase();
        }

        // Disambiguation (simplified - just use file for now)
        // Could be improved to check for ambiguous moves

        // Capture
        if (captured) {
            if (type === 'p') {
                notation += files[move.from.col];
            }
            notation += 'x';
        }

        // Destination
        notation += files[move.to.col] + ranks[move.to.row];

        // Promotion
        if (move.promotion) {
            notation += '=' + promotionPiece.toUpperCase();
        }

        // Check/checkmate indicators added after move is made
        return notation;
    }

    /**
     * Check for endgame (simplified - based on material)
     */
    function isEndgame() {
        let queens = 0;
        let minorPieces = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    const type = getPieceType(piece);
                    if (type === 'q') queens++;
                    if (type === 'n' || type === 'b') minorPieces++;
                }
            }
        }

        // Endgame if no queens or only one minor piece per side
        return queens === 0 || minorPieces <= 2;
    }

    /**
     * Get FEN string for current position
     */
    function getFEN() {
        let fen = '';

        // Board position
        for (let row = 0; row < 8; row++) {
            let empty = 0;
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += piece;
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (row < 7) fen += '/';
        }

        // Active color
        fen += ' ' + (state.turn === 'white' ? 'w' : 'b');

        // Castling availability
        let castling = '';
        if (state.castling.whiteKingside) castling += 'K';
        if (state.castling.whiteQueenside) castling += 'Q';
        if (state.castling.blackKingside) castling += 'k';
        if (state.castling.blackQueenside) castling += 'q';
        fen += ' ' + (castling || '-');

        // En passant target
        if (state.enPassantTarget) {
            const files = 'abcdefgh';
            const ranks = '87654321';
            fen += ' ' + files[state.enPassantTarget.col] + ranks[state.enPassantTarget.row];
        } else {
            fen += ' -';
        }

        // Halfmove clock and fullmove number
        fen += ' ' + state.halfMoveClock;
        fen += ' ' + state.fullMoveNumber;

        return fen;
    }

    /**
     * Load position from FEN string
     */
    function loadFEN(fen) {
        const parts = fen.split(' ');

        // Parse board position
        board = [];
        const rows = parts[0].split('/');
        for (const rowStr of rows) {
            const row = [];
            for (const char of rowStr) {
                if (/\d/.test(char)) {
                    for (let i = 0; i < parseInt(char); i++) {
                        row.push(null);
                    }
                } else {
                    row.push(char);
                }
            }
            board.push(row);
        }

        // Parse active color
        state.turn = parts[1] === 'w' ? 'white' : 'black';

        // Parse castling rights
        const castling = parts[2];
        state.castling.whiteKingside = castling.includes('K');
        state.castling.whiteQueenside = castling.includes('Q');
        state.castling.blackKingside = castling.includes('k');
        state.castling.blackQueenside = castling.includes('q');

        // Parse en passant target
        if (parts[3] !== '-') {
            const files = 'abcdefgh';
            state.enPassantTarget = {
                col: files.indexOf(parts[3][0]),
                row: 8 - parseInt(parts[3][1])
            };
        } else {
            state.enPassantTarget = null;
        }

        // Parse move counters
        state.halfMoveClock = parseInt(parts[4]) || 0;
        state.fullMoveNumber = parseInt(parts[5]) || 1;

        return state;
    }

    /**
     * Undo last move (simplified - just restart from beginning and replay)
     */
    function canUndo() {
        return state.moveHistory.length > 0;
    }

    // Public API
    return {
        init,
        setCallbacks,
        getBoard,
        getState,
        selectSquare,
        makeMove,
        generateLegalMoves,
        getAllLegalMoves,
        getPiece,
        getPieceColor,
        getPieceType,
        isInCheck,
        isSquareAttacked,
        findKing,
        isEndgame,
        getFEN,
        loadFEN,
        canUndo,
        PIECES
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
