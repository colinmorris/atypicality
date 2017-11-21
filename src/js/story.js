import ScrollMagic from 'scrollmagic';
import scroll_controller from './scroll.js';
import {StickySongGraphic} from './sticky-song.js';
import {attr_texts} from './sonic-reveal.js';

class StoryTeller {

  constructor() {
    this.controller = scroll_controller;
    let rootsel = '#story';
    this.root = d3.select(rootsel);
    let sticky = this.root.select('.sticky');
    this.sticky = sticky;
    this.chart = new StickySongGraphic(sticky);
    // TODO: deal with showing/hiding and setting/unsetting song on enter/leave
    // (the below scene isn't really set up properly for that)
    //this.chart.setSong("Believe")
    // NB: important to do this *before* setting up scene, so that the calculated
    // height of the root node includes the text added here.
    this.setupSonicIntro();
    let viewportHeight = window.innerHeight;
    // The 'overall' scene during which the sticky graphic is pinned.
    // Contains a whole bunch of inner scenes that describe all the 
    // transitions on that graphic.
    let outer_scene = new ScrollMagic.Scene({
      triggerElement: rootsel,
      triggerHook: 'onLeave',
      duration: Math.max(1, this.root.node().offsetHeight - viewportHeight)
    })
    .on('enter', () => {
      console.debug('Pinning story div');
      this.toggleFixed(true, false);
    })
    .on('leave', (e) => {
      console.log('Unpinning story div');
      this.toggleFixed(false, e.scrollDirection === 'FORWARD');
    })
    .addTo(this.controller)
    this.setupScenes();
  }

  toggleFixed(fixed, bottom) {
    this.sticky.classed('is-fixed', fixed);
    this.sticky.classed('is-bottom', bottom);
  }

  setupSonicIntro() {
    let root = this.root.select('#sonicreveal');
    for (let attr in attr_texts) {
      let div = root.append('div')
        .classed('step', true)
        .attr('data-hide_avg', '1')
        .attr('data-highlight_sonics', attr);
      let paras = attr_texts[attr];
      div.selectAll('p').data(paras)
      .enter()
      .append('p')
      .html(d=>d);
    }
  }

  setupScenes() {
    this.root.selectAll('.step')
    .datum(function() { return this.dataset; })
    .each( (dat, ix, nodes) => {
      this.addSceneForStep(dat, nodes[ix]);
    });
  }

  addSceneForStep(dat, node) {
    /* Step data attrs to deal with
    clearsong
    pad
    newsong
    highlight_sonics
    hide_avg
    */
    let sel = d3.select(node);
    let scene = new ScrollMagic.Scene({
      triggerElement: node,
      triggerHook: 'onCenter',
      duration: node.offsetHeight,
    });
    /* Assuming duration=0...
      start is fired every time the trigger threshold is crossed (either direction)
      enter is fired scrolling forward through it
      leave is fired scrolling up through it
    With duration > 0...
      enter: entering the trigger region. scrolling down through start point or up
            through end point
      leave: exiting the trigger region, as above
      start: scrolling past start position (either direction)
      end: scrolling past end position (either direction)
    */
    scene.on('enter', (event) => {
      //console.debug('Entered scene with data ', dat);
      sel.classed('active', true);
      this.enterCbForStepdat(dat)(event);
    })
    //.on('start', this.enterCbForStepdat(dat))
    // XXX: If steps end up not tiling vertical plane may need to also add leave callbacks
    // for certain step data attrs
    .on('leave', (event) => {
      sel.classed('active', false);
    })
    scene.addTo(this.controller);
  }

  enterCbForStepdat(dat) {
    // Called whenever we pass the trigger point for a step, whether going
    // up or down
    return (event) => {
      this.chart.setSonicHighlight(dat.highlight_sonics);
      if (dat.song) {
        this.chart.transitionSong(dat.song);
      }
      this.chart.showAverage(!dat.hide_avg);
    }
  }

  static init() {
    return new StoryTeller();
  }
}

export {StoryTeller};
