import * as common from './common.js';

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
    // hover text
    this.axis_labels
    .append('title')
    .text((s,i) => dimen_descriptions[dimens[i]])

  }

  setSonicHighlights(sonics) {
    if (sonics) {
      console.debug(`Setting sonic highlights to ${sonics}`);
    }
    sonics = sonics ? sonics.split(' ') : [];
    this.axis_labels.classed('highlight', dim => sonics.includes(dim));

    this.root.selectAll('.marker')
      .classed('highlight', (pt, i) => {
        let dim = dimens[i];
        return sonics.includes(dim);
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
    .attr('cx', d => d[0])
    .attr('cy', d => d[1])
    g.append('polygon')
    .attr('points', points.join(','))
    return g;
  }

  _transitionPoints(points, g) {
    let dur = 1000;
    // uggggh
    let classes = g.attr('class').split(' ');
    let identifying_cls;
    for (let cls of classes) {
      if (web_classes.includes(cls)) {
        identifying_cls = cls;
        break;
      }
    }
    console.assert(identifying_cls);
    this.root.selectAll(`.spiderweb.${identifying_cls} > circle.marker`)
      .data(points)
      .transition()
      .duration(dur)
      .attr('cx', d=>d[0])
      .attr('cy', d=>d[1])

    g.select('polygon')
    .transition()
    .duration(dur)
    .attr('points', points.join(','))
  }
  
  getWebs(cls) {
    return this.root.selectAll('.spiderweb.'+cls);
  }

  plotSong(song, cls='focal') {
    /* Plot the given song in a spiderweb having the given class.
    If one already exists, reuse the elements and transition the points
    to their new positions.
    */
    let points = this._pointsForSong(song);
    let g = this.root.select('.spiderweb.'+cls)
    if (!g.empty()) {
      this._transitionPoints(points, g);
      if (cls=='focal') {
        let mean_points = this._pointsForSong(song, true);
        let baseline_container = g.select('.baseline');
        this._transitionPoints(mean_points, baseline_container)
      }
    } else {
      g = this._plotPoints(this.root, points, cls);
      if (cls=='focal') {
        let mean_points = this._pointsForSong(song, true);
        let baseline = this._plotPoints(g, mean_points, 'baseline');
      }
    }

    return g;
  }

  clear() {
    this.root.selectAll('.spiderweb').remove();
  }

  decontrast() {
    this.root.selectAll('.spiderweb.contrast').remove();
  }

  // Not used, I think?
  contrast(song) {
    this.plotSong(song, 'contrast');
  }

  transitionSong(song) {
    if (song) {
      this.plotSong(song);
    }
  }

  setSong(song) {
    this.clear();
    if (song) {
      this.plotSong(song);
    }
  }
}

export {RadarChart};
