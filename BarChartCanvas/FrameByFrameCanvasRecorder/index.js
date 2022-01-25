export default class FrameByFrameCanvasRecorder {
  constructor(source_canvas, FPS = 30) {
    this.FPS = FPS;
    this.source = source_canvas;
    const canvas = this.canvas = source_canvas.cloneNode();
    const ctx = this.drawingContext = canvas.getContext('2d');

    // we need to draw something on our canvas
    ctx.drawImage(source_canvas, 0, 0);
    const stream = this.stream = canvas.captureStream(0);
    const track = this.track = stream.getVideoTracks()[0];
    // Firefox still uses a non-standard CanvasCaptureMediaStream
    // instead of CanvasCaptureMediaStreamTrack
    if (!track.requestFrame) {
      track.requestFrame = () => stream.requestFrame();
    }
    // prepare our MediaRecorder
    const rec = this.recorder = new MediaRecorder(stream);
    const chunks = this.chunks = [];
    rec.ondataavailable = (evt) => chunks.push(evt.data);
    rec.start();
    // we need to be in 'paused' state
    waitForEvent(rec, 'start')
      .then((evt) => rec.pause());
    // expose a Promise for when it's done
    this._init = waitForEvent(rec, 'pause');

  }
  async recordFrame() {

    await this._init; // we have to wait for the recorder to be paused
    const rec = this.recorder;
    const canvas = this.canvas;
    const source = this.source;
    const ctx = this.drawingContext;
    if(canvas.width !== source.width ||
      canvas.height !== source.height ) {
      canvas.width =  source.width;
      canvas.height = source.height;
    }

    // start our timer now so whatever happens between is not taken in account
    const timer = audioTimer.schedule(1000 / this.FPS);

    // wake up the recorder
    rec.resume();
    await waitForEvent(rec, 'resume');

    // draw the current state of source on our internal canvas (triggers requestFrame in Chrome)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0);
    // force write the frame
    this.track.requestFrame();

    // wait until our frame-time elapsed
    await timer;

    // sleep recorder
    rec.pause();
    await waitForEvent(rec, 'pause');

  }
  async export() {

    this.recorder.stop();
    this.stream.getTracks().forEach((track) => track.stop());
    await waitForEvent(this.recorder, "stop");
    return new Blob(this.chunks);

  }

  async setupVideo(video_element) {
    const recorded = await this.export(); // we can get our final video file
    video_element.src = URL.createObjectURL(recorded);
    video_element.onloadedmetadata = (evt) => video_element.currentTime = 1e100; // workaround https://crbug.com/642012
    download(video_element.src, 'movie.webm');

    function download(url, filename = "file.ext") {
      const a = document.createElement('a');
      a.textContent = a.download = filename;
      a.href = url;
      document.body.append(a);
      return a;
    }
  }

}
// Promisifies EventTarget.addEventListener
function waitForEvent( target, type ) {
  return new Promise((res) => target.addEventListener(type, res, { once: true }));
}

// implements a sub-optimal monkey-patch for requestPostAnimationFrame
// see https://stackoverflow.com/a/57549862/3702797 for details
if ( !window.requestPostAnimationFrame ) {
  window.requestPostAnimationFrame = function monkey( fn ) {
    const channel = new MessageChannel();
    channel.port2.onmessage = evt => fn( evt.data );
    requestAnimationFrame( (t) => channel.port1.postMessage( t ) );
  };
}

// A Web-Audio based timer, abusing AudioScheduledSourceNode
// Allows for quite correct scheduling even in blurred pages
const audioTimer = new class AudioTimer {
  constructor() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const context = this.context = (
      AudioTimer.shared_context || (AudioTimer.shared_context = new AudioCtx())
    );
    const silence = this.silence = context.createGain();
    silence.gain.value = 0;
    silence.connect(context.destination);
  }
  async schedule(time) {
    const context = this.context;
    await context.resume(); // in case we need user activation
    return new Promise((res) => {
      const node = context.createOscillator();
      node.connect(this.silence);
      node.onended = (evt) => res(performance.now());
      node.start(0);
      node.stop(context.currentTime + (time / 1000));
    })
  }
}

