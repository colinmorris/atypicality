import {RadarChart, SongChart} from './radar.js';

let sonic_attrs = ['energy', 'liveness', 'speechiness', 'acousticness', 'instrumentalness',
  'valence', 'danceability',
  'tempo',
]
let numeric_song_attrs = [
  //'Year', 
  'peak', 'wksonchart', 'typicality',
].concat(sonic_attrs);


class Song {

  static fromRow(row) {
    let s = new Song();
    s.Year = +row.Year; // XXX
    for (let attr of numeric_song_attrs) {
      s[attr] = +row.attr;
    }
    s.artist = row.artist;
    s.track = row.track; // XXX
    return s;
  }

  get decade() {
    return this.Year - (this.Year % 10);
  }

  get vector() {
  }
}

function mungeSongRow(row) {
  for (let attr of numeric_song_attrs) {
    row[attr] = +row[attr];
  }
  row.decade = row.Year - (row.Year % 10)
  return row
}

let decades = [1950,1960,1970, 1980, 1990, 2000, 2010];

function years_for_decade(decade) {
  let years = []
  for (let i=0; i<10; i++) {
    years.push( decade + i );
  }
  return years;
}


class SongExplorer {

  constructor(songdat) {
    this.songdat = songdat;
    let rootsel = '#song-explorer'
    this.root = d3.select(rootsel)
    this.margin = {top: 20, right: 20, bottom: 50, left: 20}

    // default song
    this.song = songdat[50];
    this.decade = this.song.decade;
    console.log(this.decade)
    this.year = this.song.Year;

    this.setupControls();
    this.songView = this.root.append('div').classed('song-view', true);
    this.songChart = new SongChart(this.songView, this.song);
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
    this.year = undefined
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
    console.log('Setting year to ', year);
    this.year = year;
    this.year_picker.selectAll('.year-selector').classed('active', year=>year==this.year);
    this.updateSongs();
  }

  updateSongs() {
    // Update the selectable songs corresponding to year controls
    let songs = this.songdat.filter(song => song.Year == this.year) 
    let sel = this.song_picker.selectAll('.song-selector').data(songs, song=>song.track);

    sel.exit().remove();

    let newsongs = sel.enter()
    .append('a')
    .classed('song-selector', true)

    sel.merge(newsongs)
    .text(song=>song.track)
    .on('click', song => this.selectSong(song))
    .classed('active', song => song==this.song)
  }

  selectSong(song) {
    console.log(`Setting song to ${song.track}`)
    this.song = song;
    this.song_picker.selectAll('.song-selector').classed('active', song => song==this.song);
    this.songChart.setSong(this.song);
  }

  contrastSong(song) {
    // TODO
  }

  decontrastSong(song) {
  }

  static init() {
    d3.csv('assets/number_ones.csv', Song.fromRow, dat => new SongExplorer(dat)); 
  }
}

export default SongExplorer;
