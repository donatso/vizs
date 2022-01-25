const Data = {};
export default Data;

Data.setupAxis = function (dim) {

  const d3y = d3.scaleBand()
    .range([(dim.height - dim.rect.y_offset) * 2, 0])
    .domain(d3.range(20).map((d, i) => i).reverse())
    .padding(0.1);

  const d3x = d3.scaleLinear()
    .range([0, dim.rect.width])
    .domain(0, 100)

  return [d3x, d3y]
}


Data.structureData = function(data) {
  data = Numify(data)
  return group(data, d => d.name)

  function Numify(data) {
    data.forEach(d => {d._time = parseFloat(d.time);d._value = parseFloat(d.value);})
    return data
  }

  function group(data, classGetter) {
    const classDict = {}
    data.forEach(d => pushToObjectKey(classDict, classGetter(d), d))
    return classDict


    function pushToObjectKey(dct, k, v) {
      if (!dct.hasOwnProperty(k)) dct[k] = []
      dct[k].push(v)
    }
  }
}

Data.sortByKey = function(data, key) {
  function sortBy(a, b) {
    if (a[key] < b[key])
      return -1;
    if (a[key] > b[key])
      return 1;
    return 0;
  }
  return data.sort(sortBy)
}

Data.handleRawData = function(raw_data, file_name) {
  const delimiter = Data.findDelimiter(raw_data)
  const data = d3.dsvFormat(delimiter).parse(raw_data)
  return data
}

Data.findDelimiter = function (raw_data) {
  const rows = raw_data.split("\n").slice(0,20),
    delimiters = [";", "\t", ","]
  let dl;
  iter()
  return dl

  function iter() {
    for (let i = 0; i < delimiters.length; i++) {
      dl = delimiters[i];
      const first_row_count = occur(rows[0], dl)
      if (first_row_count < 1) continue
      if (rows.every(s => occur(s, dl) === first_row_count)) break
    }
  }

  function occur(s, substr) {
    const regex = new RegExp( substr, 'g' );
    return (s.match(regex) || []).length;
  }
}

Data.timeToDate = function(data, date_format) {
  data.forEach(d => {
    d.time = d3.timeParse(date_format)(d.time).getTime()
  })
  return data
}


