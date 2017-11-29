import {RadarChart} from './radar.js';
import * as common from './common.js';
import * as songdb from './song-db.js';
import {SongChartTitle} from './title.js';

/*
Used in SongExplorer.
Radar chart + a bit of song metadata and bookkeeping.
Kind of a leaky/weak abstraction.
*/
class SongChart {
  constructor (root) {
    this.root = root;
    this.name = root.attr('class');
    this.heading = this.root.append('div')
      .classed('heading', true)
      .classed('tk-atlas', true)
      .classed('prose__hed', true)
    this.title = new SongChartTitle(this.heading);
    let radar_sidelen = Math.min(
      this.root.node().offsetWidth,
      window.innerHeight * .8
    );
    radar_sidelen = Math.min(600, radar_sidelen);

    this.svg = this.root.append('svg')
    .classed('radar', true)
    .attr('width', radar_sidelen)
    .attr('height', radar_sidelen);
    this.radar = new RadarChart(this.svg);
    this.meta_tray = this.root.append('div').style('display', 'none');

    this.debug = false;
    this.root.on('dblclick', () => this.toggleDebug());
  }

  toggleDebug() {
    console.log('toggling debug view');
    this.debug = !this.debug;
    this.meta_tray.style('display', this.debug ? 'initial' : 'none');
  }

  onResize() {
    // Bleh, this doesn't work (just resizing svg) because it doesn't cascade down to the axes,
    // polygons etc.
    return;
  }

  setSong(song) {
    // ???
    // maybe need to do some debouncing magic here.
    // specifically for the case of clicking on the 'more songs' links in the bottom
    // of the SongExplorer widget, since that can change the link you're hovering over
    this.decontrastSong()
    this.contrast = undefined;
    this.sticky = false;
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
    this.title.setSong(song);
    // TODO: lazy quick fix
    if (this.song) {
      this.updateTray();
    }
  }

  transitionSong(song) {
    // TODO
    this.setSong(song);
  }

  updateTray() {
    this.meta_tray.text('');
    let attr_groups = [
      ['typicality', 'typicality_all', 'typicality_orig',
      'typical_typicality_orig',
      'typical_typicality'],
      common.sonic_attrs,
      ['mode', 'raw_tempo', 'raw_key', 'raw_time_signature']
    ];
    for (let attrs of attr_groups) {
      let p = this.meta_tray.append('div');
      for (let attr of attrs) {
        let val = this.song[attr];
        console.assert(val != undefined, `No value found for ${attr}`);
        console.assert(typeof(val) == 'number', `${attr} has type ${typeof(val)}, not number`);
        let text = `${attr}: ${val.toPrecision(3)}`;
        p.append('span')
        .classed('meta_factoid', true)
        .text(text)
      }
    }
  }

  // XXX: no longer used
  updateHeading() {
    let main = this.song.get_label();
    this.heading.select('.main').text(main);
    let con = this.heading.select('.contrast');
    if (this.contrast) {
      con.style('opacity', 1);
      let sim = 100 * this.song.similarity(this.contrast);
      let con_text = ` vs. ${this.contrast.get_label()} (${sim.toPrecision(3)}% similar)`;
      con.text(con_text);
    } else {
      con.text('|');
      con.style('opacity', 0);
    }
  }

  contrastSong (song) {
    // Precondition: song is not already plotted (checked in song-explorer.js)
    if (this.contrast) {
      //console.log('Clearing existing contrast song.');
      //this.decontrastSong(true);
    }
    this.contrast = song;
    this.title.setContrast(song);
    this.radar.contrast(song);
  }

  decontrastSong(force=false) {
    if ( !this.contrast || (this.sticky && !force) ) {
      return;
    }
    this.radar.decontrast();
    this.contrast = undefined;
    this.title.setContrast();
  }

  setSticky() {
    this.sticky = true;
  }

}

export {SongChart};
