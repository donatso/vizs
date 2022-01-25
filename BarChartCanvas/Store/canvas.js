const Canvas = {};
export default Canvas;

Canvas.drawTime = function (ctx, dim, time, counter_text, date_format, text_scale) {
  time = parseInt(time)
  time = time > 10000000 ? d3.timeFormat(date_format)(time) : time; // todo: in config if time is date
  const fs = 56*text_scale
  ctx.fillStyle = "white";
  ctx.font = fs+'px sans-serif';
  ctx.textAlign = "end";
  const text = counter_text + " " + time
  ctx.fillText(text, dim.width - 50*text_scale, dim.height - 60*text_scale);
}

Canvas.drawTitle = function (ctx, dim, title, text_scale) {
  const fs = 56*text_scale
  ctx.fillStyle = "white";
  ctx.font = fs+'px sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(title, dim.width/2, 65*text_scale);
}
