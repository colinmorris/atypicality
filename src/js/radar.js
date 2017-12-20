import * as common from './common.js';
import {Song} from './song.js';

let dimens = common.sonic_attrs;

// Mostly copied from Table 1 of ASR paper
// which in turn seem to be copied from API docs here:
//      https://developer.spotify.com/web-api/get-audio-features/
let dimen_descriptions = {
  acousticness: 'The likelihood that this song was recorded solely by acoustic means (as opposed to more electronic means)',
  danceability: 'How suitable is this track for dancing? Includes tempo, regularity of beat, and beat strength',
  energy: 'A perceptual measure of intensity throughout the track. Think fast, loud and noisy (e.g. hard rock) more than dance tracks.',
  instrumentalness: 'The likelihood that this track is predominantly instrumental. Not necessarily the inverse of speechiness.',
  liveness: 'Detects the presence of a live audience during the recording. Heavily studio-produced tracks score low on this measure.',
  speechiness: 'Detects the presence of spoken word throughout the track. Sung vocals are not considered spoken word.',
  tempo: 'The overall average tempo of the track (i.e. bpm)',
  valence: 'The musical positiveness of the track.'
}

let mean_dimens = dimens.map(s => 'mean_'+s);

let web_classes = ['focal', 'baseline', 'contrast'];

/* Structural overview:
svg
  g.axis *
  g.spiderweb.contrast
  g.spiderweb.focal
  g.spiderweb.baseline

Spiderwebs:
  - contain circles (.marker) and polygons
    - circles take classes {highlight,}
  - take standard semantic classes {contrast, focal, baseline}
  - take standard presentation classes {hidden, highlight}

*/
class RadarChart {

  constructor(root) {
    this.root = root;
    let viewbox = {W: 500, H: 500};
    let W = viewbox.W;
    let H = viewbox.H;
    this.root.attr('viewBox', `0 0 ${viewbox.W} ${viewbox.H}`);
    this.root.attr('preserveAspectRatio', 'xMidYMid');
    this.origin = {x: W/2, y: H/2};
    let radius = Math.min(W, H) * .45;
    this.scales = dimens.map( (dim, i) => (
      d3.scaleLinear()
      .domain([0,1]) // XXX
      .range([ [this.origin.x, this.origin.y], [
        this.origin.x + radius * (Math.cos(i*2*Math.PI / dimens.length)),
        this.origin.y + radius * (Math.sin(i*2*Math.PI / dimens.length))
      ] ])
    ))

    let axes = this.root.selectAll('.axis')
    .data(this.scales)
    .enter()
    .append('g')
    .classed('axis', true);
    this.axes = axes;
    axes.append('line')
    .attr('x1', scale => scale.range()[0][0])
    .attr('x2', scale => scale.range()[1][0])
    .attr('y1', scale => scale.range()[0][1])
    .attr('y2', scale => scale.range()[1][1])
    // labels
    this.axis_labels = axes.append('text')
    .attr('x', scale => scale.range()[1][0])
    .attr('y', scale => scale.range()[1][1])
    // TODO: should just have dimension objs with name, description, scale, etc. etc.
    .datum((s,i) => dimens[i])
    .text(dim => dim)
    .classed('left', dim => dim == 'instrumentalness')
    .classed('right', dim => dim == 'energy')
    // hover text
    this.axis_labels
    .append('title')
    .text((s,i) => dimen_descriptions[dimens[i]])

    // So that we always have a web of each class to reuse for transitions.
    this._setupDummyWebs();
  }

  _dummify(cls) {
    /* Transition an existing web of the given class to a dummy web (having 0 for
     * all attributes). 
    */
    let kwargs = {
      duration: 1000,
      ease: d3.easeCubicIn
    };
    this._transitionPoints(this._dummyPoints, this.getWeb(cls), kwargs);
  }

  get _dummyPoints() {
    let dummy = new Array(dimens.length).fill(0);
    return dummy.map( (v, i) => this.scales[i](v));
  }

  _setupDummyWebs() {
    // Create a dummy web for each standard class
    this._plotPoints(this.root, this._dummyPoints, 'contrast');
    this._plotPoints(this.root, this._dummyPoints, 'focal');
    this._plotPoints(this.root, this._dummyPoints, 'baseline');
  }

  setSonicHighlights(sonics) {
    // Highlight the sonic attrs in given space-separated string e.g. 'valence tempo'
    if (sonics) {
      console.debug(`Setting sonic highlights to ${sonics}`);
    }
    sonics = sonics ? sonics.split(' ') : [];
    this.axis_labels.classed('highlight', dim => sonics.includes(dim));

    this.root.selectAll('.focal .marker')
      .classed('highlight', (pt, i) => {
        let dim = dimens[i];
        return sonics.includes(dim);
      })
  }

  unsetSonicHighlights(sonics) {
    sonics = sonics ? sonics.split(' ') : [];
    this.axes.selectAll('text.highlight')
      .classed('highlight', dim => !sonics.includes(dim));
    this.root.selectAll('.focal .marker')
      .classed('highlight', (pt, i, nodes) => {
        let dim = dimens[i];
        return !sonics.includes(dim) && d3.select(nodes[i]).classed('highlight');
      })

  }

  _pointsForSong(song, baseline=false) {
    let dims = baseline ? mean_dimens : dimens;
    let attrs = song.getAttrs(dims);
    return attrs.map( (v, i) => this.scales[i](v));
  }

  _plotPoints(parent, points, cls='') {
    /* Make a spiderweb for the given points in a container created in the
    given parent selection, then return that container.
    */
    let g = parent.append('g')
      .classed(cls, true)
      .classed('spiderweb', true);
    g.selectAll('circle').data(points)
    .enter()
    .append('circle')
    .classed('marker', true)
    .attr('r', 5)
    .attr('cx', d => d[0])
    .attr('cy', d => d[1])
    g.append('polygon')
    .attr('points', points.join(','))
    return g;
  }

  _transitionPoints(points, g, kwargs={}) {
    // given a spiderweb selection, transition it to represent the given array
    // of points
    let dur = kwargs.duration || 1000;
    if (kwargs.speedup) {
      dur /= kwargs.speedup;
    }
    let ease = kwargs.ease || d3.easeCubic;
    g.selectAll('circle.marker')
      .data(points)
      .transition()
      .duration(dur)
      .ease(ease)
      .attr('cx', d=>d[0])
      .attr('cy', d=>d[1])

    g.select('polygon')
    .transition()
    .duration(dur)
    .attr('points', points.join(','))
  }
  
  getWeb(cls) {
    return this.root.select('.spiderweb.'+cls);
  }
  getWebs(cls) {
    return this.root.selectAll('.spiderweb.'+cls);
  }

  plotSong(song, cls='focal', kwargs={}) {
    /* Plot the given song in a spiderweb having the given class.
    If one already exists, reuse the elements and transition the points
    to their new positions.
    */
    let points = this._pointsForSong(song);
    let g = this.root.select('.spiderweb.'+cls)
    if (!g.empty()) {
      this._transitionPoints(points, g, kwargs);
      if (cls=='focal') {
        this.plotBaseline(song, kwargs);
      }
    } else {
      // TODO: not needed?
      console.warn(`No web found of cls ${cls}, so making one from scratch. (Should never happen?)`);
      g = this._plotPoints(this.root, points, cls);
      if (cls=='focal') {
        let mean_points = this._pointsForSong(song, true);
        let baseline = this._plotPoints(this.root, mean_points, 'baseline');
      }
    }

    return g;
  }

  plotBaseline(song, kwargs) {
    let mean_points = this._pointsForSong(song, true);
    let baseline_container = this.root.select('.baseline');
    this._transitionPoints(mean_points, baseline_container, kwargs);
  }

  // deprecated. Should use dummify.
  clear() {
    console.warn('u sure u wanna clear?');
    this.root.selectAll('.spiderweb').remove();
  }

  decontrast() {
    this._dummify('contrast');
    this._setClassForWebs('baseline', 'hidden', false);
    //this.root.selectAll('.spiderweb.contrast').remove();
  }

  _setClassForWebs(webcls, cls, on=true) {
    this.root.selectAll(`.spiderweb.${webcls} > *`)
    .classed(cls, on);
  }

  // used in song-chart (but not sticky graphic, currently)
  contrast(song) {
    this.plotSong(song, 'contrast');
    this._setClassForWebs('baseline', 'hidden');
  }

  transitionSong(song) {
    if (song) {
      this.plotSong(song);
    } else {
      this.plotSong(Song.dummySong());
    }
  }

  // deprecated
  setSong(song) {
    // XXX: dummify
    //this.clear();
    if (song) {
      this.plotSong(song);
    } else {
      this.plotSong(Song.dummySong());
    }
  }
}

export {RadarChart};
