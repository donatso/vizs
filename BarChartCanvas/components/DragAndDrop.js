let IDENTIFIER = "id_" + Math.random(),
  IDT = "data-identifier='" + IDENTIFIER + "'",
  CSS =
`
<style type="text/css" ${IDT}>
[${IDT}] {

}
#drop-area {
  border: 2px dashed #ccc;
  border-radius: 20px;
  width: 480px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
}
[${IDT}] #drop-area.highlight {
  border-color: purple;
}
[${IDT}] p {
  margin-top: 0;
}
[${IDT}] .my-form {
  margin-bottom: 10px;
}
[${IDT}] #gallery {
  margin-top: 10px;
}
[${IDT}] #gallery img {
  width: 150px;
  margin-bottom: 10px;
  margin-right: 10px;
  vertical-align: middle;
}
[${IDT}] .button {
  display: inline-block;
  padding: 10px;
  background: #ccc;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #ccc;
}
[${IDT}] .button:hover {
  background: #ddd;
}
[${IDT}] #fileElem {
  display: none;
}
</style>
`

let HTML =
`
<div ${IDT} id="drop-area">
  <form class="my-form">
    <p>Drop file</p>
    <input type="file" id="fileElem">
    <label class="button" for="fileElem">Select csv file</label>
  </form>
  <span class="file_name"></span>
</div>
`

export default function Component(handleFile) {
  const self = this;
  self.el = strToNode(HTML);
  insertStyleMaybe()
  self.mounted();

  self.handleFile = handleFile
}

Component.prototype.mounted = function () {
  const self = this;

  let dropArea = self.el

  ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
    document.body.addEventListener(eventName, preventDefaults, false)
  })

  ;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
  })

  ;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
  })

  dropArea.addEventListener('drop', handleDrop, false)

  function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function highlight(e) {
    dropArea.classList.add('highlight')
  }

  function unhighlight(e) {
    dropArea.classList.remove('highlight')
  }

  function handleDrop(e) {
    handleFiles(e.dataTransfer.files)
  }

  function handleFiles(files) {
    if (files.length === 0) {return false;}
    const file = files[0],
      fr = new FileReader()
    fr.onload = onLoadFiles
    fr.readAsText(file);

    function onLoadFiles(e) {
      const content = e.target.result, file_name = file.name;
      self.el.querySelector(".file_name").innerHTML = file_name
      self.handleFile(content, file_name)
    }
  }

  const input = self.el.querySelector("input")
  input.addEventListener("change", function () {
    handleFiles(this.files)
  })

}

function insertStyleMaybe() {
  insertMaybe(document.head, "style["+IDT+"]", CSS)
}
function insertMaybe(cont, selector, html_str) {
  if (!cont.querySelector(selector)) cont.appendChild(strToNode(html_str))
}
function strToNode(html_str) {
  const fake = document.createElement('fake');fake.innerHTML = html_str;return fake.querySelector("*");
}



