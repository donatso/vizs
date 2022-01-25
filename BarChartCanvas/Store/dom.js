const dom = {};
export default dom;

dom.setupCanvas = function (dim) {
  const canvas = document.querySelector("canvas")
  canvas.setAttribute("width", dim.width);
  canvas.setAttribute("height", dim.height);
  return [canvas, canvas.getContext("2d")]
}

dom.createTable = function (data) {
  let content = "";
  content += "<tr>";
  data.columns.forEach(k => {content += "<th>" + k + "</th>"})
  content += "</tr>";
  data.slice(0,20).forEach(datum => {
    content += "<tr>";
    data.columns.forEach(k => {content += "<td>" + datum[k] + "</td>"})
    content += "</tr>";
  })
  const table = document.querySelector("table")
  table.innerHTML = content;
}


