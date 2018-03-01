// D3 is included by globally by default

import explorer from './song-explorer.js';
import {StoryTeller} from './story.js';
import scroll_controller from './scroll.js';
import {jumpTo, select} from './utils/dom.js';

let glob = {};

function resize() {
  console.log('got a resize');
  this.explorer.onResize();
}
resize = resize.bind(glob);

function init() {
  this.explorer = explorer.init();
  StoryTeller.init();

  // TODO: Why doesn't this woooork?
  // Basically, when developing, it's really annoying when the page refreshes
  // and jumps to wherever I was previously (or just some random point in the 
  // middle of the page), because usually I want to debug from the top.
  //scroll_controller.scrollTo('.intro');

  // Found in comment on this answer: https://stackoverflow.com/a/18633915/262271
  // Seems like the way this works is it causes the window to scroll to the top
  // just before a refresh happens, which means the scroll position the browser
  // remembers to return to after refresh is just the top. Neat.
  window.onbeforeunload = function() {
    window.scrollTo(0, 0);
  }
  // Ugh, but for some reason it seems this doesn't work with 
  // whatever browserify autorefresh thing? bleh.

  // XXX
  d3.select('#intro-text').on('click', () => jumpTo(select('#song-explorer')));
}
init = init.bind(glob)

export default { init, resize };
