export default function VizDatum (data) {
  const self = this;
  self.data = data;
  self.enter = true;
  self.attrs = {}
  self.exit = false;
  self.transitions = {};
}

VizDatum.prototype.attr = function(key, value, trans) {
  const self = this;
  const attrs = self.attrs, transitions = self.transitions

  if (value === attrs[key]) {}
  else if (!trans || trans.tt === 0) attrs[key] = value;
  else if (trans && trans.tt > 0) {
    if (!transitions.hasOwnProperty(key) || transitions[key].end !== value) {
      transitions[key] = {start:attrs[key], end: value, trans}
    }
  }
  return self
  
}

VizDatum.prototype.calc = function(t) {
  const self = this;
  const transitions = self.transitions;

  for (let key in transitions) {
    if (!transitions.hasOwnProperty(key)) continue
    const datum = transitions[key], trans = datum.trans,
      time_scale = d3.scaleLinear().domain([0, trans.tt]).range([0,1]),
      time = time_scale((t + trans.dt) - trans.t);

    if (time < 0) return;
    else if (time > 1) {
      self.attrs[key] = d3.interpolate(datum.start, datum.end)(1);
      if (trans.endCallback) trans.endCallback();
      delete transitions[key];
    }
    else self.attrs[key] = d3.interpolate(datum.start, datum.end)(time);
  }
}



VizDatum.setupEnterExit = function(data, nodes) {
  for (let k in nodes) {
    if (!nodes.hasOwnProperty(k)) continue
    nodes[k].enter = false
    nodes[k].exit = true
  }
  data.forEach(d => {
    if (!nodes.hasOwnProperty(d.name)) nodes[d.name] = new VizDatum()
    else nodes[d.name].enter = false
    nodes[d.name].exit = false
    nodes[d.name].data = d
  })
}
  
