/** A Metronome object using the Web Audio API for timing and playback. */
export class Metronome {
    #audioContext;
    #currentTempo;
    #currentSource;
    #isPlaying;

    /** Constructs a Metronome and sets up the AudioContext. Starting the
     *  AudioContext is subject to the
     *  [autoplay policy](https://developer.chrome.com/blog/autoplay/#web-audio).
     *  From testing, it seems that navigating to this page counts as a user
     *  interaction, allowing the context to start.
     *
     *  In any case, the AudioContext should be started before the metronome
     *  is to start playing; starting it for the first time when the
     *  metronome is meant to start will result in a bit of latency,
     *  causing the metronome to be out of sync with other devices.
     *
     *  @param {number} initialTempo
     */
    constructor(initialTempo) {
        this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.#currentTempo = initialTempo;
        this.#isPlaying = false;
    }

    /** @param {boolean} status */
    setStatus(status) {
        if (status) {
            this.#createFilledSource();
            this.#currentSource.start();
        } else {
            this.#currentSource.disconnect();
        }

        this.#isPlaying = status;
    }

    /** @param {number} newBpm */
    setTempo(newBpm) {
        this.#pokeAudioContext()

        this.#currentTempo = newBpm;
        if (this.#isPlaying) {
            this.#restartPlayback();
        }
    }

    #createFilledSource() {
        const buf = this.#audioContext.createBuffer(1, this.#audioContext.sampleRate * 2, this.#audioContext.sampleRate);
        const channel = buf.getChannelData(0);

        let phase = 0;
        let amp = 1;
        const durationFrames = this.#audioContext.sampleRate / 50;
        const f = 330;

        for (let i = 0; i < durationFrames; i++) {
            channel[i] = Math.sin(phase) * amp;
            phase += 2 * Math.PI * f / this.#audioContext.sampleRate;
            if (phase > 2 * Math.PI) {
                phase -= 2 * Math.PI;
            }
            amp -= 1 / durationFrames;
        }

        this.#currentSource = this.#audioContext.createBufferSource();
        this.#currentSource.buffer = buf;
        this.#currentSource.loop = true;
        this.#currentSource.loopEnd = 1 / (this.#currentTempo / 60);
        this.#currentSource.connect(this.#audioContext.destination);
    }


    /** Restart metronome playback. Useful for tempo changes; the metronome can
     *  be "re-clicked" to ensure synchronization. */
    #restartPlayback() {
        this.#currentSource.disconnect();
        this.#createFilledSource();
        this.#currentSource.start();
    }

    /** If the AudioContext is not started, attempts to start it.
     *  Useful on user interactions to ensure the AudioContext has
     *  been started before the metrnome is to be started.
     */
    #pokeAudioContext() {
        if (this.#audioContext.state === "suspended") {
            this.#audioContext.resume();
        }
    }
}
