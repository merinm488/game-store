// ============================================
// SOKOBAN LEVELS
// Progressive difficulty from easy to hard
// ============================================

// Legend:
// # = Wall
// @ = Player
// $ = Box
// . = Target
// * = Box on target
// + = Player on target
//   = Floor
// ^ = Up (player helper)
// v = Down (player helper)
// < = Left (player helper)
// > = Right (player helper)

const levels = [
    // Level 1 - Tutorial: One box, straight line
    {
        id: 1,
        name: "First Steps",
        map: [
            "#####",
            "#@  #",
            "# $ #",
            "#  .#",
            "#####"
        ]
    },

    // Level 2 - Tutorial: Two boxes in a row
    {
        id: 2,
        name: "Double Push",
        map: [
            "######",
            "#@   #",
            "# $$ #",
            "#  ..#",
            "######"
        ]
    },

    // Level 3 - Tutorial: Corner introduction
    {
        id: 3,
        name: "Corner Turn",
        map: [
            "#######",
            "#     #",
            "# .$ .#",
            "#  $  #",
            "#  @  #",
            "#######"
        ]
    },

    // Level 4 - Easy: Three boxes, simple positioning
    {
        id: 4,
        name: "Triple Threat",
        map: [
            "########",
            "#  ... #",
            "# $$$  #",
            "#  @   #",
            "########"
        ]
    },

    // Level 5 - Easy: Introduction to maneuvering
    {
        id: 5,
        name: "Around the Corner",
        map: [
            "  ####  ",
            "###  ###",
            "# @  $ #",
            "#   # .#",
            "# $  . #",
            "########"
        ]
    },

    // Level 6 - Easy-Medium: First challenge with planning
    {
        id: 6,
        name: "Plan Ahead",
        map: [
            "#########",
            "#  ...  #",
            "# $$$   #",
            "#   @   #",
            "#########"
        ]
    },

    // Level 7 - Easy-Medium: Boxes need repositioning
    {
        id: 7,
        name: "Reposition",
        map: [
            " ###### ",
            " #    # ",
            "## $  # ",
            "#  $ # #",
            "# .. # #",
            "#  @### ",
            "####    "
        ]
    },

    // Level 8 - Medium: Compact puzzle
    {
        id: 8,
        name: "Compact",
        map: [
            "#######",
            "#  .  #",
            "# $.$ #",
            "#  $  #",
            "# .@  #",
            "#######"
        ]
    },

    // Level 9 - Medium: Small maze
    {
        id: 9,
        name: "Little Maze",
        map: [
            "  #####",
            "###   #",
            "#@$ $ #",
            "# ### #",
            "#  .. #",
            "####   #",
            "   #####"
        ]
    },

    // Level 10 - Medium: Tight spaces challenge
    {
        id: 10,
        name: "Squeeze",
        map: [
            " ######",
            " #.. . #",
            "## #  #",
            "# $ $ #",
            "#  $. #",
            "##$ @ #",
            " ####"
        ]
    },

    // Level 11 - Medium-Hard: More complex layout
    {
        id: 11,
        name: "Four Play",
        map: [
            "#########",
            "#  .... #",
            "# $ $ $ #",
            "#   $   #",
            "#   @   #",
            "#########"
        ]
    },

    // Level 12 - Medium-Hard: Obstacles introduced
    {
        id: 12,
        name: "Obstacles",
        map: [
            " ########",
            " #  .  . #",
            "## # ## #",
            "# $ $ $ #",
            "#  .@   #",
            "#########"
        ]
    },

    // Level 13 - Medium-Hard: Complex maneuvering
    {
        id: 13,
        name: "Warehouse",
        map: [
            "  ######",
            " #.... #",
            "### #  #",
            "# $ $ ##",
            "# $ $ # ",
            "#  @ # ",
            "###### "
        ]
    },

    // Level 14 - Hard: Strategic planning required
    {
        id: 14,
        name: "Strategy",
        map: [
            "#########",
            "# .... ..#",
            "# ### # #",
            "# $ $ $ #",
            "# $ $ $ #",
            "#  @    #",
            "#########"
        ]
    },

    // Level 15 - Hard: Final challenge
    {
        id: 15,
        name: "Mastery",
        map: [
            " ########",
            " # ... # ",
            " ##$.$## ",
            " #  $  # ",
            " #$ $.$ # ",
            " #  @ .# ",
            " ########"
        ]
    }
];

// Helper function to parse level maps
function parseLevel(level) {
    const map = level.map;
    let player = null;
    let boxes = [];
    let targets = [];
    let walls = [];
    let maxWidth = 0;

    for (let y = 0; y < map.length; y++) {
        const row = map[y];
        if (row.length > maxWidth) {
            maxWidth = row.length;
        }

        for (let x = 0; x < row.length; x++) {
            const char = row[x];

            switch (char) {
                case '#':
                    walls.push({ x, y });
                    break;
                case '@':
                    player = { x, y };
                    break;
                case '+':
                    player = { x, y };
                    targets.push({ x, y });
                    break;
                case '$':
                    boxes.push({ x, y, onTarget: false });
                    break;
                case '*':
                    boxes.push({ x, y, onTarget: true });
                    targets.push({ x, y });
                    break;
                case '.':
                    targets.push({ x, y });
                    break;
            }
        }
    }

    return {
        id: level.id,
        name: level.name,
        width: maxWidth,
        height: map.length,
        player,
        boxes,
        targets,
        walls
    };
}

// Load saved best scores from localStorage
function loadBestScores() {
    const saved = localStorage.getItem('sokoban-best-scores');
    if (saved) {
        return JSON.parse(saved);
    }

    // Initialize with empty scores for all levels
    const scores = {};
    levels.forEach(level => {
        scores[level.id] = {
            bestMoves: null,
            bestTime: null
        };
    });
    localStorage.setItem('sokoban-best-scores', JSON.stringify(scores));
    return scores;
}

// Save best score for a level
function saveBestScore(levelId, moves, time) {
    const scores = loadBestScores();

    if (!scores[levelId]) {
        scores[levelId] = { bestMoves: null, bestTime: null };
    }

    let newBestMoves = false;
    let newBestTime = false;

    // Check for best moves
    if (scores[levelId].bestMoves === null || moves < scores[levelId].bestMoves) {
        scores[levelId].bestMoves = moves;
        newBestMoves = true;
    }

    // Check for best time (time is in seconds)
    if (scores[levelId].bestTime === null || time < scores[levelId].bestTime) {
        scores[levelId].bestTime = time;
        newBestTime = true;
    }

    localStorage.setItem('sokoban-best-scores', JSON.stringify(scores));

    return { newBestMoves, newBestTime };
}

// Get best score for a level
function getBestScore(levelId) {
    const scores = loadBestScores();
    return scores[levelId] || { bestMoves: null, bestTime: null };
}

// Format time as mm:ss
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
