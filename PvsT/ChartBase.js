import canvasAnime from './CanvasAnime.js'

class ChartBase {

  constructor() {
    const CI = this;

    CI.dim = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    CI.channels = [
      {label: "T-Series", channel_id: "UCq-Fj5jknLsUf-MWSy4_brA", id: "1"},
      {label: "PewDiePie", channel_id: "UC-lHJZR3Gqxm24_Vd_AJ5Yw", id: "2"},
    ]

    CI.data_stash = [];
    CI.transition_time = 2000;
    CI.interval_time = CI.transition_time/20;
    CI.bash = CI.transition_time / CI.interval_time;
    CI.current_date = ""
    CI.initialized = false;
    CI.rerun = false;
    CI.color = {"1": "rgba(239,26,38,1)", "2": "rgba(10,188,220,1)"}


    CI.calculateDims();

    CI.reactive_data = {
      dim: CI.dim,
      current_date:"",
      leading_color: "",
      animation_duration: 300,
      circle_scale: 1,
      test_cut: 0,
      data_setup: false
    }

    CI.c_appended = true;

    CI.d3_timeScale = d3.scaleLinear()
      .domain([0, CI.transition_time])
      .range([0,1]);

    CI.displayed_datum = null;
  }


  initial(vm) {
    const CI = this;

    CI.vm = vm;

    if (CI.initialized) return
    CI.initialized = true

    CI.canvasAnime = canvasAnime;
    CI.canvasAnime.initial(CI);

    CI.breakpoints = [100, 400, 600, 2000]

   CI.prepareData()


  }


  calculateDims() {
    const CI = this;


    CI.dim.channels = {}

    const [w, h] = [CI.dim.width, CI.dim.height];
    CI.dim.circle_max_radius = h*.27;


    CI.dim.channels["1"] = {
      gen: {x:w*.31,y:h*.6,width:CI.dim.circle_max_radius},
      color: CI.color["1"]
    }

    CI.dim.channels["2"] = {
      gen: {x:w*.69,y:h*.4,width:CI.dim.circle_max_radius},
      color: CI.color["2"]
    }

  }


  prepareData() {
    const CI = this;
    CI.reactive_data.data_setup = false;

    d3.csv('data/t-series_subs.csv')
      .then(function(data) {
        const t_data = data
        d3.csv('data/pewdiepie_subs.csv')
          .then(function(data) {
            const p_data = data;

            const t_dct = {};
            t_data.forEach(d => {
              t_dct[d.Date] = d.Subs
            })

            const data0 = []

            p_data.forEach((d, i) => {
              const t_val = !isNaN(parseInt(t_dct[d.Date])) ? parseInt(t_dct[d.Date]) : 0;
              const p_val = !isNaN(parseInt(d.Subs)) ? parseInt(d.Subs) : 0;
              let t_diff = 0;
              let p_diff = 0;
              if (i > 0) {
                t_diff = t_val - data0[i-1].t_val
                p_diff = p_val - data0[i-1].p_val
              }
              data0.push({date: d.Date, t_val, p_val, t_diff, p_diff})
            })
            console.log("start")
            data0.forEach((datum0, i0) => {
              const circle_scale = (i0 < CI.breakpoints[0] ? 1 : i0 < CI.breakpoints[1] ? 10 : i0 < CI.breakpoints[2] ? 100 : i0 < CI.breakpoints[3] ? 1000 : 10000);
              const datum = [];
              for (let j = 0; j < 2; j++) {
                let diff, val;
                if (j === 0) {diff = datum0.t_diff; val = datum0.t_val}
                else {diff = datum0.p_diff; val = datum0.p_val}
                const channel_id = j+1+"";
                diff = diff/circle_scale;
                if (diff > 100) {
                  console.log("position:", i0, "diff:", diff, "circle_scale:", circle_scale)
                  // diff = 100;
                }

                const absorber = CI.dim.channels[channel_id].gen;
                const sub_value = channel_id === "1" ? datum0.t_val : datum0.p_val;
                for (let i = 0; i < diff; i++) {
                  const point = ["_x", "_y", "x", "y", "r", "delay", "c_id"];
                  [point[0], point[1]] = CI.getRandBorderPoint(channel_id);
                  [point[2], point[3]] = CI.getCircleBorderPoint(sub_value, absorber,[point[0], point[1]] );
                  point[4] = (i0 < CI.breakpoints[0] ? 2.5 : i0 < CI.breakpoints[1] ? 3.5 : i0 < CI.breakpoints[2] ? 4.2 : 6);
                  point[5] = (CI.interval_time / (diff / (i+1)));
                  point[6] = channel_id;

                  point[5] += i0*CI.interval_time
                  point[0] = d3.interpolate(point[0], point[2])
                  point[1] = d3.interpolate(point[1], point[3])
                  point[7] = d3.interpolate(point[4], point[4]/2)

                  datum.push(point);
                }
              }
              let dots_on_screen = CI.data_stash.slice(
                (i0 - CI.transition_time/CI.interval_time > 0 ? i0 - CI.transition_time/CI.interval_time : 0)
              ).reduce((total, d) => {
                return total + d.c.length
              },0)

              CI.data_stash.push({date: datum0.date, c: d3.shuffle(datum), c_scale: circle_scale, t_val: datum0.t_val, p_val: datum0.p_val, dots_on_screen: dots_on_screen})

            })
            CI.reactive_data.data_setup = true;
            // console.log(CI.data_stash.slice(0,300))
          })
      })

  }

  run() {
    const CI = this;

    CI.channels_id_lbl_map = {}
    CI.channels.forEach(d => CI.channels_id_lbl_map[d.label] = d.channel_id)

    CI.vm.$refs.date_semafor.textContent = CI.data_stash[0].date;

    CI.calculateDims();

    const sleep = m => new Promise(r => setTimeout(r, m));
    d3.timer((t) => {
      const data_active = CI.data_stash.slice(
        ((t / CI.interval_time) - CI.bash > 0 ? (t / CI.interval_time) - CI.bash : 0),
        (t / CI.interval_time)+1
      )

      data_active.forEach(function(datum0,i0){
        datum0.c.forEach(d => {
          var time = d3.easeCubic(CI.d3_timeScale(t - d[5]));
          d[2] = d[0](time);
          d[3] = d[1](time);
          d[4] = d[7](time);
        })

      });

      CI.update(data_active)
    })

    // ;(async() => {
    //   CI.rerun = true;
    //   // await sleep(10000);
    //   CI.rerun = false;
    //   for (let i = CI.reactive_data.test_cut; i < CI.data_stash.length; i++) {
    //     if (CI.rerun) {break;}
    //     CI.update(CI.data_stash[i])
    //     await sleep(CI.interval_time);
    //     // while (!CI.c_appended) {
    //     //   console.log(0)
    //     //   await sleep(5);
    //     // }
    //   }
    // })();

  }

  update(active_data) {

    const CI = this;
    if (CI.displayed_datum !== active_data[0])  {
      CI.displayed_datum = active_data[0];

      CI.drawMainCircles(CI.displayed_datum);
      CI.updateNums(CI.displayed_datum)
    }

    CI.canvasAnime.update(active_data);
  }

  updateNums(data) {
    const CI = this;

    if (CI.reactive_data.circle_scale !== data.c_scale) {

      d3.select(CI.vm.$refs.circle_scale)
        .select("span")
        .transition()
        .ease(d3.easeLinear)
        .duration(CI.transition_time)
        .tween("text", function(d) {
          const current_num = parseInt(this.textContent)
          var i = d3.interpolate(current_num, data.c_scale);

          return function(t) {
            this.textContent = Math.round(i(t));
          };
        });
    }
    CI.reactive_data.circle_scale = data.c_scale;

    CI.vm.$refs.date_semafor.textContent = data.date;

    d3.select(CI.vm.$refs.t_semafor)
      .attr("x", -CI.dim.circle_max_radius * (data.t_val/100000000)-15-data.t_val.toString().length*35)
      .transition()
      .ease(d3.easeLinear)
      .duration(CI.interval_time)
      .tween("text", function(d) {
        const current_sub_count = parseInt(this.textContent.split(",").join(""))
        var i = d3.interpolate(current_sub_count, data.t_val);

        return function(t) {
          this.textContent = Math.round(i(t)).toLocaleString('en-US');
        };
      });

    d3.select(CI.vm.$refs.p_semafor)
      .attr("x", CI.dim.circle_max_radius * (data.p_val/100000000)+15)
      .transition()
      .ease(d3.easeLinear)
      .duration(CI.interval_time)
      .tween("text", function() {
        const current_sub_count = parseInt(this.textContent.split(",").join(""))
        var i = d3.interpolate(current_sub_count, data.p_val);

        return function(t) {
          this.textContent = Math.round(i(t)).toLocaleString('en-US');
        };
      });

    CI.vm.$refs.sub_gap_semafor.style.color = CI.color[data.p_val - data.t_val < 0 ? "1" : "2"]
    // CI.vm.$refs.sub_gap_semafor.textContent = Math.abs(data.p_val - data.t_val).toLocaleString('en-US')

    d3.select(CI.vm.$refs.sub_gap_semafor)
      .transition()
      .ease(d3.easeLinear)
      .duration(CI.interval_time)
      .tween("text", function() {
        const current_sub_gap = parseInt(this.textContent.split(",").join(""))
        var i = d3.interpolate(current_sub_gap, Math.abs(data.p_val - data.t_val));

        return function(t) {
          this.textContent = Math.round(i(t)).toLocaleString('en-US');
        };
      })

  }

  drawMainCircles(datum) {
    const CI = this;

    d3.select(CI.vm.$refs.t_circle)
      .attr("transform", 'translate(' + (CI.dim.channels['1'].gen.x) + ', ' + (CI.dim.channels['1'].gen.y) + ') scale(' + (datum.t_val / 100000000) + ')')

    d3.select(CI.vm.$refs.p_circle)
      .attr("transform", 'translate(' + (CI.dim.channels['2'].gen.x) + ', ' + (CI.dim.channels['2'].gen.y) + ') scale(' + (datum.p_val / 100000000) + ')')
  }

  getCircleBorderPoint(sub_value, absorber, source) {
    const CI = this;
    let diffX = absorber.x - source[0];
    let diffY = absorber.y - source[1];

    let pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

    let targer_radius = CI.dim.circle_max_radius * (sub_value/100000000);
    targer_radius += targer_radius > 20 ? -10 : 0;

    let offsetX = (diffX * targer_radius) / pathLength;
    let offsetY = (diffY * targer_radius) / pathLength;

    return [absorber.x - offsetX, absorber.y - offsetY]
  }

  getRandBorderPoint(c_id) {
    const CI = this;

    if (Math.random() < .5) {
      return [Math.random()*CI.dim.width, Math.random() < .5 ? -10 : CI.dim.height+10]
    } else {
      return [c_id === "1" ? -10 : CI.dim.width+10, Math.random()*CI.dim.height]

    }

  }

}

export default new ChartBase();
