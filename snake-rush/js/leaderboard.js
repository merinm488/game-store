/**
 * Snake Rush - Leaderboard Module
 * Handles player names, score tracking, and leaderboard display using TextDB
 */

import { setup, save, load } from '../../lib/textdbV1.js';

// ============================================================
// CONFIGURATION
// ============================================================

const LEADERBOARD_ID = 'snake-rush-leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;
const LOCAL_STORAGE_KEY = 'snakeRushPlayerName';

// ============================================================
// STATE
// ============================================================

let currentPlayerName = null;
let leaderboardData = null;
let onNameSetCallback = null; // Callback when player name is set

// ============================================================
// DOM ELEMENTS
// ============================================================

const elements = {
    playerNameModal: document.getElementById('playerNameModal'),
    playerNameInput: document.getElementById('playerNameInput'),
    savePlayerName: document.getElementById('savePlayerName'),
    playAsGuest: document.getElementById('playAsGuest'),
    leaderboardModal: document.getElementById('leaderboardModal'),
    leaderboardList: document.getElementById('leaderboardList'),
    closeLeaderboard: document.getElementById('closeLeaderboard'),
    leaderboardBtn: document.getElementById('leaderboardBtn'),
    currentPlayerDisplay: document.getElementById('currentPlayerDisplay'),
    changePlayerBtn: document.getElementById('changePlayerBtn')
};

// ============================================================
// INITIALIZATION
// ============================================================

async function initLeaderboard() {
    // Load player name from localStorage
    const savedName = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedName) {
        currentPlayerName = savedName;
        elements.playerNameInput.value = savedName;
    }

    // Update the player display
    updatePlayerDisplay();

    // Load leaderboard data from TextDB
    await refreshLeaderboardData();

    // Set up event listeners
    setupEventListeners();

    console.log('Leaderboard initialized');
}

async function refreshLeaderboardData() {
    try {
        const data = await load(LEADERBOARD_ID);
        const originalData = data || { leaderboard: [], lastUpdated: null };

        // Clean up duplicates (case-insensitive names, keep highest score)
        const originalLength = originalData.leaderboard.length;
        originalData.leaderboard = deduplicateLeaderboard(originalData.leaderboard);

        // If duplicates were removed, save the cleaned data
        if (originalData.leaderboard.length < originalLength) {
            console.log(`Cleaned up ${originalLength - originalData.leaderboard.length} duplicate entries`);
            await save(originalData, LEADERBOARD_ID);
        }

        leaderboardData = originalData;

        // Update main menu high score display with player's best from TextDB
        updateMenuHighScore();
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        leaderboardData = { leaderboard: [], lastUpdated: null };
    }
}

/**
 * Get the current player's best score from the leaderboard
 */
function getPlayerBestScore() {
    if (!leaderboardData || !currentPlayerName || currentPlayerName === 'Guest') {
        return null;
    }

    const normalizedName = currentPlayerName.toLowerCase();
    const playerEntry = leaderboardData.leaderboard.find(
        entry => entry.name.toLowerCase() === normalizedName
    );

    return playerEntry ? playerEntry.score : null;
}

/**
 * Get the overall best score from the leaderboard
 */
function getOverallBestScore() {
    if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
        return null;
    }
    return leaderboardData.leaderboard[0].score; // Already sorted by score descending
}

/**
 * Update the main menu high score display with TextDB data
 */
function updateMenuHighScore() {
    const highScoreMenu = document.getElementById('highScoreMenu');
    if (!highScoreMenu) return;

    const overallBest = getOverallBestScore();
    if (overallBest !== null) {
        highScoreMenu.textContent = overallBest;
    }
}

/**
 * Remove duplicate entries (case-insensitive names), keeping highest score for each player
 */
function deduplicateLeaderboard(entries) {
    const uniquePlayers = new Map();

    // Process entries in order (higher scores should come first if already sorted)
    entries.forEach(entry => {
        const normalizedName = entry.name.toLowerCase();
        const existing = uniquePlayers.get(normalizedName);

        if (!existing || entry.score > existing.score) {
            uniquePlayers.set(normalizedName, entry);
        }
    });

    // Convert back to array and sort by score
    const deduped = Array.from(uniquePlayers.values());
    deduped.sort((a, b) => b.score - a.score);

    return deduped;
}

function setupEventListeners() {
    // Player name modal
    elements.savePlayerName.addEventListener('click', handleSavePlayerName);
    elements.playAsGuest.addEventListener('click', handlePlayAsGuest);
    elements.playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSavePlayerName();
    });

    // Change player button
    if (elements.changePlayerBtn) {
        elements.changePlayerBtn.addEventListener('click', handleChangePlayer);
    }

    // Leaderboard modal
    elements.leaderboardBtn.addEventListener('click', showLeaderboard);
    elements.closeLeaderboard.addEventListener('click', hideLeaderboard);
    elements.leaderboardModal.addEventListener('click', (e) => {
        if (e.target === elements.leaderboardModal) hideLeaderboard();
    });
}

// ============================================================
// PLAYER NAME HANDLING
// ============================================================

function handleSavePlayerName() {
    const name = elements.playerNameInput.value.trim();
    if (name) {
        currentPlayerName = name;
        localStorage.setItem(LOCAL_STORAGE_KEY, name);
        hidePlayerNameModal();
        updatePlayerDisplay();
        // Call the callback if set
        if (onNameSetCallback) {
            onNameSetCallback();
            onNameSetCallback = null;
        }
    } else {
        elements.playerNameInput.focus();
    }
}

function handlePlayAsGuest() {
    currentPlayerName = 'Guest';
    localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear saved name for guest
    hidePlayerNameModal();
    updatePlayerDisplay();
    // Call the callback if set
    if (onNameSetCallback) {
        onNameSetCallback();
        onNameSetCallback = null;
    }
}

function showPlayerNameModal(callback = null) {
    onNameSetCallback = callback;
    elements.playerNameModal.classList.add('active');
    // Clear previous input and focus
    elements.playerNameInput.value = '';
    elements.playerNameInput.focus();
}

function handleChangePlayer() {
    // Clear current name and show prompt
    currentPlayerName = null;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    showPlayerNameModal(() => {
        updatePlayerDisplay();
    });
}

function updatePlayerDisplay() {
    if (elements.currentPlayerDisplay) {
        elements.currentPlayerDisplay.textContent = currentPlayerName || 'Guest';
    }
}

function hidePlayerNameModal() {
    elements.playerNameModal.classList.remove('active');
}

function getCurrentPlayerName() {
    return currentPlayerName;
}

// ============================================================
// LEADERBOARD DISPLAY
// ============================================================

async function showLeaderboard() {
    elements.leaderboardModal.classList.add('active');

    // Refresh data before showing
    await refreshLeaderboardData();
    renderLeaderboard();
}

function hideLeaderboard() {
    elements.leaderboardModal.classList.remove('active');
}

function renderLeaderboard() {
    if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
        elements.leaderboardList.innerHTML = `
            <div class="leaderboard-empty">
                <p>🏆 No scores yet!</p>
                <p>Be the first to make the leaderboard.</p>
            </div>
        `;
        return;
    }

    const html = leaderboardData.leaderboard.map((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const isCurrentPlayer = entry.name === currentPlayerName;
        const dateStr = entry.date ? new Date(entry.date).toLocaleDateString() : '';

        return `
            <div class="leaderboard-entry ${isCurrentPlayer ? 'current-player' : ''}">
                <span class="leaderboard-rank">${medal}</span>
                <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
                <span class="leaderboard-score">${entry.score}</span>
                <span class="leaderboard-mode">${getModeIcon(entry.mode)}</span>
            </div>
        `;
    }).join('');

    elements.leaderboardList.innerHTML = html;
}

function getModeIcon(mode) {
    const icons = {
        'endless': '♾️',
        'levels': '🎮',
        'time': '⏱️'
    };
    return icons[mode] || '🎮';
}

// ============================================================
// SCORE SUBMISSION
// ============================================================

async function submitScore(score, mode) {
    // If no player name set, prompt for it
    if (!currentPlayerName) {
        showPlayerNameModal();
        // Wait for player to enter name (simple polling)
        await waitForPlayerName();
    }

    // Don't save guest scores
    if (currentPlayerName === 'Guest') {
        console.log('Guest score not saved to leaderboard');
        return false;
    }

    // Refresh data
    await refreshLeaderboardData();

    // Check if player already exists (case-insensitive)
    const normalizedName = currentPlayerName.toLowerCase();
    const existingIndex = leaderboardData.leaderboard.findIndex(
        entry => entry.name.toLowerCase() === normalizedName
    );

    if (existingIndex !== -1) {
        // Player exists - update only if new score is higher
        const existingEntry = leaderboardData.leaderboard[existingIndex];
        if (score > existingEntry.score) {
            existingEntry.score = score;
            existingEntry.mode = mode;
            existingEntry.date = new Date().toISOString();
            console.log(`Updated ${currentPlayerName}'s score to ${score}`);
        } else {
            console.log(`${currentPlayerName}'s existing score (${existingEntry.score}) is higher than ${score}`);
        }
    } else {
        // New player - add entry
        const newEntry = {
            name: currentPlayerName,
            score: score,
            mode: mode,
            date: new Date().toISOString()
        };
        leaderboardData.leaderboard.push(newEntry);
        console.log('Added new player to leaderboard:', newEntry);
    }

    // Sort by score (descending)
    leaderboardData.leaderboard.sort((a, b) => b.score - a.score);

    // Keep only top entries
    leaderboardData.leaderboard = leaderboardData.leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    leaderboardData.lastUpdated = new Date().toISOString();

    // Save to TextDB
    const success = await save(leaderboardData, LEADERBOARD_ID);

    if (!success) {
        console.error('Failed to save score to leaderboard');
    }

    // Update main menu high score display
    updateMenuHighScore();

    return success;
}

function waitForPlayerName() {
    return new Promise((resolve) => {
        const checkName = () => {
            if (currentPlayerName) {
                resolve();
            } else {
                setTimeout(checkName, 100);
            }
        };
        checkName();
    });
}

// ============================================================
// UTILITIES
// ============================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// EXPOSE TO WINDOW (for non-module scripts)
// ============================================================

window.leaderboard = {
    init: initLeaderboard,
    submitScore: submitScore,
    getCurrentPlayerName: getCurrentPlayerName,
    showLeaderboard: showLeaderboard,
    hideLeaderboard: hideLeaderboard,
    showPlayerNamePrompt: showPlayerNameModal,
    updatePlayerDisplay: updatePlayerDisplay,
    updateMenuHighScore: updateMenuHighScore,
    getPlayerBestScore: getPlayerBestScore,
    getOverallBestScore: getOverallBestScore
};

// ============================================================
// AUTO-INITIALIZE
// ============================================================

// Module scripts are deferred, so DOMContentLoaded may have already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeaderboard);
} else {
    // DOM already loaded, run immediately
    initLeaderboard();
}
