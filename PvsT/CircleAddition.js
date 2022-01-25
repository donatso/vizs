
  import chartBase from "./ChartBase.js"
  export default {
    template: `
    <div class="chart_cont">
    <button :disabled="!data.data_setup" @click="run" class="start">START</button>
    <div class="header">
      <div class="date" ref="date_semafor"></div>
      <div class="sub_gap_semafor" ref="sub_gap_semafor">0</div>
      <div class="right_head">
        <div class="circle_scale" ref="circle_scale">1 Dot = <span>1</span> Subs</div>
      </div>
    </div>
    <canvas
      ref="main_canvas"
      :width="dim.width"
      :height="dim.height"
    ></canvas>
    <svg
      ref="main_svg"
      :width="dim.width"
      :height="dim.height"
      class="main_svg"
    >
      <filter id="t_logo_filter" x="0%" y="0%" width="100%" height="100%">
        <feImage xlink:href="data/t_series_logo_circle.png"/>
      </filter>
      <filter id="p_logo_filter" x="0%" y="0%" width="100%" height="100%">
        <feImage xlink:href="data/pewds_logo_circle.png"/>
      </filter>
      <circle
        v-if="dim.channels"
        ref="t_circle"
        filter="url(#t_logo_filter)"
        :transform="'scale(0)'"

        :r="dim.channels['1'].gen.width"
      ></circle>
      <circle
        v-if="dim.channels"
        ref="p_circle"
        filter="url(#p_logo_filter)"
        :transform="'scale(0)'"
        :r="dim.channels['2'].gen.width"
      ></circle>
      <text
        style="font-size: 45px; fill: lightyellow;stroke: black"
        ref="t_semafor"
        :transform="'translate(' + (dim.channels['1'].gen.x) + ', ' + (dim.channels['1'].gen.y) + ')'"
        text-anchor="start"
      >0</text>
      <text
        style="font-size: 45px; fill: lightyellow;stroke: black"
        ref="p_semafor"
        :transform="'translate(' + (dim.channels['2'].gen.x) + ', ' + (dim.channels['2'].gen.y) + ')'"
        text-anchor="start"
      >0</text>

    </svg>

  </div>
    `,
    data() {
      return {
        data: chartBase.reactive_data,
        dim: chartBase.reactive_data.dim
      }
    },
    created() {
      const vm = this;

      document.head.appendChild(document.createElement("style")).innerHTML = `
      @import url('https://fonts.googleapis.com/css?family=Bungee');

    button.start {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;
      margin: 10px;
      padding: 10px 20px;
      background-color: black;
      color: white;
      font-size: 28px;
      cursor: pointer;

      transition: .3s;
    }

    button.start:hover {
      background-color: lightgrey;
      color: black;
    }

  .chart_cont {
    height: 100vh;
    color: white;

    background-image: url("data/darker_background.png");
    background-color: rgb(0,0,10); /* Used if the image is unavailable */
    background-position: center; /* Center the image */
    background-repeat: no-repeat; /* Do not repeat the image */
    background-size: cover; /* Resize the background image to cover the entire container */

    font-family: 'Bungee', cursive;

  }

  .header {
    display: block;
  }

  .header div.date {
    position: absolute;
    left: 60px;
    top: 20px;
    font-size: 55px;
  }

  .sub_gap_semafor {
    text-align: center;
    font-size: 45px;
    position: absolute;
    bottom: 20px;
    width: 100%;
  }

  .circle_scale {
    font-size: 55px;
  }

  .header div.right_head {
    position: absolute;
    bottom: 30px;
    right: 60px;
    z-index: 5;
  }

  svg.main_svg {
    position: absolute;
    top:0;
  }

  canvas {
    top: 0;
    position: absolute;
    pointer-events: none;
  }

  .semafor {
    position: absolute;
    width: max-content;
    font-size: 30px;
  }
      `
    },
    mounted() {
      const vm = this;
      chartBase.initial(vm);

    },
    methods: {

      run() {
        const vm = this;

        chartBase.run();
      },



    }
  }
