/**
 * Audio System for Snake Rush - ES6 Module
 * Uses Tone.js (external ES6 module) for sound synthesis
 *
 * This demonstrates:
 * - How to import an external ES6 module (Tone.js)
 * - How to export functions for use in other files
 * - How to encapsulate audio logic in a clean API
 */

import * as Tone from 'https://cdn.jsdelivr.net/npm/tone@14.7.77/+esm';

// Sound settings
let soundSettings = {
    master: true,
    bgm: true,
    eat: true,
    gameOver: true,
    buttons: true,
    bonus: true
};

let bgmVolume = 0.6;
let isBgmPlaying = false;
let bgmSynth = null;
let bgmLoop = null;

// BGM notes for a simple looping bassline
const BGM_NOTES = [
    { note: 'C3', duration: '4n' },
    { note: 'E3', duration: '4n' },
    { note: 'G3', duration: '4n' },
    { note: 'E3', duration: '4n' },
    { note: 'C3', duration: '4n' },
    { note: 'D3', duration: '4n' },
    { note: 'F3', duration: '4n' },
    { note: 'D3', duration: '4n' },
];

/**
 * Initialize the audio system (must be called after user interaction)
 */
export async function init() {
    await Tone.start();
    console.log('Tone.js audio initialized');
}

/**
 * Load sound settings from localStorage
 */
function loadSettings() {
    const saved = localStorage.getItem('snakeRushSoundSettings');
    if (saved) {
        soundSettings = { ...soundSettings, ...JSON.parse(saved) };
    }
}

/**
 * Save sound settings to localStorage
 */
function saveSettings() {
    localStorage.setItem('snakeRushSoundSettings', JSON.stringify(soundSettings));
}

/**
 * Set individual sound toggle
 */
export function setSound(type, enabled) {
    if (type === 'volume') {
        bgmVolume = enabled;
        if (bgmSynth) {
            bgmSynth.volume.value = Tone.gainToDb(bgmVolume * 0.3);
        }
        return;
    }
    if (soundSettings.hasOwnProperty(type)) {
        soundSettings[type] = enabled;
        saveSettings();

        // Handle BGM specifically
        if (type === 'bgm') {
            if (enabled && soundSettings.master) {
                startBGM();
            } else {
                stopBGM();
            }
        }
    }
}

/**
 * Get all sound settings
 */
export function getSettings() {
    return { ...soundSettings, bgmVolume };
}

/**
 * Set all settings at once
 */
export function setAllSettings(settings) {
    soundSettings = { ...soundSettings, ...settings };
    bgmVolume = settings.bgmVolume !== undefined ? settings.bgmVolume : bgmVolume;
    saveSettings();
}

/**
 * Check if a sound type is enabled
 */
export function isEnabled(type) {
    return soundSettings.master && soundSettings[type];
}

/**
 * Enable/disable all sounds
 */
export function setMasterEnabled(enabled) {
    soundSettings.master = enabled;
    saveSettings();

    if (!enabled) {
        stopBGM();
    } else if (soundSettings.bgm) {
        startBGM();
    }
}

/**
 * BGM - Background Music using Tone.js
 */
export async function startBGM() {
    if (!soundSettings.master || !soundSettings.bgm || isBgmPlaying) return;

    await init();
    isBgmPlaying = true;

    // Create a synth for BGM
    bgmSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
            attack: 0.05,
            decay: 0.1,
            sustain: 0.3,
            release: 0.1
        }
    }).toDestination();

    bgmSynth.volume.value = Tone.gainToDb(bgmVolume * 0.3);

    // Create a sequence for the BGM
    let noteIndex = 0;
    bgmLoop = new Tone.Loop((time) => {
        const noteData = BGM_NOTES[noteIndex];
        bgmSynth.triggerAttackRelease(noteData.note, noteData.duration, time);
        noteIndex = (noteIndex + 1) % BGM_NOTES.length;
    }, '4n');

    bgmLoop.start(0);
    Tone.Transport.bpm.value = 120;
    Tone.Transport.start();
}

export function stopBGM() {
    isBgmPlaying = false;
    if (bgmLoop) {
        bgmLoop.stop();
        bgmLoop.dispose();
        bgmLoop = null;
    }
    if (bgmSynth) {
        bgmSynth.dispose();
        bgmSynth = null;
    }
    Tone.Transport.stop();
}

/**
 * Sound: Eat fruit (happy, ascending)
 */
export async function playEat() {
    if (!isEnabled('eat')) return;
    await init();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -12;

    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    synth.triggerAttackRelease('E5', '16n', now + 0.06);
    synth.triggerAttackRelease('G5', '8n', now + 0.12);
}

/**
 * Sound: Game Over (sad, descending)
 */
export async function playGameOver() {
    if (!isEnabled('gameOver')) return;
    await init();

    const synth = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }
    }).toDestination();
    synth.volume.value = -10;

    const now = Tone.now();
    synth.triggerAttackRelease('G4', '8n', now);
    synth.triggerAttackRelease('F4', '8n', now + 0.15);
    synth.triggerAttackRelease('E4', '8n', now + 0.3);
    synth.triggerAttackRelease('D4', '4n', now + 0.45);
    synth.triggerAttackRelease('C4', '2n', now + 0.75);
}

/**
 * Sound: Tamarind explosion (short, harsh sound)
 */
export async function playBomb() {
    if (!isEnabled('gameOver')) return;
    await init();

    const synth = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    synth.volume.value = -6;

    const now = Tone.now();
    synth.triggerAttackRelease('C3', '16n', now);
    synth.triggerAttackRelease('G2', '16n', now + 0.1);
    synth.triggerAttackRelease('E2', '8n', now + 0.2);
}

/**
 * Sound: Button click (short blip)
 */
export async function playClick() {
    if (!isEnabled('buttons')) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -16;
    synth.triggerAttackRelease('G5', '32n');
}

/**
 * Sound: Menu navigation (softer click)
 */
export async function playNavigate() {
    if (!isEnabled('buttons')) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -18;
    synth.triggerAttackRelease('D5', '32n');
}

/**
 * Sound: Game start (ascending fanfare)
 */
export async function playStart() {
    if (!isEnabled('buttons')) return;
    await init();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -10;

    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    synth.triggerAttackRelease('E5', '16n', now + 0.08);
    synth.triggerAttackRelease('G5', '16n', now + 0.16);
    synth.triggerAttackRelease('C6', '8n', now + 0.24);
}

/**
 * Sound: High score achieved (celebration)
 */
export async function playHighScore() {
    if (!isEnabled('bonus')) return;
    await init();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -10;

    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    synth.triggerAttackRelease('E5', '16n', now + 0.1);
    synth.triggerAttackRelease('G5', '16n', now + 0.2);
    synth.triggerAttackRelease('C6', '8n', now + 0.3);
    synth.triggerAttackRelease('G5', '16n', now + 0.45);
    synth.triggerAttackRelease('C6', '4n', now + 0.55);
}

/**
 * Sound: Pause (short tone)
 */
export async function playPause() {
    if (!isEnabled('buttons')) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -14;
    synth.triggerAttackRelease('A4', '16n');
}

/**
 * Sound: Resume (slightly higher pitch)
 */
export async function playResume() {
    if (!isEnabled('buttons')) return;
    await init();

    const synth = new Tone.Synth().toDestination();
    synth.volume.value = -14;
    synth.triggerAttackRelease('C#5', '16n');
}

/**
 * Sound: Golden Fruit (sparkle sound)
 */
export async function playGoldenFruit() {
    if (!isEnabled('bonus')) return;
    await init();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -10;

    const now = Tone.now();
    synth.triggerAttackRelease('C6', '32n', now);
    synth.triggerAttackRelease('E6', '32n', now + 0.07);
    synth.triggerAttackRelease('G6', '16n', now + 0.14);
    synth.triggerAttackRelease('C7', '8n', now + 0.24);
}

/**
 * Sound: Level Complete (triumphant)
 */
export async function playLevelComplete() {
    if (!isEnabled('bonus')) return;
    await init();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -8;

    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    synth.triggerAttackRelease('E5', '16n', now + 0.1);
    synth.triggerAttackRelease('G5', '16n', now + 0.2);
    synth.triggerAttackRelease('C6', '4n', now + 0.3);
}

// Load settings on module initialization
loadSettings();

// Export a default object with all functions (for compatibility with existing code)
export default {
    init,
    setSound,
    getSettings,
    setAllSettings,
    setMasterEnabled,
    isEnabled,
    playEat,
    playGameOver,
    playClick,
    playNavigate,
    playStart,
    playHighScore,
    playPause,
    playResume,
    playGoldenFruit,
    playBomb,
    playLevelComplete,
    startBGM,
    stopBGM
};
