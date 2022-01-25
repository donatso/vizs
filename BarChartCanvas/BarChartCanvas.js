import VizDatum from "./VizDatum/index.js"

export default function BarChartCanvas() {
  const self = this;
  self.nodes = {};
  self.ticks = {}

  self.ctx = null;
  self.dim = {};
  self.d3x = null;
  self.d3y = null;
}

BarChartCanvas.prototype.updateState = function(ctx, dim, d3x, d3y, d3_color, transition_time, text_scale) {
  const self = this;
  self.ctx = ctx;
  self.dim = dim;
  self.d3x = d3x;
  self.d3y = d3y;
  self.d3_color = d3_color;
  self.transition_time = transition_time;
  self.text_scale = text_scale;
}

BarChartCanvas.prototype.clear = function() {
  const self = this;
  self.nodes = {}
  self.ticks = {}
}

BarChartCanvas.prototype.update = function(data, t) {
  const self = this;
  self.updateRects(data, t)
  self.updateTicks(t)
}

BarChartCanvas.prototype.updateRects = function(data, t) {
  const self = this;

  const nodes = self.nodes;
  VizDatum.setupEnterExit(data, nodes)
  for (let k in nodes) {
    if (!nodes.hasOwnProperty(k)) continue
    const node = nodes[k]
    enter(node)
    update(node)
    exit(node, nodes)
    node.calc(t)
  }

  function enter(node) {
    if (!node.enter) return
    node.attrs = {
      x:25,
      y: self.dim.height,
      w:0,
      h:self.d3y.bandwidth(),
      color: self.d3_color(node.data.name),
    }
  }
  function update(node) {
    if (node.exit) return
    const trans = {t:t, tt: self.transition_time, dt:0}
    node
      .attr("y", self.d3y(node.data.position), trans)
      .attr("w", self.d3x(node.data.value))
  }

  function exit(node, nodes) {
    if (!node.exit) return
    const trans = {t: t, tt: self.transition_time, dt: 0, endCallback() {delete nodes[node.data.name]}}
    node
      .attr("w", self.d3x(node.data.value))
      .attr("y", self.d3y(20), trans)
  }
}

BarChartCanvas.prototype.updateTicks = function(t) {
  const self = this;

  const ticks_count = 6,
    ticks_data = self.d3x.ticks(ticks_count).map(n => ({value: n, name: numberFormat(n,1)}));
  function numberFormat(n,d){let x=(''+n).length,p=Math.pow;d=p(10,d);x-=x%3;return Math.round(n*d/p(10,x))/d+" kMGTPE"[x/3]}

  const nodes = self.ticks,
    data = ticks_data;

  VizDatum.setupEnterExit(data, nodes)
  for (let k in nodes) {
    if (!nodes.hasOwnProperty(k)) continue
    const node = nodes[k]
    enter(node)
    update(node)
    exit(node, nodes)
    node.calc(t)
  }

  function enter(node) {
    if (!node.enter) return
    node.attrs = {
      x:25,
      alpha: 1
    }
  }
  function update(node) {
    if (node.exit) return
    const trans = {t:t, tt: self.transition_time, dt:0}
    node
      .attr("x", self.d3x(node.data.value))
  }

  function exit(node, nodes) {
    if (!node.exit) return
    const trans = {t: t, tt: 500, dt: 0, endCallback() {delete nodes[node.data.name]}}
    node
      .attr("alpha", 0, trans)
      .attr("x", self.d3x(node.data.value))
  }

}

BarChartCanvas.prototype.draw = function() {
  const self = this;
  const ctx = self.ctx,
    nodes = self.nodes,
    dim = self.dim,
    text_scale = self.text_scale,
    rect_h = self.d3y.bandwidth()

  ctx.translate(dim.rect.x_offset, dim.rect.y_offset);
  drawRectNodes()
  drawAxis()
  ctx.translate(-dim.rect.x_offset, -dim.rect.y_offset);

  function drawRectNodes() {
    for (let k in nodes) {
      if (!nodes.hasOwnProperty(k)) continue
      const d = nodes[k].data;
      const a = nodes[k].attrs;

      drawRect(a, d);
      drawRectText(a, d);
      if (d.value) drawTextRight(a, d);
      drawTextLeft(a, d);
    }

    function drawRect(a, d) {
      ctx.fillStyle = a.color;
      ctx.fillRect(0, a.y, a.w, a.h);
    }

    function drawRectText(a, d) {
      ctx.save();ctx.beginPath();ctx.rect(0, a.y, a.w, a.h);ctx.clip();

      const fs = 32*text_scale
      ctx.fillStyle = "white";
      ctx.font = fs+'px sans-serif';
      ctx.textAlign = "end";
      ctx.fillText(d.name, a.w - 15, a.y + a.h / 2 + fs / 2);

      ctx.restore()
    }

    function drawTextRight(a, d) {
      const fs = 24*text_scale
      ctx.fillStyle = "white";
      ctx.font = fs+'px sans-serif';
      ctx.textAlign = "start";
      ctx.fillText(Math.floor(d.value).toLocaleString("en-US"), a.w + 10, a.y + a.h / 2 + fs / 2);
    }

    function drawTextLeft(a, d) {
      const fs = 24*text_scale
      ctx.fillStyle = "white";
      ctx.font = fs+'px sans-serif';
      ctx.textAlign = "end";
      ctx.fillText(d.type, -10, a.y + a.h / 2 + fs / 2);
    }
  }

  function drawAxis () {
    const ticks = self.ticks,
      width = dim.rect.width

    drawLine();
    for (let k in ticks) {
      if (!ticks.hasOwnProperty(k)) continue
      const d = ticks[k].data;
      const a = ticks[k].attrs;

      ctx.globalAlpha = a.alpha;
      drawTicks(a, d);
      drawLabel(a, d);
      ctx.globalAlpha = 1;
    }

    function drawLine() {
      ctx.beginPath()
      ctx.moveTo(0, -15);
      ctx.lineTo(width, -15);
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }

    function drawTicks(a, d) {
      ctx.beginPath()
      ctx.moveTo(a.x, - 23);
      ctx.lineTo(a.x, -7);
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }

    function drawLabel(a, d) {
      const fs = 24*text_scale
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = fs+'px sans-serif';
      ctx.fillText(d.name, a.x, -30);

      ctx.restore()
    }

  }
}

