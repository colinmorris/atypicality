// D3 is included by globally by default

import explorer from './song-explorer.js';
import {BasicSongChart} from './song-chart.js';

let glob = {};

function resize() {
  console.log('got a resize');
  this.explorer.onResize();
}
resize = resize.bind(glob);

function init() {
  console.log('Make something awesome!');
  this.explorer = explorer.init();

  d3.selectAll('.songchart')
  .each( (d,i,n) => {
    BasicSongChart.for_placeholder(n[i]);
  })
}
init = init.bind(glob)

export default { init, resize };
