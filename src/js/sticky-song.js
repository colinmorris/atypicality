import {RadarChart} from './radar.js';
import * as common from './common.js';
import * as songdb from './song-db.js';

/* Radar chart for a song plus other stuff like a title and metadata that 
   doesn't work in the radar chart (typicality, year, mode, key...)
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
    this.heading.append('div')
      .append('mark')
      .classed('year', true)
    this.heading.append('h3')
      .classed('main', true);

    let chart = this.root.append('div').classed('chart', true);
    this.svg = chart.append('svg')
    .classed('radar', true)
    this.radar = new RadarChart(this.svg, chart);
  }

  setSonicHighlight(sonics) {
    // NB: sonics may be undefined
    this.radar.setSonicHighlights(sonics);
  }

  showAverage(show) {
    // NB: this won't persist through song changes
    this.radar.root.select('.baseline')
      .classed('hidden', !show);
  }

  highlightWeb(cls) {
    this.radar.root.select('.spiderweb.' + cls)
      .classed('highlight', true);
  }
  clearWebHighlights() {
    this.radar.root.selectAll('.spiderweb.highlight')
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
    this.radar.setSong(this.song);
    this.updateHeading();
  }

  transitionSong(song) {
    // TODO
    this.setSong(song);
  }

  setYear(year) {
    this.heading.select('.year').text(year);
  }

  updateHeading() {
    let main = (this.song ? 
      `${this.song.artist} - ${this.song.track}`
      : '');
    this.heading.select('.main').text(main);
    if (this.song) {
      this.setYear(this.song.year);
    }
  }

}

export {StickySongGraphic};
