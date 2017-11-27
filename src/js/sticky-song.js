import {RadarChart} from './radar.js';
import * as common from './common.js';
import * as songdb from './song-db.js';

/* Radar chart for a song plus other stuff like a title and metadata that 
   doesn't work in the radar chart (typicality, year, mode, key...)

Overall structure:
- div.heading
  - slider widget
  - h3.title
    - p.focal
    - p.contrast
- div.chart
  - radar widget
*/
class StickySongGraphic {
  constructor (root) {
    this.root = root;
    this.name = root.attr('class');
    // current 'primary' song, if any
    this.song = undefined;
    this.heading = this.root.append('div')
      .classed('heading', true)
      .classed('tk-atlas', true)
      .classed('prose__hed', true)

    //this.heading.append('div').append('mark').classed('year', true)
    this.slider = new YearSlider(this.heading);

    let title = this.heading.append('h3')
      .classed('title', true);
    title.append('p').classed('focal', true);
    title.append('p').classed('contrast', true);

    let chart = this.root.append('div').classed('chart', true);
    this.svg = chart.append('svg')
    .classed('radar', true)
    this.radar = new RadarChart(this.svg, chart);
  }

  setSonicHighlight(sonics) {
    this.radar.setSonicHighlights(sonics);
  }

  clearSong() {
    // could also set class to hidden to fade rather than shrink.
    console.log('clearing');
    //this.radar._dummify('focal');
    //this.radar._dummify('baseline');
    this.setSong();
  }

  showAverage(show) {
    // NB: this won't persist through song changes
    this.radar.getWebs('baseline')
      .classed('hidden', !show);
  }

  highlightWeb(cls) {
    this.radar.getWebs(cls)
      .classed('highlight', true);
  }
  clearWebHighlights() {
    this.radar.getWebs('highlight')
      .classed('highlight', false);
  }

  setSong(song) {
    if (typeof(song) == 'string') {
      if (this.song && song == this.song.track) {
        return;
      }
      song = songdb.lookup(song);
    }
    if (song == this.song) {
      return;
    }
    this.song = song;
    // XXX
    //this.radar.setSong(this.song);
    this.radar.transitionSong(song);
    this.updateHeading();
  }

  transitionSong(song) {
    // TODO: probably should merge with above. Not clear there's a reason for separate semantics.
    this.setSong(song);
  }

  setYear(year) {
    this.slider.setYear(year);
  }

  setContrast(song) {
    if (typeof(song) == 'string') {
      if (this.contrast && song == this.contrast.track) {
        return;
      }
      song = songdb.lookup(song);
    }
    if (song == this.contrast) {
      return;
    }
    this.contrast = song;
    // XXX: could also use radar.contrast, which has side effect of hiding baseline. Not
    // sure if we want that.
    //this.radar.plotSong(song, 'contrast');
    this.radar.contrast(song);
    this.updateHeading();
  }
  decontrast() {
    this.contrast = undefined;
    this.radar.decontrast();
    this.slider.decontrast();
    this.updateHeading();
  }

  tweenYear(year) {
    // TODO: maybe a very short transition?
    this.slider.snapYear(year);
    // TODO: debounce (here or one level up). Or just make this less inefficient. 
    let eg = songdb.query_one({year: year});
    let kwargs = {
      // maybe different easing fn too?
      speedup: 3,
      ease: d3.cubicOut
    };
    this.radar.plotBaseline(eg, kwargs);
  }

  updateHeading() {
    let focal_text = this.song ? this.song.get_label() : '';
    let contrast_text = this.contrast ? this.contrast.get_label() : '';
    this.heading.select('.title .focal').text(focal_text);
    this.heading.select('.title .contrast').text(contrast_text);
    if (this.song) {
      this.setYear(this.song.year);
    }
    if (this.contrast) {
      this.slider.setContrastYear(this.contrast.year);
    }
  }

}

class YearSlider {
  constructor(parent) {
    let W = 500;
    let H = 50;
    this.svg = parent.append('svg')
      .attr('viewbox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      //.attr('preserveAspectRatio', 'none')
      .classed('year-slider', true);

    this.svg.append('defs').html(
      `
      <filter x="0" y="0" width="1" height="1" id="highlight">
        <feFlood/>
        <feComposite in="SourceGraphic"/>
      </filter>
      <filter x="0" y="0" width="1" height="1" id="highlight-contrast">
        <feFlood/>
        <feComposite in="SourceGraphic"/>
      </filter>
      `)

    let margin = 0;
    this.y = H * 2/3;
    let slider = this.svg.append('g')
    .classed('slider', true)
    //.attr('transform', `translate(${margin}, ${this.y})`)
    
    this.scale = d3.scaleLinear()
      .domain(common.year_range)
      .range([margin, W-margin])

    let track = slider.append('line')
      .classed('track', true)
      .attr('x1', this.scale.range()[0])
      .attr('x2', this.scale.range()[1])
      .attr('y1', this.y)
      .attr('y2', this.y)
      .attr('stroke', '#000')
      .attr('stroke-width', 1)

    //let axis = d3.axisTop(this.scale);
    //slider.call(axis);

    this.marker = this._markerOfClass('focal');
    this.contrast_marker = this._markerOfClass('contrast');
  }

  _markerOfClass(cls) {
    let marker = this.svg.append('g')
      .classed('marker', true)
      .classed(cls, true)
      .attr('transform', `translate(0, ${this.y})`)
    marker.append('text')
      .classed('year', true)
      .attr('filter', `url(#highlight${cls == 'contrast' ? '-contrast' : ''}`)
      .attr('y', 0)
    return marker
  }

  setYear(year) {
    let x = this.scale(year);
    if (!this.year_set) {
      this.year_set = true;
      this.marker.select('text')
        .attr('x', x)
        .text(year)
    } else {
      // TODO: would be really cool to have the text flip through the intermediate
      // years during transition
      this.marker.select('text')
      .text(year)
      .transition('yearswing')
      .duration(1500)
      .ease(d3.easeCubic)
      .attr('x', x)
      //.on('end', function() { d3.select(this).text(year); })
    }
  }

  snapYear(year) {
    // Like above, but instant.
    // cancel any existing transitions
    this.marker.select('text').interrupt('yearswing');
    this.year_set = true;
    let x = this.scale(year);
    this.marker.select('text')
      .attr('x', x)
      .text(year)
  }

  setContrastYear(year) {
    let x = this.scale(year);
    this.contrast_marker
    .classed('hidden', false)
    .select('text')
    .attr('x', x)
    .text(year)
  }
  decontrast() {
    this.contrast_marker
    .classed('hidden', true)
  }
}

export {StickySongGraphic};
