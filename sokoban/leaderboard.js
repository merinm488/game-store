/**
 * Sokoban - Leaderboard Module
 * Handles player names, score tracking, and leaderboard display using TextDB
 */

import { setup, save, load } from '../lib/textdbV1.js';

// ============================================================
// CONFIGURATION
// ============================================================

const LEADERBOARD_ID = 'sokoban-leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;
const LOCAL_STORAGE_KEY = 'sokobanPlayerName';

// ============================================================
// STATE
// ============================================================

let currentPlayerName = null;
let leaderboardData = null;
let onNameSetCallback = null;

// ============================================================
// DOM ELEMENTS
// ============================================================

const elements = {
    playerNameModal: null,
    playerNameInput: null,
    savePlayerName: null,
    playAsGuest: null,
    leaderboardModal: null,
    leaderboardList: null,
    closeLeaderboard: null,
    leaderboardBtn: null,
    currentPlayerDisplay: null,
    changePlayerBtn: null
};

// ============================================================
// INITIALIZATION
// ============================================================

async function initLeaderboard() {
    console.log('Sokoban Leaderboard: Starting initialization...');

    try {
        // Cache DOM elements
        elements.playerNameModal = document.getElementById('player-name-modal');
        elements.playerNameInput = document.getElementById('player-name-input');
        elements.savePlayerName = document.getElementById('save-player-name');
        elements.playAsGuest = document.getElementById('play-as-guest');
        elements.leaderboardModal = document.getElementById('leaderboard-modal');
        elements.leaderboardList = document.getElementById('leaderboard-list');
        elements.closeLeaderboard = document.getElementById('close-leaderboard');
        elements.leaderboardBtn = document.getElementById('leaderboard-btn');
        elements.currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
        elements.changePlayerBtn = document.getElementById('change-player-btn');

        console.log('Sokoban Leaderboard: DOM elements cached', {
            leaderboardBtn: !!elements.leaderboardBtn,
            playerNameModal: !!elements.playerNameModal
        });

        // Load player name from localStorage
        const savedName = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedName) {
            currentPlayerName = savedName;
            if (elements.playerNameInput) {
                elements.playerNameInput.value = savedName;
            }
        }

        // Update the player display
        updatePlayerDisplay();

        // Load leaderboard data from TextDB
        await refreshLeaderboardData();

        // Set up event listeners
        setupEventListeners();

        console.log('Sokoban Leaderboard initialized');
    } catch (error) {
        console.error('Sokoban Leaderboard initialization error:', error);
    }
}

async function refreshLeaderboardData() {
    try {
        console.log('Sokoban Leaderboard: Loading data from TextDB...');
        const data = await load(LEADERBOARD_ID);
        console.log('Sokoban Leaderboard: Data loaded', data);

        // Handle null, undefined, or invalid data
        let originalData;
        if (!data || typeof data !== 'object') {
            originalData = { leaderboard: [], lastUpdated: null };
        } else if (!Array.isArray(data.leaderboard)) {
            originalData = { leaderboard: [], lastUpdated: data.lastUpdated || null };
        } else {
            originalData = data;
        }

        // Clean up duplicates (case-insensitive names, keep best score)
        const originalLength = originalData.leaderboard.length;
        originalData.leaderboard = deduplicateLeaderboard(originalData.leaderboard);

        // If duplicates were removed, save the cleaned data
        if (originalData.leaderboard.length < originalLength) {
            console.log(`Cleaned up ${originalLength - originalData.leaderboard.length} duplicate entries`);
            await save(originalData, LEADERBOARD_ID);
        }

        leaderboardData = originalData;

        // Update main menu best score display with overall best from TextDB
        updateMenuBestStats();
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        leaderboardData = { leaderboard: [], lastUpdated: null };
    }
}

/**
 * Remove duplicate entries (case-insensitive names), keeping best score for each player
 */
function deduplicateLeaderboard(entries) {
    const uniquePlayers = new Map();

    entries.forEach(entry => {
        const normalizedName = entry.name.toLowerCase();
        const existing = uniquePlayers.get(normalizedName);

        if (!existing) {
            uniquePlayers.set(normalizedName, entry);
        } else {
            // Compare: prefer higher level, then fewer moves, then less time
            if (entry.level > existing.level) {
                uniquePlayers.set(normalizedName, entry);
            } else if (entry.level === existing.level) {
                if (entry.moves < existing.moves) {
                    uniquePlayers.set(normalizedName, entry);
                } else if (entry.moves === existing.moves && entry.time < existing.time) {
                    uniquePlayers.set(normalizedName, entry);
                }
            }
        }
    });

    const deduped = Array.from(uniquePlayers.values());
    // Sort by level (descending), then moves (ascending), then time (ascending)
    deduped.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        if (a.moves !== b.moves) return a.moves - b.moves;
        return a.time - b.time;
    });

    return deduped;
}

function setupEventListeners() {
    // Player name modal
    if (elements.savePlayerName) {
        elements.savePlayerName.addEventListener('click', handleSavePlayerName);
    }
    if (elements.playAsGuest) {
        elements.playAsGuest.addEventListener('click', handlePlayAsGuest);
    }
    if (elements.playerNameInput) {
        elements.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSavePlayerName();
        });
    }

    // Change player button
    if (elements.changePlayerBtn) {
        elements.changePlayerBtn.addEventListener('click', handleChangePlayer);
    }

    // Leaderboard modal
    if (elements.leaderboardBtn) {
        elements.leaderboardBtn.addEventListener('click', showLeaderboard);
    }
    if (elements.closeLeaderboard) {
        elements.closeLeaderboard.addEventListener('click', hideLeaderboard);
    }
    if (elements.leaderboardModal) {
        elements.leaderboardModal.addEventListener('click', (e) => {
            if (e.target === elements.leaderboardModal) hideLeaderboard();
        });
    }

    console.log('Sokoban Leaderboard event listeners set up');
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
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    hidePlayerNameModal();
    updatePlayerDisplay();
    if (onNameSetCallback) {
        onNameSetCallback();
        onNameSetCallback = null;
    }
}

function handleChangePlayer() {
    currentPlayerName = null;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    showPlayerNameModal(() => {
        updatePlayerDisplay();
    });
}

function showPlayerNameModal(callback = null) {
    onNameSetCallback = callback;
    elements.playerNameModal.classList.remove('hidden');
    elements.playerNameInput.value = '';
    elements.playerNameInput.focus();
}

function hidePlayerNameModal() {
    elements.playerNameModal.classList.add('hidden');
}

function updatePlayerDisplay() {
    if (elements.currentPlayerDisplay) {
        elements.currentPlayerDisplay.textContent = currentPlayerName || 'Guest';
    }
}

function getCurrentPlayerName() {
    return currentPlayerName;
}

// ============================================================
// LEADERBOARD DISPLAY
// ============================================================

async function showLeaderboard() {
    elements.leaderboardModal.classList.remove('hidden');

    // Refresh data before showing
    await refreshLeaderboardData();
    renderLeaderboard();
}

function hideLeaderboard() {
    elements.leaderboardModal.classList.add('hidden');
}

function renderLeaderboard() {
    if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
        elements.leaderboardList.innerHTML = `
            <div class="leaderboard-empty">
                <p>🏆 No scores yet!</p>
                <p>Be the first on the scoreboard.</p>
            </div>
        `;
        return;
    }

    const html = leaderboardData.leaderboard.map((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const isCurrentPlayer = entry.name.toLowerCase() === (currentPlayerName || '').toLowerCase();
        const timeStr = formatTime(entry.time);

        return `
            <div class="leaderboard-entry ${isCurrentPlayer ? 'current-player' : ''}">
                <span class="leaderboard-rank">${medal}</span>
                <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
                <span class="leaderboard-level">Lv.${entry.level}</span>
                <span class="leaderboard-moves">${entry.moves} moves</span>
                <span class="leaderboard-time">${timeStr}</span>
            </div>
        `;
    }).join('');

    elements.leaderboardList.innerHTML = html;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================
// SCORE SUBMISSION
// ============================================================

async function submitScore(level, moves, time) {
    // If no player name set, prompt for it
    if (!currentPlayerName) {
        showPlayerNameModal();
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
        // Player exists - update only if new score is better
        const existingEntry = leaderboardData.leaderboard[existingIndex];

        // Better = higher level, or same level with fewer moves, or same level and moves with less time
        const isBetter =
            level > existingEntry.level ||
            (level === existingEntry.level && moves < existingEntry.moves) ||
            (level === existingEntry.level && moves === existingEntry.moves && time < existingEntry.time);

        if (isBetter) {
            existingEntry.level = level;
            existingEntry.moves = moves;
            existingEntry.time = time;
            existingEntry.date = new Date().toISOString();
            console.log(`Updated ${currentPlayerName}'s score to Level ${level}, ${moves} moves, ${time}s`);
        } else {
            console.log(`${currentPlayerName}'s existing score is better`);
        }
    } else {
        // New player - add entry
        const newEntry = {
            name: currentPlayerName,
            level: level,
            moves: moves,
            time: time,
            date: new Date().toISOString()
        };
        leaderboardData.leaderboard.push(newEntry);
        console.log('Added new player to leaderboard:', newEntry);
    }

    // Sort by level (descending), then moves (ascending), then time (ascending)
    leaderboardData.leaderboard.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level;
        if (a.moves !== b.moves) return a.moves - b.moves;
        return a.time - b.time;
    });

    // Keep only top entries
    leaderboardData.leaderboard = leaderboardData.leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    leaderboardData.lastUpdated = new Date().toISOString();

    // Save to TextDB
    const success = await save(leaderboardData, LEADERBOARD_ID);

    if (!success) {
        console.error('Failed to save score to leaderboard');
    }

    // Update main menu best score display
    updateMenuBestStats();

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
// BEST STATS FROM TEXTDB
// ============================================================

/**
 * Get the overall best stats from the leaderboard
 */
function getOverallBestStats() {
    if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
        return null;
    }
    // Return the top entry (highest level, fewest moves, least time)
    return leaderboardData.leaderboard[0];
}

/**
 * Update the main menu best stats display with TextDB data
 */
function updateMenuBestStats() {
    const bestStats = getOverallBestStats();
    if (!bestStats) return;

    // Update best moves display if it exists on the page
    const bestMovesDisplay = document.getElementById('menu-best-moves');
    if (bestMovesDisplay) {
        bestMovesDisplay.textContent = bestStats.moves;
    }

    // Update best time display if it exists on the page
    const bestTimeDisplay = document.getElementById('menu-best-time');
    if (bestTimeDisplay) {
        bestTimeDisplay.textContent = formatTime(bestStats.time);
    }

    // Update best level display if it exists
    const bestLevelDisplay = document.getElementById('menu-best-level');
    if (bestLevelDisplay) {
        bestLevelDisplay.textContent = `Level ${bestStats.level}`;
    }
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
// EXPOSE TO WINDOW
// ============================================================

window.leaderboard = {
    init: initLeaderboard,
    submitScore: submitScore,
    getCurrentPlayerName: getCurrentPlayerName,
    showLeaderboard: showLeaderboard,
    hideLeaderboard: hideLeaderboard,
    showPlayerNamePrompt: showPlayerNameModal,
    updatePlayerDisplay: updatePlayerDisplay,
    updateMenuBestStats: updateMenuBestStats,
    getOverallBestStats: getOverallBestStats
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
