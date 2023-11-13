// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix"
import { LiveSocket } from "phoenix_live_view"
import topbar from "../vendor/topbar"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")

let liveSocket = new LiveSocket("/live", Socket, { params: { _csrf_token: csrfToken } })

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" })
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

const metronome = {
    audioContext: new (window.AudioContext || window.webkitAudioContext)(),
    clickSound: null,
    nextNoteTime: 0,
    timerID: null,
    bpm: 60,

    loadClickSound(url) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.clickSound = audioBuffer;
            })
            .catch(e => console.error('Error loading audio file:', e));
    },

    scheduleNote() {
        if (this.clickSound) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.clickSound;
            source.connect(this.audioContext.destination);
            source.start(this.nextNoteTime);
        }
    },

    nextNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time

        // Schedule the next note
        this.scheduleNote();
    },

    start() {
        if (this.clickSound == null) {
            this.loadClickSound('/audio/click.wav');
        }
        this.nextNoteTime = this.audioContext.currentTime;
        this.timerID = setInterval(() => this.nextNote(), 25); // 25ms for lookahead
    },

    stop() {
        clearInterval(this.timerID);
        this.timerID = null;
    },

    setBPM(newBPM) {
        this.bpm = newBPM;
    }
};

window.addEventListener(
    "phx:toggle_event",
    ({ detail: { status } }) => {
        if (status) {
            metronome.start()
        } else {
            metronome.stop()
        }
    }
)

window.addEventListener(
    "phx:bpm_change",
    ({ detail: { bpm } }) => {
        metronome.setBPM(bpm)
    }
)
