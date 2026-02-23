// Global variable to store all games
let allGames = [];

// Games data (embedded to avoid CORS issues when opening file directly)
const gamesData = [
    {
        "title": "Snake Rush",
        "description": "A fast-paced snake game with classic gameplay",
        "emoji": "🐍",
        "icon": "./snake-rush/icons/icon-192.png",
        "url": "./snake-rush/"
    },
    {
        "title": "Minesweeper",
        "description": "Classic puzzle game - find all the mines without triggering them",
        "emoji": "💣",
        "icon": null,
        "url": "./minesweeper/"
    },
    {
        "title": "Sokoban",
        "description": "Push boxes to their target locations in this puzzle game",
        "emoji": "📦",
        "icon": "./sokoban/icons/icon-192x192.png",
        "url": "./sokoban/"
    },
    {
        "title": "Chess",
        "description": "Classic chess with adaptive AI opponent",
        "emoji": "♟️",
        "icon": "./chess/icons/icon-192.png",
        "url": "./chess/"
    },
    {
        "title": "Tetris",
        "description": "Classic puzzle game - stack blocks and clear lines",
        "emoji": "🧱",
        "icon": "./tetris/icons/icon-192.png",
        "url": "./tetris/"
    },
    {
        "title": "Word Puzzle",
        "description": "Create words from letters and test your vocabulary",
        "emoji": "📝",
        "icon": null,
        "url": "./word-puzzle/"
    }
];

// Load and render games
function loadGames() {
    const gamesGrid = document.getElementById('games-grid');
    allGames = gamesData;

    // Clear loading message
    gamesGrid.innerHTML = '';

    // Render each game
    renderGames(allGames);
}

// Render games to the grid
function renderGames(games) {
    const gamesGrid = document.getElementById('games-grid');
    gamesGrid.innerHTML = '';

    if (games.length === 0) {
        gamesGrid.innerHTML = `
            <div class="error">
                <h2>No games found</h2>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }

    games.forEach(game => {
        const gameCard = createGameCard(game);
        gamesGrid.appendChild(gameCard);
    });
}

// Search games
function searchGames(query) {
    const searchTerm = query.toLowerCase().trim();

    if (searchTerm === '') {
        renderGames(allGames);
        return;
    }

    const filteredGames = allGames.filter(game => {
        return game.title.toLowerCase().includes(searchTerm) ||
               game.description.toLowerCase().includes(searchTerm);
    });

    renderGames(filteredGames);
}

// Create a game card element - Mobile App Icon Style
function createGameCard(game) {
    // The entire card is a clickable link
    const card = document.createElement('a');
    card.className = 'game-card';
    card.href = game.url;

    // Game icon
    const icon = document.createElement('div');
    icon.className = 'game-icon';

    if (game.icon) {
        // Use actual PWA icon image
        const img = document.createElement('img');
        img.src = game.icon;
        img.alt = game.title;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = 'inherit';
        icon.appendChild(img);
    } else {
        // Fallback to emoji
        icon.textContent = game.emoji || '🎮';
    }

    // Game title
    const title = document.createElement('span');
    title.className = 'game-title';
    title.textContent = game.title;

    // Assemble card: icon + title
    card.appendChild(icon);
    card.appendChild(title);

    return card;
}

// Load games when page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    setupEventListeners();
});

// Setup event listeners for search and theme switching
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-btn');

    searchInput.addEventListener('input', (e) => {
        searchGames(e.target.value);
        updateClearButton();
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchGames('');
        searchInput.focus();
        updateClearButton();
    });

    searchBtn.addEventListener('click', () => {
        searchGames(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchGames(searchInput.value);
        }
    });

    // Settings dropdown
    const settingsBtn = document.getElementById('settings-btn');
    const themeMenu = document.getElementById('theme-menu');

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('show');
        settingsBtn.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.settings-dropdown')) {
            themeMenu.classList.remove('show');
            settingsBtn.classList.remove('active');
        }
    });

    // Theme switching
    const themeButtons = document.querySelectorAll('.theme-btn');

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('gameStoreTheme') || 'purple';
    setTheme(savedTheme);

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
            // Close dropdown after selecting theme
            themeMenu.classList.remove('show');
          settingsBtn.classList.remove('active');
        });
    });
}

// Update clear button visibility
function updateClearButton() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-btn');

    if (searchInput.value.length > 0) {
        clearBtn.classList.add('visible');
    } else {
        clearBtn.classList.remove('visible');
    }
}

// Set theme
function setTheme(themeName) {
    // Remove all theme classes
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-ocean');

    // Add selected theme class (except for default purple)
    if (themeName !== 'purple') {
        document.body.classList.add(`theme-${themeName}`);
    }

    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        }
    });

    // Save to localStorage
    localStorage.setItem('gameStoreTheme', themeName);
}
