/**
 * Chess Pieces - SVG Definitions and Piece Square Tables
 * Based on research from Zhang Zeyu's chess AI guide
 */

const PIECES = {
    // Piece values from research (Zhang Zeyu)
    VALUES: {
        'p': 100,   // Pawn
        'n': 280,   // Knight
        'b': 320,   // Bishop
        'r': 479,   // Rook
        'q': 929,   // Queen
        'k': 60000, // King (high value for checkmate detection)
        'k_e': 60000 // Endgame king
    },

    // Piece Square Tables (PSTs) from research
    // These give bonus/penalty based on piece position
    // Values are from white's perspective, flipped for black

    // Pawn PST - Encourages central pawns and advancement
    PAWN_TABLE: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ],

    // Knight PST - Knights better in center, worse on edges
    KNIGHT_TABLE: [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ],

    // Bishop PST - Bishops better on long diagonals
    BISHOP_TABLE: [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ],

    // Rook PST - Rooks better on open files and 7th rank
    ROOK_TABLE: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
    ],

    // Queen PST - Queen active but not too exposed early
    QUEEN_TABLE: [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ],

    // King PST (middlegame) - King safety, stay corner/behind pawns
    KING_TABLE: [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
    ],

    // King PST (endgame) - King should be active
    KING_ENDGAME_TABLE: [
        [-50,-40,-30,-20,-20,-30,-40,-50],
        [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50]
    ],

    // SVG Paths for chess pieces - Standard 45x45 viewBox
    SVG_PATHS: {
        // King
        'K': 'M22.5 11.63V6M22.5 25v6.5m-6.5-3.25h13M13 12h19l-2.25 19.5H15.25L13 12zm4.5-3.5h10',

        // Queen
        'Q': 'M8 12l3.5 16.5h22L37 12l-4.5 4.5L28 12l-4.5 4.5L19 12l-4.5 4.5L10 12zm1.5 21h25l1.5 6.5H8l2-6.5z',

        // Rook
        'R': 'M9 39h27v-3H9v3zm2.5-6h22l1.5-20H10l1.5 20zm2-24h3v4h-3v-4zm7 0h3v4h-3v-4zm7 0h3v4h-3v-4z',

        // Bishop
        'B': 'M24 4c2 0 3.5 1.5 3.5 3.5 0 1-.5 2-1.25 2.5L27 12l6 7.5L24 27l-9-7.5L21 12l.75-2c-.75-.5-1.25-1.5-1.25-2.5C20.5 5.5 22 4 24 4zM12 37h24l-3-8H15l-3 8z',

        // Knight
        'N': 'M19 22c-2 4-5 6-9 7l2 7h24l2-7c-4-1-7-3-9-7l-2-4c0-3 2-5 4-7 0 3 1 5 3 6 2-3 2-7 0-10-3 0-6 2-8 4l-1 1c-2 2-4 3-6 3z',

        // Pawn
        'P': 'M24 6a5 5 0 015 5c0 2-1.25 3.75-3 4.5V20h6v4h-3v12h3v4H15v-4h3V24h-3v-4h6v-4.5c-1.75-.75-3-2.5-3-4.5a5 5 0 015-5z',

        // Black pieces use same paths
        'k': 'M22.5 11.63V6M22.5 25v6.5m-6.5-3.25h13M13 12h19l-2.25 19.5H15.25L13 12zm4.5-3.5h10',

        'q': 'M8 12l3.5 16.5h22L37 12l-4.5 4.5L28 12l-4.5 4.5L19 12l-4.5 4.5L10 12zm1.5 21h25l1.5 6.5H8l2-6.5z',

        'r': 'M9 39h27v-3H9v3zm2.5-6h22l1.5-20H10l1.5 20zm2-24h3v4h-3v-4zm7 0h3v4h-3v-4zm7 0h3v4h-3v-4z',

        'b': 'M24 4c2 0 3.5 1.5 3.5 3.5 0 1-.5 2-1.25 2.5L27 12l6 7.5L24 27l-9-7.5L21 12l.75-2c-.75-.5-1.25-1.5-1.25-2.5C20.5 5.5 22 4 24 4zM12 37h24l-3-8H15l-3 8z',

        'n': 'M19 22c-2 4-5 6-9 7l2 7h24l2-7c-4-1-7-3-9-7l-2-4c0-3 2-5 4-7 0 3 1 5 3 6 2-3 2-7 0-10-3 0-6 2-8 4l-1 1c-2 2-4 3-6 3z',

        'p': 'M24 6a5 5 0 015 5c0 2-1.25 3.75-3 4.5V20h6v4h-3v12h3v4H15v-4h3V24h-3v-4h6v-4.5c-1.75-.75-3-2.5-3-4.5a5 5 0 015-5z'
    },

    // Piece Unicode symbols for captured pieces display
    UNICODE: {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    },

    // Get PST for a piece type
    getPST(pieceType, isEndgame = false) {
        const type = pieceType.toLowerCase();

        switch (type) {
            case 'p': return this.PAWN_TABLE;
            case 'n': return this.KNIGHT_TABLE;
            case 'b': return this.BISHOP_TABLE;
            case 'r': return this.ROOK_TABLE;
            case 'q': return this.QUEEN_TABLE;
            case 'k': return isEndgame ? this.KING_ENDGAME_TABLE : this.KING_TABLE;
            default: return null;
        }
    },

    // Get piece value
    getValue(pieceType, isEndgame = false) {
        const type = pieceType.toLowerCase();
        if (type === 'k' && isEndgame) {
            return this.VALUES['k_e'];
        }
        return this.VALUES[type] || 0;
    },

    // Create SVG element for a piece using solid Unicode symbols
    createSVG(pieceType, size = 45) {
        const isWhite = pieceType === pieceType.toUpperCase();
        const type = pieceType.toLowerCase();

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 45 45');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.classList.add('piece', isWhite ? 'white' : 'black');

        // Use solid black chess symbols for both colors
        // Black symbols are solid/filled, so they can be colored any way we want
        const solidSymbols = {
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '50%');
        text.setAttribute('y', '50%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('font-size', '38');
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.textContent = solidSymbols[type];

        if (isWhite) {
            text.setAttribute('fill', '#fff');
            text.setAttribute('stroke', '#333');
            text.setAttribute('stroke-width', '1');
        } else {
            text.setAttribute('fill', '#333');
            text.setAttribute('stroke', '#000');
            text.setAttribute('stroke-width', '0.5');
        }

        svg.appendChild(text);
        return svg;
    },

    // Get Unicode symbol for piece
    getUnicode(pieceType) {
        return this.UNICODE[pieceType] || '';
    },

    // Check if piece is white
    isWhite(pieceType) {
        return pieceType === pieceType.toUpperCase();
    },

    // Check if piece is black
    isBlack(pieceType) {
        return pieceType === pieceType.toLowerCase();
    },

    // Get piece color ('white' or 'black')
    getColor(pieceType) {
        if (!pieceType) return null;
        return this.isWhite(pieceType) ? 'white' : 'black';
    },

    // Get opposite color
    getOppositeColor(color) {
        return color === 'white' ? 'black' : 'white';
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PIECES;
}
