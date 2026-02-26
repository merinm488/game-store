/**
 * Tetris Audio - ES6 Module
 * Uses Tone.js (external ES6 module) for sound synthesis
 *
 * This demonstrates:
 * - How to import an external ES6 module (Tone.js)
 * - How to export functions for use in other files
 * - How to encapsulate audio logic in a clean API
 */

import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@14.7.77/+esm';

let enabled = true;
let initialized = false;

/**
 * Initialize the audio system
 */
export async function init() {
    if (initialized) return;
    await Tone.start();
    initialized = true;
}

/**
 * Check if audio is enabled
 */
export function isEnabled() {
    // Check with Game object if available
    if (typeof Game !== 'undefined' && Game.getSoundEnabled) {
        return enabled && Game.getSoundEnabled();
    }
    return enabled;
}

/**
 * Set enabled state
 */
export function setEnabled(state) {
    enabled = state;
}

/**
 * Play a tone using Tone.js
 */
async function playTone(frequency, duration, type = 'square', volume = 0.3) {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth({
        oscillator: { type: type },
        envelope: {
            attack: 0.01,
            decay: duration * 0.5,
            sustain: 0.1,
            release: duration * 0.5
        }
    }).toDestination();

    synth.volume.value = Tone.gainToDb(volume);
    synth.triggerAttackRelease(frequency, duration);

    // Clean up after sound plays
    setTimeout(() => synth.dispose(), duration * 1000 + 100);
}

/**
 * Play move sound
 */
export async function playMove() {
    if (!isEnabled()) return;
    await init();
    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -10;
    synth.triggerAttackRelease('G3', '32n');
    setTimeout(() => synth.dispose(), 100);
}

/**
 * Play rotate sound
 */
export async function playRotate() {
    if (!isEnabled()) return;
    await init();
    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -8;
    synth.triggerAttackRelease('G4', '16n');
    setTimeout(() => synth.dispose(), 100);
}

/**
 * Play drop sound
 */
export async function playDrop() {
    if (!isEnabled()) return;
    await init();
    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -7;
    synth.triggerAttackRelease('E3', '8n');
    setTimeout(() => synth.dispose(), 150);
}

/**
 * Play line clear sound
 */
export async function playLineClear(lineCount) {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -7;

    const now = Tone.now();

    switch (lineCount) {
        case 1:
            synth.triggerAttackRelease('G4', '8n', now);
            break;
        case 2:
            synth.triggerAttackRelease('A4', '8n', now);
            synth.triggerAttackRelease('B4', '8n', now + 0.08);
            break;
        case 3:
            synth.triggerAttackRelease('B4', '8n', now);
            synth.triggerAttackRelease('C5', '8n', now + 0.08);
            synth.triggerAttackRelease('D5', '8n', now + 0.16);
            break;
        case 4: // Tetris!
            synth.triggerAttackRelease('D5', '8n', now);
            synth.triggerAttackRelease('E5', '8n', now + 0.1);
            synth.triggerAttackRelease('F#5', '8n', now + 0.2);
            synth.triggerAttackRelease('G5', '4n', now + 0.3);
            break;
        default:
            synth.triggerAttackRelease('G4', '8n', now);
    }

    setTimeout(() => synth.dispose(), 500);
}

/**
 * Play level up sound
 */
export async function playLevelUp() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -7;

    const now = Tone.now();
    synth.triggerAttackRelease('G4', '8n', now);
    synth.triggerAttackRelease('A4', '8n', now + 0.1);
    synth.triggerAttackRelease('B4', '16n', now + 0.2);

    setTimeout(() => synth.dispose(), 400);
}

/**
 * Play game over sound
 */
export async function playGameOver() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -5;

    const now = Tone.now();
    synth.triggerAttackRelease('G4', '8n', now);
    synth.triggerAttackRelease('F3', '8n', now + 0.2);
    synth.triggerAttackRelease('E3', '4n', now + 0.4);
    synth.triggerAttackRelease('D3', '2n', now + 0.6);

    setTimeout(() => synth.dispose(), 1000);
}

/**
 * Play game start sound
 */
export async function playStart() {
    if (!isEnabled()) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -7;

    const now = Tone.now();
    synth.triggerAttackRelease('E4', '8n', now);
    synth.triggerAttackRelease('G4', '8n', now + 0.1);
    synth.triggerAttackRelease('B5', '16n', now + 0.2);

    setTimeout(() => synth.dispose(), 400);
}

// Export default object for compatibility
export default {
    init,
    isEnabled,
    setEnabled,
    playMove,
    playRotate,
    playDrop,
    playLineClear,
    playLevelUp,
    playGameOver,
    playStart
};

// Also export as GameAudio for global access (avoids conflict with browser's Audio)
export const GameAudio = {
    init,
    isEnabled,
    setEnabled,
    playMove,
    playRotate,
    playDrop,
    playLineClear,
    playLevelUp,
    playGameOver,
    playStart
};
