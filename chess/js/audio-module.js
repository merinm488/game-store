/**
 * Chess Audio System - ES6 Module
 * Uses Tone.js (external ES6 module) for sound synthesis
 */

import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@14.7.77/+esm';

// Sound settings
let settings = {
    master: true
};

let initialized = false;

/**
 * Initialize the audio system
 */
export async function init() {
    if (initialized) return;
    await Tone.start();
    initialized = true;
    loadSettings();
}

/**
 * Load sound settings from localStorage
 */
function loadSettings() {
    try {
        const saved = localStorage.getItem('chessAudioSettings');
        if (saved) {
            settings = { ...settings, ...JSON.parse(saved) };
        }
    } catch (e) {
        // Ignore errors
    }
}

/**
 * Save sound settings to localStorage
 */
function saveSettings() {
    try {
        localStorage.setItem('chessAudioSettings', JSON.stringify(settings));
    } catch (e) {
        // Ignore errors
    }
}

/**
 * Get all sound settings
 */
export function getSettings() {
    return { ...settings };
}

/**
 * Set master sound toggle
 */
export function setMasterEnabled(enabled) {
    settings.master = enabled;
    saveSettings();
}

/**
 * Check if sound is enabled
 */
export function isEnabled() {
    return settings.master;
}

/**
 * Play a tone using Tone.js
 */
async function playTone(frequency, duration, type = 'sine', volume = 0.1) {
    if (!settings.master) return;
    await init();

    const synth = new Tone.Synth({
        oscillator: { type: type },
        envelope: {
            attack: 0.01,
            decay: duration * 0.3,
            sustain: 0.2,
            release: duration * 0.5
        }
    }).toDestination();

    synth.volume.value = Tone.gainToDb(volume);
    synth.triggerAttackRelease(frequency, duration);

    setTimeout(() => synth.dispose(), duration * 1000 + 100);
}

/**
 * Play a melody sequence
 */
async function playMelody(notes, tempo = 100) {
    if (!settings.master) return;
    await init();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -12;

    const now = Tone.now();
    notes.forEach((note, index) => {
        synth.triggerAttackRelease(note.freq, note.duration || 0.1, now + (index * tempo / 1000));
    });

    setTimeout(() => synth.dispose(), notes.length * tempo + 200);
}

/**
 * Sound: Piece move (soft click)
 */
export async function playMove() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -14;
    synth.triggerAttackRelease('G4', '16n');
    setTimeout(() => synth.dispose(), 100);
}

/**
 * Sound: Piece capture (impact)
 */
export async function playCapture() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth({
        oscillator: { type: 'triangle' }
    }).toDestination();
    synth.volume.value = -10;

    const now = Tone.now();
    synth.triggerAttackRelease('E4', '32n', now);
    synth.triggerAttackRelease('C4', '16n', now + 0.04);

    setTimeout(() => synth.dispose(), 200);
}

/**
 * Sound: Check (alert)
 */
export async function playCheck() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth({
        oscillator: { type: 'square' }
    }).toDestination();
    synth.volume.value = -12;

    const now = Tone.now();
    synth.triggerAttackRelease('D5', '8n', now);
    synth.triggerAttackRelease('G5', '8n', now + 0.08);

    setTimeout(() => synth.dispose(), 250);
}

/**
 * Sound: Checkmate (dramatic)
 */
export async function playCheckmate() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -10;

    const now = Tone.now();
    synth.triggerAttackRelease('C5', '8n', now);
    synth.triggerAttackRelease('E5', '8n', now + 0.12);
    synth.triggerAttackRelease('G5', '8n', now + 0.24);
    synth.triggerAttackRelease('C6', '4n', now + 0.36);

    setTimeout(() => synth.dispose(), 700);
}

/**
 * Sound: Stalemate/Draw (neutral)
 */
export async function playDraw() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -14;

    const now = Tone.now();
    synth.triggerAttackRelease('G4', '8n', now);
    synth.triggerAttackRelease('G4', '8n', now + 0.2);

    setTimeout(() => synth.dispose(), 500);
}

/**
 * Sound: Castle (special move)
 */
export async function playCastle() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -14;

    const now = Tone.now();
    synth.triggerAttackRelease('F4', '32n', now);
    synth.triggerAttackRelease('A4', '32n', now + 0.05);
    synth.triggerAttackRelease('F4', '16n', now + 0.1);

    setTimeout(() => synth.dispose(), 250);
}

/**
 * Sound: Invalid move (error)
 */
export async function playInvalid() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth({
        oscillator: { type: 'sawtooth' }
    }).toDestination();
    synth.volume.value = -14;
    synth.triggerAttackRelease('G3', '8n');

    setTimeout(() => synth.dispose(), 200);
}

/**
 * Sound: Button click (UI)
 */
export async function playClick() {
    if (!settings.master) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -18;
    synth.triggerAttackRelease('D5', '32n');

    setTimeout(() => synth.dispose(), 100);
}

/**
 * Sound: Game start (fanfare)
 */
export async function playStart() {
    if (!settings.master) return;
    await init();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -14;

    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    synth.triggerAttackRelease('E5', '16n', now + 0.06);
    synth.triggerAttackRelease('G5', '8n', now + 0.12);

    setTimeout(() => synth.dispose(), 300);
}

/**
 * Sound: Promotion (special)
 */
export async function playPromotion() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -12;

    const now = Tone.now();
    synth.triggerAttackRelease('B4', '16n', now);
    synth.triggerAttackRelease('D5', '16n', now + 0.06);
    synth.triggerAttackRelease('F#5', '8n', now + 0.12);

    setTimeout(() => synth.dispose(), 300);
}

// Load settings on module initialization
loadSettings();

// Export default object for compatibility
export default {
    init,
    getSettings,
    setMasterEnabled,
    isEnabled,
    playMove,
    playCapture,
    playCheck,
    playCheckmate,
    playDraw,
    playCastle,
    playInvalid,
    playClick,
    playStart,
    playPromotion
};
