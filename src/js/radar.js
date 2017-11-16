
let dimens = ['energy', 'liveness', 'speechiness', 'acousticness', 'instrumentalness',
  'valence', 'danceability',
  'tempo',
];

let mean_dimens = dimens.map(s => 'mean_'+s);

let contrast_color = 'red';

class SongChart {
  constructor (root, song) {
    this.root = root;
    this.song = song;
    this.heading = this.root.append('div').classed('heading', true);
    this.heading.append('h1').classed('main', true);
    this.heading.append('h2').classed('contrast', true)
      .style('color', contrast_color);
    let W = 600;
    let H = 400;
    this.svg = this.root.append('svg')
    .attr('width', W)
    .attr('height', H);
    this.radar = new RadarChart(this.svg);

    this.setSong(this.song);
  }

  setSong(song) {
    this.contrast = undefined;
    this.sticky = false;
    this.song = song;
    this.updateHeading();
    this.radar.setSong(this.song);
  }

  contrastSong (song) {
    if (this.contrast) {
      console.log('Clearing existing contrast song.');
      this.decontrastSong(true);
    }
    this.contrast = song;
    this.updateHeading();
    this.radar.contrast(song);
  }

  setSticky() {
    this.sticky = true;
  }

  updateHeading() {
    let main = `${this.song.artist} - ${this.song.track} (${(100*this.song.typicality).toPrecision(3)}% typical)`;
    this.heading.select('.main').text(main);
    let con = this.heading.select('.contrast');
    if (this.contrast) {
      con.style('opacity', 1);
      let sim = 100 * this.song.similarity(this.contrast);
      let con_text = ` vs. ${this.contrast.artist} - ${this.contrast.track} (${sim.toPrecision(3)}% similar)`;
      con.text(con_text);
    } else {
      con.text('|');
      con.style('opacity', 0);
    }
  }

  decontrastSong(force=false) {
    if ( !this.contrast || (this.sticky && !force) ) {
      return;
    }
    this.radar.dropSong(this.contrast);
    this.contrast = undefined;
    this.updateHeading();
  }
}

class RadarChart {
  /* TODOS:
  - baseline (i.e. avg. per attr)
  - hover effects
  */

  constructor(root) {
    this.root = root;
    this.cfg = {
      marker_radius: 5,
      base_color: 'cyan',
      contrast_color: contrast_color
    }
    let W = this.root.attr('width');
    let H = this.root.attr('height');
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

    this.songMap = new Map();
    this.root.append('circle')
    .attr('cx', this.origin.x)
    .attr('cy', this.origin.y)
    .attr('r', this.cfg.marker_radius)
    .attr('fill', 'black');

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
    .attr('stroke-width', .5)
    .attr('stroke', 'black')
    axes.append('text')
    .attr('x', scale => scale.range()[1][0])
    .attr('y', scale => scale.range()[1][1])
    .text((s,i) => dimens[i])
    .attr('font-size', 12)


  }

  pointsForSong(song) {
    let attrs = song.getAttrs(dimens);
    return attrs.map( (v, i) => this.scales[i](v));
  }

  plotPoints(g, points, color, kwargs={}) {
    g.selectAll('circle').data(points)
    .enter()
    .append('circle')
    .classed('marker', true)
    .attr('r', kwargs.radius == undefined ? this.cfg.marker_radius : kwargs.radius)
    .attr('fill', color)
    .attr('cx', d => d[0])
    .attr('cy', d => d[1])
    .attr('fill-opacity', .5)
    g.append('polygon')
    .attr('points', points.join(','))
    .attr('fill', color)
    .attr('fill-opacity', kwargs.fill_opacity || .2)
  }

  plotSong(song, main=true) {
    let key = song.key;
    if (this.songMap.has(key)) {
      console.warn(`Tried to plot song but key ${key} already present. Ignoring.`);
      return;
    }
    let g = this.root.append('g');
    this.songMap.set(key, g);
    let points = this.pointsForSong(song);
    this.plotPoints(g, points, this.cfg.base_color);

    if (main) {
      let baseline = g.append('g').classed('baseline', 'true');
      let attrs = song.getAttrs(mean_dimens);
      let mean_points = attrs.map( (v, i) => this.scales[i](v));
      this.plotPoints(baseline, mean_points, '#999', 
        {radius:0, fill_opacity:.2}
      );
    }
    return g;
  }

  clear() {
    for (let song of this.songMap.keys()) {
      this.dropSong(song);
    }
  }

  dropSong(song) {
    let key;
    if (typeof(song) == 'string') {
      key = song;
    } else {
      key = song.key;
    }
    let ele = this.songMap.get(key);
    if (ele == undefined) {
      console.warn(`Tried to delete song with key ${key} but wasn't present`);
    }
    ele.remove();
    this.songMap.delete(key);
  }

  contrast(song) {
    let g = this.plotSong(song, false);
    if (g == undefined) {
      return;
    }
    g.selectAll('*')
    .attr('fill', this.cfg.contrast_color)
  }

  setSong(song) {
    this.clear();
    this.plotSong(song);
  }
}

export {RadarChart, SongChart};
