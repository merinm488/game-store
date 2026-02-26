/**
 * Minesweeper SoundManager - ES6 Module
 * Uses Tone.js (external ES6 module) for sound synthesis
 */

import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@14.7.77/+esm';

let soundEnabled = true;
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
 * Enable or disable sounds
 */
export function toggle(enabled) {
    soundEnabled = enabled;
    if (enabled) {
        init();
    }
}

/**
 * Check if sound is enabled
 */
export function isEnabled() {
    return soundEnabled;
}

/**
 * Play a sound by name
 */
export async function playSound(soundName) {
    if (!soundEnabled) return;
    await init();

    switch (soundName) {
        case 'reveal':
            playRevealSound();
            break;
        case 'flag':
            playFlagSound();
            break;
        case 'gameOver':
            playGameOverSound();
            break;
        case 'victory':
            playVictorySound();
            break;
    }
}

/**
 * Play cell reveal sound (short click/pop)
 */
async function playRevealSound() {
    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -10;

    const now = Tone.now();
    synth.triggerAttackRelease('G5', '32n', now);
    synth.triggerAttackRelease('C5', '32n', now + 0.03);

    setTimeout(() => synth.dispose(), 200);
}

/**
 * Play flag placement sound (ding)
 */
async function playFlagSound() {
    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -8;
    synth.triggerAttackRelease('D6', '16n');

    setTimeout(() => synth.dispose(), 200);
}

/**
 * Play game over sound (explosion effect)
 */
async function playGameOverSound() {
    // Create a noise synth for explosion
    const noise = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: {
            attack: 0.01,
            decay: 0.4,
            sustain: 0,
            release: 0.1
        }
    }).toDestination();
    noise.volume.value = -6;
    noise.triggerAttackRelease('8n');

    // Add a low boom
    const synth = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0,
            release: 0.1
        }
    }).toDestination();
    synth.volume.value = -8;
    synth.triggerAttackRelease('C2', '4n');

    setTimeout(() => {
        noise.dispose();
        synth.dispose();
    }, 500);
}

/**
 * Play victory sound (ascending arpeggio)
 */
async function playVictorySound() {
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -10;

    const notes = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
    const now = Tone.now();

    notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, '8n', now + index * 0.1);
    });

    setTimeout(() => synth.dispose(), 1000);
}

// Export default object for compatibility
export default {
    init,
    toggle,
    isEnabled,
    playSound,
    playRevealSound,
    playFlagSound,
    playGameOverSound,
    playVictorySound
};
