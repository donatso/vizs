import CircleAnimationModel from "./CircleAnimationModel.js"

window.CircleAbsorber = CircleAbsorber;

export default function CircleAbsorber(cont) {
  const self = this;

  self.dom = {};
  self.dom.cont = d3.select(cont);
  self.timer = null;
  self.last_timer_elapsed = 0;
  self.timer_elapsed = 0;
  self.running = false;
  self.circleAnimationModel = new CircleAnimationModel()

  self.initial();
  if (window.location.search.indexOf('start=1') !== -1) self.runToggle()
}

CircleAbsorber.prototype.initial = function () {
  const self = this;

  self.createElements();
  self.data = CircleAbsorber.prepareInventedData()
  self.circleAnimationModel.initial(self.dim, 6000, 2000);

  self.timer = d3.timer(self.tick.bind(self));
  if (!self.running) self.stop()
}

CircleAbsorber.prototype.createElements = function () {
  const self = this;

  self.dom.start_btn = self.dom.cont.append("button").attr("class", "start").html("start").on("click", self.runToggle.bind(self))
  self.dom.canvas = self.dom.cont.append("canvas")

  self.dim = {width: window.innerWidth-5, height: window.innerHeight-5}

  Object.entries({
    position: "absolute",
    right: "0",
    margin: "10px",
    padding: "10px 20px",
    "background-color": "black",
    color: "white",
    "font-size": "28px",
    cursor: "pointer"
  }).forEach(([k, v]) => {
    self.dom.start_btn.node().style[k] = v;
  })

  self.dom.canvas.attr("width", self.dim.width).attr("height", self.dim.height)
  self.context = self.dom.canvas.node().getContext('2d');
}

CircleAbsorber.inventData = function (data_len, values_len, diff_random) {
  const data = [],
    d3_color = d3.scaleOrdinal().range(d3.schemeSet3)

  for (let i = 0; i < data_len; i++) {
    const datum = {values: []};
    data.push(datum)
    for (let j = 0; j < values_len; j++) {
      let last_value = getLastValue(i,j),
        value = last_value + Math.floor(Math.random()*diff_random);

      datum.values.push({value, color: d3_color(j)})
    }
  }
  return data

  function getLastValue(i,j) {
    if (i === 0) return 0
    return data[i-1].values[j].value
  }

}

CircleAbsorber.prepareInventedData = function() {
  const values_key = "values",
    value_key = "value";
  const data = CircleAbsorber.inventData(100, 10, 100, values_key, value_key);
  CircleAnimationModel.calculateDiff(data, d => d[values_key], d => d[value_key])

  return data
}

CircleAbsorber.prototype.tick = function(t) {
  const self = this;
  t += self.last_timer_elapsed
  self.timer_elapsed = t;
  self.circleAnimationModel.update(t, self.data, self.getTargetMousePos.bind(self));
  self.context.clearRect(0, 0, self.dim.width, self.dim.height);
  self.circleAnimationModel.draw(t, self.context)
}

CircleAbsorber.prototype.getTargetMousePos = function() {
  const self = this;
  initializeListener()

  return self.mouse_pos;

  function initializeListener() {
    if (self.listenmousemove) return
    self.listenmousemove = true;
    self.mouse_pos = [self.dim.width / 2, self.dim.height/2]
    self.dom.canvas
      .on('mousemove', function() {
        self.mouse_pos = d3.mouse(this);
      });
  }
}

CircleAbsorber.prototype.runToggle = function() {
  const self = this;

  if (self.running) self.stop();
  else self.start();
}

CircleAbsorber.prototype.start = function() {
  const self = this;

  self.running = true;
  self.dom.start_btn.html("stop")
  self.timer.restart(self.tick.bind(self))
}

CircleAbsorber.prototype.stop = function () {
  const self = this;

  self.timer.stop();
  self.last_timer_elapsed = self.timer_elapsed;
  self.dom.start_btn.html("start")
  self.running = false;
}

