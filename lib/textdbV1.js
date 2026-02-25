/**
 * TextDB Library v1.0
 * A simple client for textdb.dev - a free JSON storage API
 *
 * @example
 * // Quick start
 * import { setup, save, load } from './textdb.js';
 *
 * const { id, data } = await setup();
 * // data is null if new, or existing data
 *
 * await save({ todos: [], lastUpdated: new Date().toISOString() });
 */

const TEXTDB_API = 'https://textdb.dev/api/data';

// Internal state - the current ID being used
let currentId = null;

// ============================================================
// ID MANAGEMENT
// ============================================================

/**
 * Get the current ID
 * @returns {string|null}
 */
export function getId() {
    return currentId;
}

/**
 * Set the current ID
 * @param {string} id
 */
export function setId(id) {
    currentId = id;
}

/**
 * Generate a random 8-character hex ID
 * @returns {string}
 */
export function generateId() {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert a name to a URL-safe slug
 * Examples: "My List" -> "my-list", "Work Tasks!" -> "work-tasks"
 * @param {string} name
 * @returns {string}
 */
export function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// ============================================================
// URL MANAGEMENT
// ============================================================

/**
 * Get ID from URL query string (?id=xxx)
 * @returns {string|null}
 */
export function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Update browser URL with the current ID
 * @param {string} [id] - Optional ID (uses currentId if not provided)
 */
export function updateUrl(id) {
    const targetId = id || currentId;
    if (!targetId) return;

    const url = `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(targetId)}`;
    window.history.pushState({}, '', url);
}

// ============================================================
// DATA OPERATIONS
// ============================================================

/**
 * Load data from TextDB
 * @param {string} [id] - Optional ID override (uses currentId if not provided)
 * @returns {Promise<any|null>} - Parsed JSON data, or null if not found/error
 */
export async function load(id) {
    const targetId = id || currentId;
    if (!targetId) {
        console.error('TextDB: No ID provided and no current ID set');
        return null;
    }

    try {
        const response = await fetch(`${TEXTDB_API}/${targetId}`);

        if (response.status === 404) {
            return null; // No data yet - this is normal for new IDs
        }

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        // Get text first, then try to parse as JSON
        const text = await response.text();
        if (!text || text.trim() === '') {
            return null; // Empty response
        }

        try {
            return JSON.parse(text);
        } catch (parseError) {
            console.error('TextDB: Invalid JSON response:', text);
            return null;
        }
    } catch (error) {
        console.error('TextDB load error:', error);
        return null;
    }
}

/**
 * Save data to TextDB
 * @param {any} data - Any JSON-serializable data
 * @param {string} [id] - Optional ID override (uses currentId if not provided)
 * @returns {Promise<boolean>} - true if successful, false if failed
 */
export async function save(data, id) {
    const targetId = id || currentId;
    if (!targetId) {
        console.error('TextDB: No ID provided and no current ID set');
        return false;
    }

    try {
        const response = await fetch(`${TEXTDB_API}/${targetId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('TextDB save error:', error);
        return false;
    }
}

// ============================================================
// CONVENIENCE METHODS
// ============================================================

/**
 * Initialize TextDB with URL ID or generate new one
 * - Checks URL for ?id= parameter
 * - If found, sets currentId and returns it
 * - If not found, generates new ID, sets it, updates URL, returns it
 * @returns {string} - The ID to use
 */
export function init() {
    const urlId = getIdFromUrl();

    if (urlId) {
        currentId = urlId;
        return urlId;
    }

    const newId = generateId();
    currentId = newId;
    updateUrl(newId);
    return newId;
}

/**
 * Full setup: init + load in one call
 * Most convenient way to start using TextDB
 * @returns {Promise<{id: string, data: any}>} - ID and loaded data (null if new)
 */
export async function setup() {
    const id = init();
    const data = await load();
    return { id, data };
}
