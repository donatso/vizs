let IDENTIFIER = "id_" + Math.random();
const IDT = "data-identifier='" + IDENTIFIER + "'";
const CSS =
  `
<style type="text/css" ${IDT}>
[${IDT}] {

}

[${IDT}] input[type='number'] {
  max-width: 120px;
}
</style>
`

let HTML =
  `
<div ${IDT}>
  <form>
    <ul class="collapsible expandable">
      
    </ul>
  </form>
</div>
`

export default function Component(parentNode, config) {
  const self = this;
  self.el = strToNode(HTML);
  insertStyleMaybe()
  parentNode.appendChild(self.el)
  self.create(config)
  self.mounted()
}

Component.prototype.create = function(config) {
  const self = this;
  const ul = self.el.querySelector("ul");

  for (let i = 0; i < config.length; i++) {
    const section = config[i],
      li = createSection(section)
    for (let j = 0; j < section.elements.length; j++) {
      const element = section.elements[j],
        type = element.type;
      if (type === "text" || type === "number") createTextInput(li, element)
      else if (type === "radio") createRadioInput(li, element)
    }
  }

  function createSection(section) {
    const li = document.createElement("li")
    li.setAttribute("class", "active")
    li.innerHTML = `<div class="collapsible-header">${section.label}</div><div class="collapsible-body"></div>`
    ul.appendChild(li)
    return li.querySelector(".collapsible-body")
  }

  function createTextInput(li, element) {
    const el = document.createElement("div")
    li.appendChild(el)
    el.innerHTML =
      `<div class="input-field inline">
        <input name="${element.name}" id="${element.name}_input" type="${element.type}" class="validate">
        <label for="${element.name}_input">${element.label || element.name}</label>
       </div>
       <div>${element.help || ""}</div>
       <br>`
    const input = el.querySelector(`#${element.name}_input`)
    input.value = element.value
  }

  function createRadioInput(li, element) {
    for (let i = 0; i < element.options.length; i++) {
      const option = element.options[i];
      li.innerHTML +=
        `<label>
          <input name="${element.name}" type="radio" value="${option}" ${option === element.value ? "checked" : ""} />
          <span>${option}</span>
         </label>`
    }
  }

}

Component.prototype.mounted = function () {
  const self = this;

  var elems = self.el.querySelectorAll('.collapsible');
  var instances = M.Collapsible.init(elems, {accordion: false});

}

Component.prototype.watch = function (updateConfig,) {
  const self = this;

  self.el.querySelector("form").addEventListener("change", function (e) {
    runLazy.call(this, "timeout", () => updateConfig(e.target.name, e.target.value), 2000)
  })
  function runLazy(id, handler, t) {
    if (this["timeout_"+id]) clearTimeout( this["timeout_"+id])
    this["timeout_"+id] = setTimeout(handler, t)
  }
}


function insertStyleMaybe() {
  insertMaybe(document.head, "style[" + IDT + "]", CSS)
}

function insertMaybe(cont, selector, html_str) {
  if (!cont.querySelector(selector)) cont.appendChild(strToNode(html_str))
}

function strToNode(html_str) {
  const fake = document.createElement('div');
  fake.innerHTML = html_str;
  return fake.querySelector("*");
}
