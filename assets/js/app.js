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

let currentTempo = 60;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

var buf = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
var channel = buf.getChannelData(0);
var phase = 0;
var amp = 1;
var duration_frames = audioContext.sampleRate / 50;
const f = 330;
for (var i = 0; i < duration_frames; i++) {
    channel[i] = Math.sin(phase) * amp;
    phase += 2 * Math.PI * f / audioContext.sampleRate;
    if (phase > 2 * Math.PI) {
        phase -= 2 * Math.PI;
    }
    amp -= 1 / duration_frames;
}
source = audioContext.createBufferSource();
source.buffer = buf;
source.loop = true;
source.loopEnd = 1 / (currentTempo / 60);
source.connect(audioContext.destination);
source.start(0);

window.addEventListener(
    "phx:toggle_event",
    ({ detail: { status } }) => {
        if (status) {
            audioContext.resume();
        } else {
            audioContext.suspend();
        }
    }
)

// TODO: should this be an event listener locally?
window.addEventListener(
    "phx:bpm_change",
    ({ detail: { bpm } }) => {
        source.loopEnd = 1 / (bpm / 60);
        currentTempo = bpm
    }
)
