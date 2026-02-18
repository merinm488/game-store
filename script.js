// Global variable to store all games
let allGames = [];

// Fetch and render games from list.json
async function loadGames() {
    const gamesGrid = document.getElementById('games-grid');

    try {
        const response = await fetch('list.json');

        if (!response.ok) {
            throw new Error('Failed to load games list');
        }

        allGames = await response.json();

        // Clear loading message
        gamesGrid.innerHTML = '';

        // Render each game
        renderGames(allGames);

    } catch (error) {
        console.error('Error loading games:', error);
        gamesGrid.innerHTML = `
            <div class="error">
                <h2>Oops! Something went wrong</h2>
                <p>Unable to load games. Please refresh the page or try again later.</p>
            </div>
        `;
    }
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

// Create a game card element
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';

    // Game icon
    const icon = document.createElement('div');
    icon.className = 'game-icon';
    icon.textContent = game.emoji || '🎮';

    // Game content wrapper
    const content = document.createElement('div');
    content.className = 'game-content';

    // Game title
    const title = document.createElement('h2');
    title.className = 'game-title';
    title.textContent = game.title;

    // Game description
    const description = document.createElement('p');
    description.className = 'game-description';
    description.textContent = game.description;

    // Play button
    const playButton = document.createElement('a');
    playButton.className = 'play-button';
    playButton.href = game.url;
    playButton.textContent = 'Play Now';
    playButton.target = '_blank';
    playButton.rel = 'noopener noreferrer';

    // Assemble content
    content.appendChild(title);
    content.appendChild(description);

    // Assemble card: icon, content, button
    card.appendChild(icon);
    card.appendChild(content);
    card.appendChild(playButton);

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
