/**
 * Chess Audio System
 * Web Audio API for chess sound effects
 */

const AudioSystem = (function() {
    let audioContext = null;

    // Sound settings
    let settings = {
        master: true
    };

    /**
     * Initialize Audio Context (must be done after user interaction)
     */
    function init() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
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
    function getSettings() {
        return { ...settings };
    }

    /**
     * Set master sound toggle
     */
    function setMasterEnabled(enabled) {
        settings.master = enabled;
        saveSettings();
    }

    /**
     * Check if sound is enabled
     */
    function isEnabled() {
        return settings.master;
    }

    /**
     * Create an oscillator with envelope
     */
    function playTone(frequency, duration, type = 'sine', volume = 0.1) {
        if (!settings.master || !audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Envelope - attack, decay, sustain, release
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    /**
     * Play a sequence of notes (melody)
     */
    function playMelody(notes, tempo = 100) {
        if (!settings.master || !audioContext) return;

        notes.forEach((note, index) => {
            setTimeout(() => {
                playTone(note.freq, note.duration || 0.1, note.type || 'sine', note.volume || 0.1);
            }, index * tempo);
        });
    }

    /**
     * Sound: Piece move (soft click)
     */
    function playMove() {
        if (!isEnabled()) return;
        init();
        playTone(400, 0.08, 'sine', 0.08);
    }

    /**
     * Sound: Piece capture (impact)
     */
    function playCapture() {
        if (!isEnabled()) return;
        init();
        const notes = [
            { freq: 300, duration: 0.06, type: 'triangle', volume: 0.12 },
            { freq: 200, duration: 0.08, type: 'triangle', volume: 0.1 }
        ];
        playMelody(notes, 40);
    }

    /**
     * Sound: Check (alert)
     */
    function playCheck() {
        if (!isEnabled()) return;
        init();
        const notes = [
            { freq: 600, duration: 0.1, type: 'square', volume: 0.08 },
            { freq: 800, duration: 0.1, type: 'square', volume: 0.08 }
        ];
        playMelody(notes, 80);
    }

    /**
     * Sound: Checkmate (dramatic)
     */
    function playCheckmate() {
        if (!isEnabled()) return;
        init();
        const notes = [
            { freq: 523.25, duration: 0.15, type: 'square', volume: 0.1 },
            { freq: 659.25, duration: 0.15, type: 'square', volume: 0.1 },
            { freq: 783.99, duration: 0.15, type: 'square', volume: 0.1 },
            { freq: 1046.50, duration: 0.3, type: 'square', volume: 0.12 }
        ];
        playMelody(notes, 120);
    }

    /**
     * Sound: Stalemate/Draw (neutral)
     */
    function playDraw() {
        if (!isEnabled()) return;
        init();
        const notes = [
            { freq: 400, duration: 0.2, type: 'sine', volume: 0.08 },
            { freq: 400, duration: 0.2, type: 'sine', volume: 0.08 }
        ];
        playMelody(notes, 200);
    }

    /**
     * Sound: Castle (special move)
     */
    function playCastle() {
        if (!isEnabled()) return;
        init();
        const notes = [
            { freq: 350, duration: 0.06, type: 'sine', volume: 0.08 },
            { freq: 450, duration: 0.06, type: 'sine', volume: 0.08 },
            { freq: 350, duration: 0.08, type: 'sine', volume: 0.08 }
        ];
        playMelody(notes, 50);
    }

    /**
     * Sound: Invalid move (error)
     */
    function playInvalid() {
        if (!isEnabled()) return;
        init();
        playTone(200, 0.15, 'sawtooth', 0.08);
    }

    /**
     * Sound: Button click (UI)
     */
    function playClick() {
        if (!settings.master) return;
        init();
        playTone(600, 0.04, 'sine', 0.05);
    }

    /**
     * Sound: Game start (fanfare)
     */
    function playStart() {
        if (!settings.master) return;
        init();
        const notes = [
            { freq: 523.25, duration: 0.08, type: 'square', volume: 0.06 },
            { freq: 659.25, duration: 0.08, type: 'square', volume: 0.06 },
            { freq: 783.99, duration: 0.12, type: 'square', volume: 0.08 }
        ];
        playMelody(notes, 60);
    }

    /**
     * Sound: Promotion (special)
     */
    function playPromotion() {
        if (!isEnabled()) return;
        init();
        const notes = [
            { freq: 500, duration: 0.08, type: 'sine', volume: 0.08 },
            { freq: 700, duration: 0.08, type: 'sine', volume: 0.08 },
            { freq: 900, duration: 0.12, type: 'sine', volume: 0.1 }
        ];
        playMelody(notes, 60);
    }

    // Load settings on initialization
    loadSettings();

    // Public API
    return {
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
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioSystem;
}
