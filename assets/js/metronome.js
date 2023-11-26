export class Metronome {
    constructor(initialTempo) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentTempo = initialTempo;
        this.isPlaying = false;
    }

    createFilledSource() {
        const buf = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
        const channel = buf.getChannelData(0);

        let phase = 0;
        let amp = 1;
        const durationFrames = this.audioContext.sampleRate / 50;
        const f = 330;

        for (let i = 0; i < durationFrames; i++) {
            channel[i] = Math.sin(phase) * amp;
            phase += 2 * Math.PI * f / this.audioContext.sampleRate;
            if (phase > 2 * Math.PI) {
                phase -= 2 * Math.PI;
            }
            amp -= 1 / durationFrames;
        }

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = buf;
        this.currentSource.loop = true;
        this.currentSource.loopEnd = 1 / (this.currentTempo / 60);
        this.currentSource.connect(this.audioContext.destination);
    }

    setStatus(status) {
        if (status) {
            if (this.isPlaying) {
                this.restartPlayback();
            }
            else {
                this.createFilledSource();
                this.currentSource.start();
            }
        } else {
            this.currentSource.disconnect();
        }

        this.isPlaying = status;
    }

    setTempo(newBpm) {
        this.currentTempo = newBpm;
        if (this.isPlaying) {
            this.restartPlayback();
        }
    }

    restartPlayback() {
        this.currentSource.disconnect();
        this.createFilledSource();
        this.currentSource.start();
    }
}
