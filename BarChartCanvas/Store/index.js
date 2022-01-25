import Data from './data.js';
import Run from './run.js';
import Style from './style.js';
import Dom from './dom.js';
import Canvas from './canvas.js';
import Examples from './examples.js';
import BarChartCanvas from "../BarChartCanvas.js"

export default function Store() {
  const self = this;

  self.canvas = null;
  self.ctx = null;
  self.data_stash = [];
  self.d3x = null;
  self.d3y = null;

  self.background_url = ""
  self.bg_image = new Image()
  self.title = ""
  self.counter_text = ""
  self.resolution = "HD"
  self.animation_time = 360 * 1000;
  self.transition_time = 1000;
  self.text_scale = 1
  self.date_format = ""

  self.barChart = new BarChartCanvas();

}

Store.prototype.initial = function (data) {
  const self = this;

  self.data = data;
  self.configure()
}

Store.prototype.configure = function() {
  const self = this;

  self.dim = Style.calculateDims(Style.resolutions[self.resolution]);
  self.text_scale = [.5, .7, 1.1, 1.8][(["SD", "HD", "FHD", "UHD"].indexOf(self.resolution))]
  ;[self.canvas, self.ctx] = Dom.setupCanvas(self.dim);
  self.d3_color = Style.setupColors();

  let data = JSON.parse(JSON.stringify(self.data))
  if (self.date_format) data = Data.timeToDate(data, self.date_format)
  self.data_stash = Data.structureData(data);
  ;[self.d3x, self.d3y] = Data.setupAxis(self.dim);
  console.log(self.data_stash)

  self.barChart.clear()
  self.barChart.updateState(self.ctx, self.dim, self.d3x, self.d3y, self.d3_color, self.transition_time, self.text_scale)
}

Store.prototype.handleFile = function (file_data, file_name) {
  const data = Data.handleRawData(file_data, file_name)
  Dom.createTable(data)
  this.initial(data)
  // this.run()
}

Store.prototype.run = function () {
  const self = this;
  self.stop()
  self.configure()
  self.timer = Run.run(self.data_stash, self.canvas, self.animation_time, self.update.bind(self), false)
}

Store.prototype.runRecord = function () {
  const self = this;
  self.stop()
  self.configure()
  self.timer = Run.run(self.data_stash, self.canvas, self.animation_time, self.update.bind(self), true)
}

Store.prototype.update = function(data, t, time) {
  const self = this;
  self.d3x.domain([0, d3.max(data, d => d.value)]);
  self.barChart.update(data, t);

  self.ctx.clearRect(0, 0, self.dim.width, self.dim.height);
  self.ctx.drawImage(self.bg_image, 0, 0, self.dim.width, self.dim.height);
  self.barChart.draw();
  self.draw(time);
}

Store.prototype.draw = function (time) {
  const self = this;
  const ctx = self.ctx, dim = self.dim, d3x = self.d3x;

  Canvas.drawTime(ctx, dim, time, self.counter_text, self.date_format, self.text_scale);
  Canvas.drawTitle(ctx, dim, self.title, self.text_scale);
}

Store.prototype.stop = function() {
  const self = this;
  if (self.timer) self.timer.kill();
}

Store.prototype.restart = function () {
  const self = this;
  self.run()
}

Store.prototype.updateConfig = function(name, value) {
  const self = this;
  if (name === "transition_time" || name === "animation_time") self[name] = parseFloat(value)*1000
  else if (name === "background_url") {self[name] = self.bg_image.src = value}
  else self[name] = value
  self.restart()
}

Store.prototype.loadExample = function() {
  Examples.loadExample(this)
}




