import {RadarChart} from './radar.js';
import {SongChart} from './song-chart.js';
import {Song} from './song.js';
import * as common from './common.js';
import * as songdb from './song-db.js';

let min_year = common.year_range[0];
let max_year = common.year_range[1];
let decades = [1950,1960,1970, 1980, 1990, 2000, 2010];

function years_for_decade(decade) {
  let years = []
  for (let i=0; i<10; i++) {
    let yr = decade + i;
    if (yr >= min_year && yr <= max_year) {
      years.push( decade + i );
    }
  }
  return years;
}


class SongExplorer {

  constructor() {
    this.songdat = songdb.db;
    let rootsel = '#song-explorer'
    this.root = d3.select(rootsel);
    this.margin = {top: 20, right: 20, bottom: 50, left: 20};

    let default_song = this.songdat[50];
    this.decade = default_song.decade;
    this.year = default_song.year;

    this.setupControls();
    this.songView = this.root.append('div').classed('song-view', true);
    this.songChart = new SongChart(this.songView);
    this.moreSongs = this.root.append('div')
    let moreby = this.moreSongs.append('div')
      .classed('moreby', true)
      .classed('picker', true)
      .style('display', 'none')
    moreby.append('span').classed('label', true);
    moreby.append('span').classed('songs', true);
    this.moreby = moreby;
    let simsongs = this.moreSongs.append('div')
      .classed('simsongs', true)
      .classed('picker', true)
    simsongs.append('span').classed('label', true).text('Similar songs: ');
    simsongs.append('span').classed('songs', true);
    let simsongs_future = this.moreSongs.append('div')
      .classed('simsongs-future', true)
      .classed('picker', true)
    simsongs_future.append('span').classed('label', true).text('Similar songs (future): ');
    simsongs_future.append('span').classed('songs', true);
    this.selectSong(default_song);
  }

  onResize() {
    this.songChart.onResize();
  }

  setupControls() {
    let picker = this.root.append('div').classed('picker', true)

    let decade_picker = picker.append('div').classed('decade-picker', true)

    decade_picker.selectAll('.decade-selector')
    .data(decades)
    .enter()
    .append('a')
    .classed('decade-selector', true)
    .classed('active', decade => decade == this.decade)
    .text(decade => decade+'s')
    .on('click', decade => this.setDecade(decade))

    this.year_picker = picker.append('div').classed('year-picker', true);
    this.updateYears();

    this.song_picker = picker.append('div').classed('song-picker', true);
    this.updateSongs();
  }

  setDecade(decade) {
    if (decade == this.decade) return
    this.decade = decade
    this.root.selectAll('.decade-selector')
      .classed('active', decade => decade == this.decade);
    this.year = Math.min(max_year, Math.max(min_year, this.decade));
    this.updateYears();
    this.updateSongs();
  }

  updateYears() {
    // Update the year selector buttons (e.g. on decade change)
    let years = years_for_decade(this.decade);
    let yearsel = this.year_picker.selectAll('.year-selector').data(years)

    yearsel.exit().remove()

    let newyears = yearsel.enter()
    .append('a')
    .classed('year-selector', true)

    yearsel.merge(newyears)
      .text(year=>year)
      .on('click', year=>this.setYear(year))
      .classed('active', year=>year==this.year)
  }

  setYear(year) {
    console.debug('Setting year to ', year);
    this.year = year;
    this.year_picker.selectAll('.year-selector').classed('active', year=>year==this.year);
    this.updateSongs();
  }

  updateSongs() {
    // Update the selectable songs corresponding to year controls
    let songs = this.songdat.filter(song => song.year == this.year) 
    songs.sort( (a,b) => d3.ascending(a.track, b.track));
    let sel = this.song_picker.selectAll('.song-selector').data(songs, song=>song.track);

    sel.exit().remove();

    let newsongs = sel.enter()
    .append('a')
    .classed('song-selector', true)

    sel.merge(newsongs)
    .text(song=>song.track)
    .attr('title', song => 100 * song.typicality.toPrecision(2) + '% typical')
    .style('color', song => common.typicality_cmap(song.typicality))
    .on('click', song => this.selectSong(song))
    .on('mouseover', song => this.contrastSong(song))
    .on('mouseout', song => this.decontrastSong())
    .on('contextmenu', song => this.songChart.setSticky()) // XXX: temporary hack
    .classed('active', song => song==this.song)
  }

  populateSongs(root, songs) {
    // TODO: refactor above
    let sel = root.selectAll('.song-selector').data(songs);
    sel.exit().remove();
    let newsongs = sel.enter()
    .append('a')
    .classed('song-selector', true)

    sel.merge(newsongs)
    .text(song=>song.track)
    .style('color', song => common.typicality_cmap(song.typicality))
    .on('click', song => this.selectSong(song))
    .on('mouseover', song => this.contrastSong(song))
    .on('mouseout', song => this.decontrastSong())
    .on('contextmenu', song => this.songChart.setSticky()) // XXX: temporary hack
    .classed('active', song => song==this.song)

  }

  selectSong(song) {
    console.debug(`Setting song to ${song.track}`)
    this.song = song;
    this.song_picker.selectAll('.song-selector').classed('active', song => song==this.song);
    this.songChart.setSong(this.song);
    this.updateMoreSongs();
  }

  updateMoreSongs() {
    let same_artist = this.songdat.filter(song => (
      (song.artist == this.song.artist) && (song.track != this.song.track)
    ))
    if (same_artist.length == 0) {
      this.moreby.style('display', 'none');
    } else {
      this.moreby.style('display', 'initial');
      this.moreby.select('.label').text(`More by ${this.song.artist}: `);
      this.populateSongs(this.moreby.select('.songs'), same_artist);
    }

    let cands = this.songdat.filter(song => (
      ( (this.song.year-song.year) >= 0 )
      && ( (this.song.year - song.year) < 8 )
      && ( song.track != this.song.track )
    ));
    cands.sort( (s1, s2) => d3.descending(this.song.similarity(s1), this.song.similarity(s2)) );
    cands = cands.slice(0, 10);
    this.populateSongs(this.moreSongs.select('.simsongs .songs'), cands);
    // future sims
    cands = this.songdat.filter(song => (
      ( (this.song.year-song.year) < 0 )
      && ( (this.song.year - song.year) > -8 )
      && ( song.track != this.song.track )
    ));
    cands.sort( (s1, s2) => d3.descending(this.song.similarity(s1), this.song.similarity(s2)) );
    cands = cands.slice(0, 10);
    this.populateSongs(this.moreSongs.select('.simsongs-future .songs'), cands);
  }

  contrastSong(song) {
    if (song == this.song) {
      return;
    }
    this.songChart.contrastSong(song);
  }

  decontrastSong() {
    this.songChart.decontrastSong();
  }

  static init() {
    return new SongExplorer();
  }
}

export default SongExplorer;
