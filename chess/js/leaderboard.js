/**
 * Chess - Leaderboard Module
 * Handles player names, win tracking, and leaderboard display using TextDB
 */

import { setup, save, load } from '../../lib/textdbV1.js';

// ============================================================
// CONFIGURATION
// ============================================================

const LEADERBOARD_ID = 'chess-leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;
const LOCAL_STORAGE_KEY = 'chessPlayerName';

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
    console.log('Chess Leaderboard: Starting initialization...');

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

        console.log('Chess Leaderboard: DOM elements cached', {
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

        console.log('Chess Leaderboard initialized');
    } catch (error) {
        console.error('Chess Leaderboard initialization error:', error);
    }
}

async function refreshLeaderboardData() {
    try {
        console.log('Chess Leaderboard: Loading data from TextDB...');
        const data = await load(LEADERBOARD_ID);
        console.log('Chess Leaderboard: Data loaded', data);

        // Handle null, undefined, or invalid data
        let originalData;
        if (!data || typeof data !== 'object') {
            originalData = { leaderboard: [], lastUpdated: null };
        } else if (!Array.isArray(data.leaderboard)) {
            originalData = { leaderboard: [], lastUpdated: data.lastUpdated || null };
        } else {
            originalData = data;
        }

        // Clean up duplicates (case-insensitive names, keep highest wins)
        const originalLength = originalData.leaderboard.length;
        originalData.leaderboard = deduplicateLeaderboard(originalData.leaderboard);

        // If duplicates were removed, save the cleaned data
        if (originalData.leaderboard.length < originalLength) {
            console.log(`Cleaned up ${originalLength - originalData.leaderboard.length} duplicate entries`);
            await save(originalData, LEADERBOARD_ID);
        }

        leaderboardData = originalData;

        // Update main menu wins display with overall best from TextDB
        updateMenuWins();
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        leaderboardData = { leaderboard: [], lastUpdated: null };
    }
}

/**
 * Remove duplicate entries (case-insensitive names), keeping highest wins
 */
function deduplicateLeaderboard(entries) {
    const uniquePlayers = new Map();

    entries.forEach(entry => {
        const normalizedName = entry.name.toLowerCase();
        const existing = uniquePlayers.get(normalizedName);

        if (!existing) {
            uniquePlayers.set(normalizedName, entry);
        } else {
            // Merge stats - keep the one with more total games, or higher wins
            if (entry.wins > existing.wins) {
                uniquePlayers.set(normalizedName, entry);
            }
        }
    });

    const deduped = Array.from(uniquePlayers.values());
    // Sort by wins (descending)
    deduped.sort((a, b) => b.wins - a.wins);

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

    console.log('Chess Leaderboard event listeners set up');
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
    elements.playerNameModal.classList.add('active');
    elements.playerNameInput.value = '';
    elements.playerNameInput.focus();
}

function hidePlayerNameModal() {
    elements.playerNameModal.classList.remove('active');
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
                <p>🏆 No games yet!</p>
                <p>Be the first on the scoreboard.</p>
            </div>
        `;
        return;
    }

    const html = leaderboardData.leaderboard.map((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const isCurrentPlayer = entry.name.toLowerCase() === (currentPlayerName || '').toLowerCase();
        const wins = entry.wins || 0;
        const losses = entry.losses || 0;
        const draws = entry.draws || 0;

        return `
            <div class="leaderboard-entry ${isCurrentPlayer ? 'current-player' : ''}">
                <span class="leaderboard-rank">${medal}</span>
                <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
                <span class="leaderboard-stats">
                    <span class="stat-win">${wins}W</span>
                    <span class="stat-draw">${draws}D</span>
                    <span class="stat-loss">${losses}L</span>
                </span>
            </div>
        `;
    }).join('');

    elements.leaderboardList.innerHTML = html;
}

// ============================================================
// SCORE SUBMISSION
// ============================================================

async function submitWin(difficulty) {
    // If no player name set, prompt for it
    if (!currentPlayerName) {
        showPlayerNameModal();
        await waitForPlayerName();
    }

    // Don't save guest scores
    if (currentPlayerName === 'Guest') {
        console.log('Guest win not saved to leaderboard');
        return false;
    }

    // Update record (win)
    await updatePlayerRecord('win');

    return true;
}

async function updatePlayerRecord(result) {
    // If no player name, don't save
    if (!currentPlayerName || currentPlayerName === 'Guest') {
        console.log('Guest result not saved to leaderboard');
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
        // Player exists - update record
        if (result === 'win') {
            leaderboardData.leaderboard[existingIndex].wins++;
        } else if (result === 'loss') {
            leaderboardData.leaderboard[existingIndex].losses = (leaderboardData.leaderboard[existingIndex].losses || 0) + 1;
        } else if (result === 'draw') {
            leaderboardData.leaderboard[existingIndex].draws = (leaderboardData.leaderboard[existingIndex].draws || 0) + 1;
        }
        leaderboardData.leaderboard[existingIndex].date = new Date().toISOString();
        console.log(`Updated ${currentPlayerName}'s record`);
    } else {
        // New player - add entry
        const newEntry = {
            name: currentPlayerName,
            wins: result === 'win' ? 1 : 0,
            losses: result === 'loss' ? 1 : 0,
            draws: result === 'draw' ? 1 : 0,
            date: new Date().toISOString()
        };
        leaderboardData.leaderboard.push(newEntry);
        console.log('Added new player to leaderboard:', newEntry);
    }

    // Sort by wins (descending)
    leaderboardData.leaderboard.sort((a, b) => b.wins - a.wins);

    // Keep only top entries
    leaderboardData.leaderboard = leaderboardData.leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    leaderboardData.lastUpdated = new Date().toISOString();

    // Save to TextDB
    const success = await save(leaderboardData, LEADERBOARD_ID);

    if (!success) {
        console.error('Failed to save record to leaderboard');
    }

    // Update menu displays
    updateMenuWins();

    return success;
}

/**
 * Get the current player's stats
 */
function getCurrentPlayerStats() {
    if (!leaderboardData || !currentPlayerName || currentPlayerName === 'Guest') {
        return { wins: 0, losses: 0, draws: 0 };
    }

    const normalizedName = currentPlayerName.toLowerCase();
    const playerEntry = leaderboardData.leaderboard.find(
        entry => entry.name.toLowerCase() === normalizedName
    );

    if (playerEntry) {
        return {
            wins: playerEntry.wins || 0,
            losses: playerEntry.losses || 0,
            draws: playerEntry.draws || 0
        };
    }

    return { wins: 0, losses: 0, draws: 0 };
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
// BEST WINS FROM TEXTDB
// ============================================================

/**
 * Get the overall best stats from the leaderboard
 */
function getOverallBestStats() {
    if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
        return null;
    }
    // Return the top entry (most wins)
    return leaderboardData.leaderboard[0];
}

/**
 * Update the main menu wins display with TextDB data
 */
function updateMenuWins() {
    // Show the top player's stats (overall best from leaderboard)
    const topPlayer = getOverallBestStats();

    if (topPlayer) {
        const winsDisplay = document.getElementById('winsMenu');
        const drawsDisplay = document.getElementById('drawsMenu');
        const lossesDisplay = document.getElementById('lossesMenu');

        if (winsDisplay) winsDisplay.textContent = topPlayer.wins || 0;
        if (drawsDisplay) drawsDisplay.textContent = topPlayer.draws || 0;
        if (lossesDisplay) lossesDisplay.textContent = topPlayer.losses || 0;
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
    submitWin: submitWin,
    updateRecord: updatePlayerRecord,
    getCurrentPlayerName: getCurrentPlayerName,
    getCurrentPlayerStats: getCurrentPlayerStats,
    showLeaderboard: showLeaderboard,
    hideLeaderboard: hideLeaderboard,
    showPlayerNamePrompt: showPlayerNameModal,
    updatePlayerDisplay: updatePlayerDisplay,
    updateMenuWins: updateMenuWins,
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
