/**
 * Tetris Audio
 * Sound effects using Web Audio API
 */

const Audio = (function() {
    let audioContext = null;
    let enabled = true;
    let initialized = false;

    /**
     * Initialize audio context
     */
    function init() {
        if (initialized) return;

        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            initialized = true;
        } catch (e) {
            console.log('Web Audio API not supported');
            enabled = false;
        }
    }

    /**
     * Check if audio is enabled
     */
    function isEnabled() {
        return enabled && Game ? Game.getSoundEnabled() : enabled;
    }

    /**
     * Play a tone
     */
    function playTone(frequency, duration, type = 'square', volume = 0.3) {
        if (!isEnabled() || !audioContext) return;

        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    /**
     * Play move sound
     */
    function playMove() {
        if (!isEnabled()) return;
        init();
        playTone(200, 0.05, 'square', 0.1);
    }

    /**
     * Play rotate sound
     */
    function playRotate() {
        if (!isEnabled()) return;
        init();
        playTone(300, 0.08, 'square', 0.15);
    }

    /**
     * Play drop sound
     */
    function playDrop() {
        if (!isEnabled()) return;
        init();
        playTone(150, 0.1, 'square', 0.2);
    }

    /**
     * Play line clear sound
     */
    function playLineClear(lineCount) {
        if (!isEnabled()) return;
        init();

        // Different sounds for different line counts
        switch (lineCount) {
            case 1:
                playTone(400, 0.15, 'square', 0.2);
                break;
            case 2:
                playTone(450, 0.15, 'square', 0.2);
                setTimeout(() => playTone(500, 0.15, 'square', 0.2), 80);
                break;
            case 3:
                playTone(500, 0.15, 'square', 0.2);
                setTimeout(() => playTone(550, 0.15, 'square', 0.2), 80);
                setTimeout(() => playTone(600, 0.15, 'square', 0.2), 160);
                break;
            case 4: // Tetris!
                playTone(600, 0.2, 'square', 0.25);
                setTimeout(() => playTone(700, 0.2, 'square', 0.25), 100);
                setTimeout(() => playTone(800, 0.2, 'square', 0.25), 200);
                setTimeout(() => playTone(900, 0.3, 'square', 0.3), 300);
                break;
            default:
                playTone(400, 0.15, 'square', 0.2);
        }
    }

    /**
     * Play level up sound
     */
    function playLevelUp() {
        if (!isEnabled()) return;
        init();

        playTone(400, 0.1, 'square', 0.2);
        setTimeout(() => playTone(500, 0.1, 'square', 0.2), 100);
        setTimeout(() => playTone(600, 0.15, 'square', 0.25), 200);
    }

    /**
     * Play game over sound
     */
    function playGameOver() {
        if (!isEnabled()) return;
        init();

        playTone(400, 0.2, 'square', 0.3);
        setTimeout(() => playTone(350, 0.2, 'square', 0.3), 200);
        setTimeout(() => playTone(300, 0.3, 'square', 0.3), 400);
        setTimeout(() => playTone(250, 0.5, 'square', 0.25), 600);
    }

    /**
     * Play game start sound
     */
    function playStart() {
        if (!isEnabled()) return;
        init();

        playTone(300, 0.1, 'square', 0.2);
        setTimeout(() => playTone(400, 0.1, 'square', 0.2), 100);
        setTimeout(() => playTone(500, 0.15, 'square', 0.25), 200);
    }

    /**
     * Set enabled state
     */
    function setEnabled(state) {
        enabled = state;
    }

    // Initialize on first user interaction
    document.addEventListener('click', () => {
        if (!initialized) init();
    }, { once: true });

    document.addEventListener('touchstart', () => {
        if (!initialized) init();
    }, { once: true });

    // Public API
    return {
        init,
        playMove,
        playRotate,
        playDrop,
        playLineClear,
        playLevelUp,
        playGameOver,
        playStart,
        setEnabled,
        isEnabled
    };
})();
