class CanvasAnime {

  constructor() {
    const CI = this;

    CI.data = {old:[], new:[]};

  }

  initial(base) {
    const CI = this;

    CI.B = base;

    CI.dim = CI.B.dim;

    CI.color = CI.B.color;

    CI.canvas = d3.select(CI.B.vm.$refs.main_canvas)

    CI.context = CI.canvas.node().getContext('2d');

    CI.customBase = document.createElement('custom');
    CI.d3_main_group = d3.select(CI.customBase); // replacement of SVG

    CI.d3_x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, CI.dim.width]);

    CI.d3_y = d3.scaleLinear()
      .domain([0,100])
      .range([0, CI.dim.height]);

    // CI.draw_loop = d3.timer(function(elapsed){
    //   CI.draw();
    // });

  }

  prepareData(data) {
    const CI = this;

    CI.update(data)
  }

  update(data_active) {
    const CI = this;

    CI.draw(data_active)

  }

  _update(data) {

    const CI = this;

    CI.B.c_appended = false;

    data.forEach((d,i)=> {
      CI.d3_main_group
        .append('c1')
        .attr('x', d[0])
        .attr('y', d[1])
        .attr("c", CI.color[d[6]])
        .attr("r", d[4])
        .transition()
        .delay(d[5])
        .duration(CI.B.transition_time)
        .attr('x', d[2])
        .attr('y', d[3])
        .attr("r", d[4]/2)
        .on("end", function() { this.remove() })
    })

    CI.B.c_appended = true;

  }

  draw(data_active) {
    const CI = this;


    var start = new Date();
    const context = CI.context;
    context.clearRect(0, 0, CI.dim.width, CI.dim.height);
    data_active.forEach(function (datum0, i0) {
      datum0.c.forEach(d => {
        context.fillStyle = CI.color[d[6]];
        context.beginPath();
        // context.moveTo(d[2], d[3]);
        context.arc(d[2], d[3], d[4], 0, 2 * Math.PI);
        context.fill();
      });
    });
    var end = new Date();
    // let renderTime += (end - start);

    //   const context = CI.context;
    //   context.clearRect(0, 0, CI.dim.width, CI.dim.height);
    //
    //
    //   var elements = CI.d3_main_group.selectAll('c1');
    //
    //   elements.each(function(){
    //     var node = d3.select(this);
    //     const x = node.attr('x'), y = node.attr('y')
    //     if (y < -5 || y > CI.dim.height+5) return
    //     if (x < -5 || x > CI.dim.width+5) return
    //     context.fillStyle = node.attr('c');
    //     context.beginPath();
    //     context.arc(x, y, node.attr('r'), 0, 2*Math.PI);
    //     context.fill();
    //   })
  }

}

export default new CanvasAnime();
