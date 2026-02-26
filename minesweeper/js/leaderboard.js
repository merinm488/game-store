/**
 * Minesweeper - Leaderboard Module
 * Handles player names, time tracking, and leaderboard display using TextDB
 */

import { setup, save, load } from 'https://merinm488.github.io/packages/textdb/textdbV1.js';

// ============================================================
// CONFIGURATION
// ============================================================

const LEADERBOARD_ID = 'minesweeper-leaderboard';
const MAX_LEADERBOARD_ENTRIES = 10;
const LOCAL_STORAGE_KEY = 'minesweeperPlayerName';

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
    playerNameModal: document.getElementById('player-name-modal'),
    playerNameInput: document.getElementById('player-name-input'),
    savePlayerName: document.getElementById('save-player-name'),
    playAsGuest: document.getElementById('play-as-guest'),
    leaderboardModal: document.getElementById('leaderboard-modal'),
    leaderboardList: document.getElementById('leaderboard-list'),
    closeLeaderboard: document.getElementById('close-leaderboard'),
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    currentPlayerDisplay: document.getElementById('currentPlayerDisplay'),
    changePlayerBtn: document.getElementById('change-player-btn')
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

    console.log('Minesweeper Leaderboard initialized');
}

async function refreshLeaderboardData() {
    try {
        const data = await load(LEADERBOARD_ID);
        const originalData = data || { leaderboard: [], lastUpdated: null };

        // Clean up duplicates (case-insensitive names, keep best time)
        const originalLength = originalData.leaderboard.length;
        originalData.leaderboard = deduplicateLeaderboard(originalData.leaderboard);

        // If duplicates were removed, save the cleaned data
        if (originalData.leaderboard.length < originalLength) {
            console.log(`Cleaned up ${originalLength - originalData.leaderboard.length} duplicate entries`);
            await save(originalData, LEADERBOARD_ID);
        }

        leaderboardData = originalData;

        // Update main menu best time display with player's best from TextDB
        updateMenuBestTime();
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        leaderboardData = { leaderboard: [], lastUpdated: null };
    }
}

/**
 * Get the current player's best time from the leaderboard
 */
function getPlayerBestTime() {
    if (!leaderboardData || !currentPlayerName || currentPlayerName === 'Guest') {
        return null;
    }

    const normalizedName = currentPlayerName.toLowerCase();
    const playerEntry = leaderboardData.leaderboard.find(
        entry => entry.name.toLowerCase() === normalizedName
    );

    return playerEntry ? { time: playerEntry.time, difficulty: playerEntry.difficulty } : null;
}

/**
 * Get the best time for each difficulty from the leaderboard
 */
function getBestTimesByDifficulty() {
    const result = { easy: null, medium: null, hard: null };

    if (!leaderboardData || leaderboardData.leaderboard.length === 0) {
        return result;
    }

    // Find best time for each difficulty
    ['easy', 'medium', 'hard'].forEach(difficulty => {
        const entries = leaderboardData.leaderboard.filter(entry => entry.difficulty === difficulty);
        if (entries.length > 0) {
            // Entries are already sorted by time ascending, so first one is best
            result[difficulty] = entries[0].time;
        }
    });

    return result;
}

/**
 * Update the main menu best time display with TextDB data
 */
function updateMenuBestTime() {
    const bestTimes = getBestTimesByDifficulty();

    // Update each difficulty's best time
    ['easy', 'medium', 'hard'].forEach(difficulty => {
        const bestTimeElement = document.getElementById(`best-time-${difficulty}`);
        if (bestTimeElement && bestTimes[difficulty] !== null) {
            bestTimeElement.textContent = formatTime(bestTimes[difficulty]);
        }
    });
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
                <p>🏆 No times yet!</p>
                <p>Be the first on the leaderboard.</p>
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
                <span class="leaderboard-time">${timeStr}</span>
                <span class="leaderboard-difficulty">${entry.difficulty}</span>
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
// SCORE SUBMISSION (lower time is better)
// ============================================================

async function submitTime(time, difficulty) {
    // If no player name set, prompt for it
    if (!currentPlayerName) {
        showPlayerNameModal();
        await waitForPlayerName();
    }

    // Don't save guest scores
    if (currentPlayerName === 'Guest') {
        console.log('Guest time not saved to leaderboard');
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
        // Player exists - update only if new time is better (lower)
        const existingEntry = leaderboardData.leaderboard[existingIndex];
        if (time < existingEntry.time) {
            existingEntry.time = time;
            existingEntry.difficulty = difficulty;
            existingEntry.date = new Date().toISOString();
            console.log(`Updated ${currentPlayerName}'s time to ${time}s`);
        } else {
            console.log(`${currentPlayerName}'s existing time (${existingEntry.time}s) is better than ${time}s`);
        }
    } else {
        // New player - add entry
        const newEntry = {
            name: currentPlayerName,
            time: time,
            difficulty: difficulty,
            date: new Date().toISOString()
        };
        leaderboardData.leaderboard.push(newEntry);
        console.log('Added new player to leaderboard:', newEntry);
    }

    // Sort by time (ascending - lower is better)
    leaderboardData.leaderboard.sort((a, b) => a.time - b.time);

    // Keep only top entries
    leaderboardData.leaderboard = leaderboardData.leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    leaderboardData.lastUpdated = new Date().toISOString();

    // Save to TextDB
    const success = await save(leaderboardData, LEADERBOARD_ID);

    if (!success) {
        console.error('Failed to save time to leaderboard');
    }

    // Update main menu best time display
    updateMenuBestTime();

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

/**
 * Remove duplicate entries (case-insensitive names), keeping best time for each player
 */
function deduplicateLeaderboard(entries) {
    const uniquePlayers = new Map();

    entries.forEach(entry => {
        const normalizedName = entry.name.toLowerCase();
        const existing = uniquePlayers.get(normalizedName);

        if (!existing || entry.time < existing.time) {
            uniquePlayers.set(normalizedName, entry);
        }
    });

    const deduped = Array.from(uniquePlayers.values());
    deduped.sort((a, b) => a.time - b.time);

    return deduped;
}

// ============================================================
// EXPOSE TO WINDOW
// ============================================================

window.leaderboard = {
    init: initLeaderboard,
    submitTime: submitTime,
    getCurrentPlayerName: getCurrentPlayerName,
    showLeaderboard: showLeaderboard,
    hideLeaderboard: hideLeaderboard,
    showPlayerNamePrompt: showPlayerNameModal,
    updatePlayerDisplay: updatePlayerDisplay,
    updateMenuBestTime: updateMenuBestTime,
    getPlayerBestTime: getPlayerBestTime,
    getBestTimesByDifficulty: getBestTimesByDifficulty
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
