/**
 * Tetris Pieces (Tetrominos)
 * Standard 7 pieces with rotation states and SRS wall kicks
 */

const PIECES = {
    I: {
        name: 'I',
        color: '#00f0f0', // Cyan
        // Rotation states (0, 90, 180, 270 degrees clockwise)
        states: [
            // State 0 - horizontal
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            // State 1 - vertical
            [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0]
            ],
            // State 2 - horizontal (inverted)
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0]
            ],
            // State 3 - vertical (inverted)
            [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0]
            ]
        ],
        size: 4
    },
    O: {
        name: 'O',
        color: '#f0f000', // Yellow
        // O piece doesn't rotate (all states are the same)
        states: [
            [
                [1, 1],
                [1, 1]
            ],
            [
                [1, 1],
                [1, 1]
            ],
            [
                [1, 1],
                [1, 1]
            ],
            [
                [1, 1],
                [1, 1]
            ]
        ],
        size: 2
    },
    T: {
        name: 'T',
        color: '#a000f0', // Purple
        states: [
            // State 0 - T pointing up
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            // State 1 - T pointing right
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 1, 0]
            ],
            // State 2 - T pointing down
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ],
            // State 3 - T pointing left
            [
                [0, 1, 0],
                [1, 1, 0],
                [0, 1, 0]
            ]
        ],
        size: 3
    },
    S: {
        name: 'S',
        color: '#00f000', // Green
        states: [
            // State 0
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            // State 1
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 0, 1]
            ],
            // State 2
            [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0]
            ],
            // State 3
            [
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0]
            ]
        ],
        size: 3
    },
    Z: {
        name: 'Z',
        color: '#f00000', // Red
        states: [
            // State 0
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            // State 1
            [
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0]
            ],
            // State 2
            [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1]
            ],
            // State 3
            [
                [0, 1, 0],
                [1, 1, 0],
                [1, 0, 0]
            ]
        ],
        size: 3
    },
    J: {
        name: 'J',
        color: '#0000f0', // Blue
        states: [
            // State 0
            [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            // State 1
            [
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
            ],
            // State 2
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1]
            ],
            // State 3
            [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0]
            ]
        ],
        size: 3
    },
    L: {
        name: 'L',
        color: '#f0a000', // Orange
        states: [
            // State 0
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            // State 1
            [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1]
            ],
            // State 2
            [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0]
            ],
            // State 3
            [
                [1, 1, 0],
                [0, 1, 0],
                [0, 1, 0]
            ]
        ],
        size: 3
    }
};

// Piece types array for random selection
const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * SRS Wall Kick Data
 * Format: [test1, test2, test3, test4] where each test is [x_offset, y_offset]
 * y_offset is positive for upward movement
 */
const WALL_KICKS = {
    // J, L, S, T, Z pieces (3x3 bounding box)
    JLSTZ: {
        '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
        '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
    },
    // I piece (4x4 bounding box) - different kick data
    I: {
        '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
        '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
    }
};

// O piece doesn't need wall kicks (it doesn't really rotate)
const WALL_KICKS_O = [[0, 0]];

/**
 * Get wall kick data for a piece type and rotation
 */
function getWallKicks(pieceType, fromRotation, toRotation) {
    if (pieceType === 'O') {
        return WALL_KICKS_O;
    }

    const kickData = pieceType === 'I' ? WALL_KICKS.I : WALL_KICKS.JLSTZ;
    const key = `${fromRotation}->${toRotation}`;

    return kickData[key] || [[0, 0]];
}

/**
 * Get piece color by type
 */
function getPieceColor(pieceType) {
    return PIECES[pieceType]?.color || '#ffffff';
}

/**
 * Get piece matrix for a specific rotation state
 */
function getPieceMatrix(pieceType, rotation = 0) {
    const piece = PIECES[pieceType];
    if (!piece) return null;

    const normalizedRotation = ((rotation % 4) + 4) % 4;
    return piece.states[normalizedRotation];
}

/**
 * Get piece size (dimension)
 */
function getPieceSize(pieceType) {
    return PIECES[pieceType]?.size || 3;
}

/**
 * Create a new piece object
 */
function createPiece(type) {
    const piece = PIECES[type];
    if (!piece) return null;

    return {
        type: type,
        rotation: 0,
        x: Math.floor((10 - piece.size) / 2), // Center horizontally
        y: piece.size === 4 ? -1 : 0, // I piece starts higher
        matrix: piece.states[0],
        color: piece.color,
        size: piece.size
    };
}

/**
 * Rotate a piece (returns new rotation state)
 * @param {number} currentRotation - Current rotation (0-3)
 * @param {boolean} clockwise - True for clockwise, false for counter-clockwise
 * @returns {number} New rotation state
 */
function rotateDirection(currentRotation, clockwise = true) {
    if (clockwise) {
        return (currentRotation + 1) % 4;
    } else {
        return ((currentRotation - 1) + 4) % 4;
    }
}

/**
 * T-Spin Detection
 * Check if the current position is a T-Spin
 * @param {Array} board - Game board
 * @param {Object} piece - Current piece
 * @returns {boolean} True if T-Spin
 */
function detectTSpin(board, piece) {
    if (piece.type !== 'T') return false;

    // Check the 4 corners around the T piece center
    const centerX = piece.x + 1;
    const centerY = piece.y + 1;

    let filledCorners = 0;

    // Check all 4 corners
    const corners = [
        [centerX - 1, centerY - 1], // Top-left
        [centerX + 1, centerY - 1], // Top-right
        [centerX - 1, centerY + 1], // Bottom-left
        [centerX + 1, centerY + 1]  // Bottom-right
    ];

    for (const [cx, cy] of corners) {
        // Check if position is out of bounds or filled
        if (cx < 0 || cx >= 10 || cy < 0 || cy >= 24) {
            filledCorners++;
        } else if (board[cy] && board[cy][cx]) {
            filledCorners++;
        }
    }

    // T-Spin requires at least 3 filled corners
    return filledCorners >= 3;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PIECES,
        PIECE_TYPES,
        getWallKicks,
        getPieceColor,
        getPieceMatrix,
        getPieceSize,
        createPiece,
        rotateDirection,
        detectTSpin
    };
}
