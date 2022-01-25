export default function CircleAnimationModel () {
  const self = this;

  self.nodes = {};
}


 CircleAnimationModel.prototype.initial = function(dim, transition_time, interval_time) {
    const self = this;

    self.dim = dim;
    self.transition_time = transition_time;
    self.interval_time = interval_time;
    self.bash = transition_time / interval_time;
  }

CircleAnimationModel.calculateDiff = function(data, getValues, getValue) {

  for (let i = 0; i < data.length; i++) {
    const values = getValues(data[i]);
    for (let j = 0; j < values.length; j++) {
      const d = values[j]
      const value = getValue(d)
      d.diff = value - getLastValue(i,j);
    }
  }

  function getLastValue(i,j) {
    if (i === 0) return 0;
    const values = getValues(data[i-1]);
    return getValue(values[j]);
  }

}

CircleAnimationModel.prototype.circlesEnter = function(datum, iter) {
  const self = this;

  for (let i = 0; i < datum.values.length; i++) {
    const d = datum.values[i];
    for (let j = 0; j < d.diff; j++) {
      const node_id = Math.random();
      const trans = {
        t:iter*self.interval_time,
        tt: self.transition_time,
        dt: (self.interval_time / (d.diff / (j+1))),
        ti: 0,
      };
      const source = getRandomOutOfWindowPoints()
      const attrs = {
        x: source[0],
        y: source[1],
        color: d.color,
        r: 2
      }
      self.nodes[node_id] = {trans, attrs}
    }
  }

  function getRandomOutOfWindowPoints() {
    if (Math.random() < .5) {
      return [Math.random()*self.dim.width, Math.random() < .5 ? -10 : self.dim.height+10]
    } else {
      return [Math.random() < .5 ? -10 : self.dim.width+10, Math.random()*self.dim.height]
    }
  }

}

CircleAnimationModel.prototype.update = function(t, data, targetF) {
  const self = this;

  const iter = Math.floor(t/self.interval_time),
    slice = [
      iter - self.bash > 0 ? iter - self.bash : 0,
      iter+1
    ],
    data_active = data.slice(...slice)
  data_active.forEach((datum, i) => {
    if (!datum.c) self.circlesEnter(datum, slice[0]+i);
    datum.c = true;
  })

  for (let k in self.nodes) {
    if (!self.nodes.hasOwnProperty(k)) continue
    const attrs = self.nodes[k].attrs,
      trans = self.nodes[k].trans,
      time_scale = d3.scaleLinear().domain([0, trans.tt]).range([0,1]),
      time = time_scale(t - (trans.t + trans.dt));

    if (time < 0) continue
    if (time > 1) {delete self.nodes[k];continue}

    let t2 = (time-trans.ti)/(1-trans.ti)
    trans.ti = time;

    const target = targetF();
    attrs.x = d3.interpolate(attrs.x, target[0])(t2);
    attrs.y = d3.interpolate(attrs.y, target[1])(t2);
  }

}

CircleAnimationModel.prototype.draw = function(t, ctx) {
  const self = this;
  for (let k in self.nodes) {
    if (!self.nodes.hasOwnProperty(k)) continue
    const node = self.nodes[k];
    const d = node.attrs;
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
    ctx.fill();
  }
}