import Store from "./Store/index.js";
import DragAndDrop from "./components/DragAndDrop.js";
import SideBarConfigTemplate from "./components/SideBarConfigTemplate.js"

const store = new Store();

{
  store.loadExample()
  if (store.data_url) {
    fetch(store.data_url).then(resp => resp.text()).then(raw_data => {
      store.handleFile(raw_data, store.data_url)
      store.run()
    })
  }
}

{
  document.querySelector("#replay").addEventListener("click", function () {
    store.restart()
  })
  document.querySelector("#pause").addEventListener("click", function () {
    store.stop()
  })
  document.querySelector("#record").addEventListener("click", function () {
    store.runRecord()
  })
}

{
  const config = [
    {
      label: "Text & Background",
      elements: [
        {type: "text", name: "title", value: store.title},
        {type: "text", name: "counter_text", value: store.counter_text},
        {type: "text", name: "background_url", value: store.background_url},
      ]
    },
    {
      label: "Resolution",
      elements: [
        {type: "radio", name: "resolution", value: store.resolution, options: ["SD", "HD", "FHD", "UHD"]},
      ]
    },
    {
      label: "Durations",
      elements: [
        {type: "number", name: "animation_time", value: store.animation_time/1000},
        {type: "number", name: "transition_time", value: store.transition_time/1000},
      ]
    },
  ]
  const sideBarConfig = new SideBarConfigTemplate(document.querySelector("#side_bar_chart_config"), config)
  sideBarConfig.watch(store.updateConfig.bind(store), store)
}
{
  const config = [
    {
      label: "If time is a date",
      elements: [
        {type: "text", name: "date_format", value: store.date_format, help: "<a href='https://github.com/d3/d3-time-format#isoParse' target='_blank'/>"},
      ]
    }
  ]
  const sideBarConfig = new SideBarConfigTemplate(document.querySelector("#side_bar_data_config"), config)
  sideBarConfig.watch(store.updateConfig.bind(store), store)
}
{
  const cont = document.querySelector("#configuration")
  const dragAndDrop = new DragAndDrop(store.handleFile.bind(store));
  cont.appendChild(dragAndDrop.el);
}

