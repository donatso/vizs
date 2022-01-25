import FrameByFrameCanvasRecorder from "../FrameByFrameCanvasRecorder/index.js";

const Run = {}
export default Run;
Run.start = function() {
}

Run.run = function(data, canvas, animation_time, updateF, record, record_by_frame) {
  const [start_time, end_time] = getTimespan(data),
    timeScale = d3.scaleLinear().domain([0,animation_time]).range([start_time, end_time]);

  if (record) return  runRecord()
  else if (record_by_frame) runRecordByFrame().catch(reason => {throw reason})
  else return run()

  function run() {
    const timer = d3.timer(t => {
      if (t > animation_time) timer.stop()
      tick(t)
    })
    timer.kill = () => {
      timer.stop()
    }
    return timer
  }

  function runRecord() {
    const mediaRecorder = setupRecorder()
    const timer = d3.timer(t => {
      if (t > animation_time) timer.stop()
      tick(t)
    })
    timer.kill = () => {
      mediaRecorder.stop();
      timer.stop()
    }
    return timer
  }

  async function runRecordByFrame() {
    const FPS = 60;
    const vid = document.body.appendChild(document.createElement("video"))
    vid.setAttribute("controls", "")
    const recorder = new FrameByFrameCanvasRecorder(canvas, FPS);

    let frame = 0, t = 0, duration = 5
    while (frame++ < FPS * duration) {
      tick(t)
      t += 1000 / FPS;
      await recorder.recordFrame(); // record at constant FPS
    }
    await recorder.setupVideo(vid);
  }

  function tick(t) {
    let t_time = timeScale(t),
      nodes = []
    for (let k in data) {
      if (!data.hasOwnProperty(k)) continue
      const value = Run.getProgressValue(data[k], t_time)
      nodes.push({name:k, value, type: data[k][0].type})
    }
    nodes.sort((a,b) => b.value - a.value)
    nodes = nodes.slice(0,20)
    nodes.forEach((d, i) => d.position = i)
    updateF(nodes, t, t_time)
  }
}



Run.getProgressValue = function (data, t_time) {
  let value = null,
    bisect = d3.bisector(d => d._time),
    i = bisect.left(data, t_time);

  if (i > 0 && i < data.length) {
    const datum_left = data[i-1], datum_right = data[i]
    const progress_to_right = (t_time - datum_left._time) / (datum_right._time - datum_left._time)
    value = datum_left._value + (datum_right._value - datum_left._value) * progress_to_right
  }
  return value
}


function getTimespan(data) {
  const flatten = []
  for (let k in data) {
    if (!data.hasOwnProperty(k)) continue
    flatten.push(...data[k])
  }
  return d3.extent(flatten, d => d._time)
}

function setupRecorder() {
  const canvas = document.querySelector("canvas");
  const videoStream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(videoStream);

  let chunks = [];
  mediaRecorder.ondataavailable = function(e) {
    chunks.push(e.data);
  };

  mediaRecorder.onstop = function(e) {
    const blob = new Blob(chunks, { 'type' : 'video/mp4' });
    chunks = [];
    const videoURL = URL.createObjectURL(blob);
    const video = createVideo()
    video.src = videoURL;

  };
  mediaRecorder.ondataavailable = function(e) {
    chunks.push(e.data);
  };
  mediaRecorder.start();
  return mediaRecorder

  function createVideo() {
    let video = canvas.parentNode.querySelector("video")
    if (!video) video = canvas.parentNode.appendChild(document.createElement("video"))
    video.setAttribute("controls", "")
    video.style.maxWidth = "100%"
    return video
  }
}