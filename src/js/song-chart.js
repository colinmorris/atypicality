import {RadarChart} from './radar.js';
import * as common from './common.js';
import * as songdb from './song-db.js';

/* Radar chart for a song plus other stuff like a title and metadata that 
   doesn't work in the radar chart (typicality, year, mode, key...)
*/
class BasicSongChart {
  constructor (root, song, show_year=false, standalone=false) {
    this.root = root;
    this.song = song;
    this.show_year = show_year;
    this.heading = this.root.append('div')
      .classed('heading', true)
      .classed('tk-atlas', true)
      .classed('prose__hed', true)
    let main_title = this.heading.append('h3');
    if (standalone) {
      main_title = main_title.append('mark');
    }
    main_title.classed('main', true);
    let radar_sidelen = Math.min(
      this.root.node().offsetWidth,
      window.innerHeight * .8
    );

    this.svg = this.root.append('svg')
    .classed('radar', true)
    .attr('width', radar_sidelen)
    .attr('height', radar_sidelen);
    this.radar = new RadarChart(this.svg);
    this.meta_tray = this.root.append('div');

    this.setSong(this.song);
  }

  static for_placeholder(ele) {
    let song = songdb.lookup(ele.dataset.track);
    let show_year = ele.dataset.show_year;
    return new BasicSongChart(d3.select(ele), song, show_year, true);
  }

  onResize() {
    // Bleh, this doesn't work because it doesn't cascade down to the axes,
    // polygons etc.
    return;
    let radar_sidelen = Math.min(
      this.root.node().offsetWidth,
      window.innerHeight * .8
    );
    this.svg
    .attr('width', radar_sidelen)
    .attr('height', radar_sidelen);
  }

  setSong(song) {
    this.song = song;
    this.updateHeading();
    this.radar.setSong(this.song);
    this.updateTray();
  }

  updateTray() {
    this.meta_tray.text('');
    let attrs = ['mode', 'key', 'time_signature'];
    for (let attr of attrs) {
      let text = `${attr}: ${this.song[attr]}`;
      this.meta_tray.append('span')
      .classed('meta_factoid', true)
      .text(text)
    }
  }

  updateHeading() {
    let main = `${this.song.artist} - ${this.song.track} (${(100*this.song.typicality).toPrecision(3)}% typical)`;
    if (this.show_year) {
      main = `${this.song.Year}: ${main}`;
    }
    this.heading.select('.main').text(main);
  }

}

// Allows contrasts
class SongChart extends BasicSongChart {
  constructor(...args) {
    super(...args);
    this.heading.append('h4').classed('contrast', true)
      .style('color', common.contrast_color);
  }

  setSong(song) {
    this.contrast = undefined;
    this.sticky = false;
    super.setSong(song);
  }

  updateHeading() {
    super.updateHeading();
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

  contrastSong (song) {
    if (this.contrast) {
      console.log('Clearing existing contrast song.');
      this.decontrastSong(true);
    }
    this.contrast = song;
    this.updateHeading();
    this.radar.contrast(song);
  }

  decontrastSong(force=false) {
    if ( !this.contrast || (this.sticky && !force) ) {
      return;
    }
    this.radar.dropSong(this.contrast);
    this.contrast = undefined;
    this.updateHeading();
  }

  setSticky() {
    this.sticky = true;
  }

}

export {SongChart, BasicSongChart};
