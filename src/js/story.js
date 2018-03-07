import ScrollMagic from 'scrollmagic';
import scroll_controller from './scroll.js';
import {StickySongGraphic} from './sticky-song.js';
import {attr_texts} from './sonic-reveal.js';
import {isMobile} from './mobile.js';
import * as common from './common.js';
import * as songdb from './song-db.js';

/* Calculate the total heigh of a "card" node *including bottom margin*
*/
function totalHeight(node) {
  // TODO: bleh, this doesn't play nicely when there's a div containing a couple
  // p's each having a significant margin
  // hack
  let base_height = node.offsetHeight;
  // hacks on hacks
  if (node.tagName && node.tagName == 'DIV' && node.children.length) {
    node = node.children[node.children.length - 1];
  }
  let style = window.getComputedStyle ? getComputedStyle(node, null) : node.currentStyle;
  return base_height + (parseInt(style.marginBottom) || 0);
}

class StoryTeller {

  constructor() {
    this.controller = scroll_controller;
    let rootsel = '#story';
    this.root = d3.select(rootsel);
    let sticky = this.root.select('.sticky');
    this.sticky = sticky;
    this.chart = new StickySongGraphic(sticky);
    // NB: important to do this *before* setting up scene, so that the calculated
    // height of the root node includes the text added here.
    this.setupSonicIntro();
    this.setupPlayerEmbeds();
    let viewportHeight = window.innerHeight;
    // The 'overall' scene during which the sticky graphic is pinned.
    // Contains a whole bunch of inner scenes that describe all the 
    // transitions on that graphic.
    let outer_dur = Math.max(1, this.root.node().offsetHeight - viewportHeight);
    console.log('Outer scene duration = ' + outer_dur);
    let outer_scene = new ScrollMagic.Scene({
      triggerElement: rootsel,
      triggerHook: 'onLeave', // i.e. when this hits the top
      duration: outer_dur,
      //loglevel: 3
    })
    .setPin('#story .sticky', {pushFollowers: false})
    .on('enter', () => {
      console.log('Pinning story div');
      this.toggleFixed(true, false);
    })
    .on('leave', (e) => {
      console.log('Unpinning story div');
      this.toggleFixed(false, e.scrollDirection === 'FORWARD');
    })
    .addTo(this.controller)
    this.setupScenes();
    this.setHidden(true);
  }

  setHidden(hidden) {
    this.sticky.classed('hidden', hidden);
  }

  // XXX: deprecated
  toggleFixed(fixed, bottom) {
    return;
    this.sticky.classed('is-fixed', fixed);
    this.sticky.classed('is-bottom', bottom);
  }

  setupSonicIntro() {
    let root = this.root.select('#sonicreveal');
    let j;
    for (let i = 0; i < common.sonic_attrs.length; i++) {
      // start on danceability (i.e. the top)
      j = (i + 6) % common.sonic_attrs.length;
      let attr = common.sonic_attrs[j];
      let div = root.append('div')
        .classed('step', true)
        //.classed('card', true)
        .attr('data-hide_avg', '1')
        .attr('data-highlight_sonics', attr);
      let paras = attr_texts[attr];
      div.selectAll('p').data(paras)
      .enter()
      .append('p')
      .classed('card', true) // step?
      .html(d=>d);
    }
  }

  setupPlayerEmbeds() {
    let W = 300;
    let H = 80;
    this.root.selectAll('div.player')
    .datum(function() { return this.dataset.song })
    .append('iframe')
    .attr('width', W)
    .attr('height', H)
    .attr('frameborder', '0') // I don't know what this and the next attr do
    .attr('allow', 'encrypted-media')
    .attr('src', function(track) {
      let song = songdb.lookup(track);
      return 'https://open.spotify.com/embed?uri=spotify:track:' + song.spotify_id;
    });
  }

  setupScenes() {
    this.root.selectAll('.step, p')
    .datum(function() { return this.dataset; })
    .each( (dat, ix, nodes) => {
      this.addSceneForStep(dat, nodes[ix]);
    });
  }

  addSceneForStep(dat, node) {
    /* Step data attrs to deal with
    *clearsong
    *contrast
    *pad
    * year_a year_b
    newsong
    highlight_sonics
    hide_avg
    show_avg
    */
    // Negative value to trigger before hitting the center, positive for after.
    let offset = isMobile() ? 
      -1 * window.innerHeight * .25
      : 0;
    if (dat.offset) {
      offset += dat.offset;
    }
    let sel = d3.select(node);
    let scene = new ScrollMagic.Scene({
      triggerElement: node,
      triggerHook: 'onCenter',
      duration: totalHeight(node),
      offset: offset
    });
    /* Notes on trigger hooks:
    - onEnter: starts when the top of ele hits the bottom of the screen
    - onCenter: top of ele hits middle of screen
      - so if duration = node height, scene begins when top of ele hits middle
        of screen, and ends when bottom of ele hits middle of screen
    - onLeave: when top of ele hits top of screen
    */
    /* Notes on events...
    Assuming duration=0...
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
    let progress_cb = this.progressCbForStepdat(dat);
    if (progress_cb) {
      scene.on('progress', progress_cb);
    }
    scene.on('enter', (event) => {
      console.debug('Entered scene with data ', dat);
      console.debug('Scene duration = ', scene.duration());
      console.debug('Node = ', node);
      sel.classed('active', true)
      .classed('post-active', false);
      this.enterCbForStepdat(dat)(event);
    })
    //.on('start', this.enterCbForStepdat(dat))
    // XXX: If steps end up not tiling vertical plane may need to also add leave callbacks
    // for certain step data attrs
    .on('leave', (event) => {
      console.debug('Left scene with data ', dat);
      sel.classed('active', false)
      .classed('post-active', true);
    })
    .on('leave', this.leaveCbForStepdat(dat))
    .addTo(this.controller);
  }

  enterCbForStepdat(dat) {
    // Called whenever we pass the trigger point for a step, whether going
    // up or down
    return (event) => {
      // NB: important to do this one first
      if (dat.song) {
        this.chart.transitionSong(dat.song);
      }
      if (dat.highlight_sonics) {
        this.chart.setSonicHighlight(dat.highlight_sonics);
      }
      if (dat.hide_avg || dat.show_avg) {
        let show = dat.show_avg;
        this.chart.showAverage(show);
      }
      if (dat.highlight_web) {
        this.chart.highlightWeb(dat.highlight_web);
      }
      if (dat.fade_web) {
        this.chart.fadeWeb(dat.fade_web);
      }
      if (dat.clearsong) {
        this.chart.clearSong();
      }
      if (dat.contrast) {
        this.chart.setContrast(dat.contrast);
      }
      if (dat.reveal) {
        this.setHidden(false);
      }
    }
  }

  leaveCbForStepdat(dat) {
    return (event) => {
      if (dat.highlight_web || dat.fade_web) {
        this.chart.clearWebHighlights();
      }
      if (dat.highlight_sonics) {
        //this.chart.setSonicHighlight('');
        this.chart.radar.unsetSonicHighlights(dat.highlight_sonics);
      }
      if (dat.contrast) {
        this.chart.decontrast();
      }
    }
  }

  progressCbForStepdat(dat) {
    if (!dat.year_a) {
      return;
    }
    // TODO: Maybe should be a non-linear scale? Slower at beginning and end.
    let scale = d3.scaleQuantize()
    .domain([0, 1])
    .range(d3.range(+dat.year_a, +dat.year_b-1, -1));
    return (event) => {
      // TODO: some kind of debounce?
      let year = scale(event.progress);
      this.chart.tweenYear(year);
    }
  }

  static init() {
    return new StoryTeller();
  }
}

export {StoryTeller};
