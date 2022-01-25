const examples = {}
export default examples;

examples.got = function (store) {
  store.title = "GOT screen time in seconds"
  store.background_url = store.bg_image.src = "./data/backgroundgot.jpg"
  store.counter_text = "Episode:"
  store.data_url = "./data/got_screentime.tsv"
}

examples.yt = function (store) {
  store.title = "Most Viewed Youtube Videos"
  store.background_url = store.bg_image.src = "./data/youtubebackground.jpg"
  store.counter_text = ""
  store.date_format = "%d.%m.%Y"
  store.data_url = "./data/views.csv"
}

examples.loadExample = function(store) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("example") === "yt") examples.yt(store)
  else if (urlParams.get("example") === "got") examples.got(store)
  else examples.yt(store)
}


