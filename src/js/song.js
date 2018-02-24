import similarity from 'compute-cosine-similarity';
import {sonic_attrs} from './common.js';

let sonic_mean_attrs = sonic_attrs.map(s => 'mean_'+s);
let numeric_song_attrs = [].concat(sonic_attrs).concat(sonic_mean_attrs);

class Song {

  static fromRow(row) {
    let s = new Song();
    // Semantics of this col not totally clear. It's not the entrance or exit year.
    s.year = +row.Year;
    for (let attr of numeric_song_attrs) {
      s[attr] = +row[attr];
    }
    s.raw_tempo = +row.raw_tempo;
    s.artist = row.artist;
    s.track = row.track;
    s.spotify_id = row.spotify_id;
    return s;
  }

  static dummySong() {
    let s = new Song();
    for (let attr of numeric_song_attrs) {
      s[attr] = 0;
    }
    return s
  }

  get decade() {
    return this.year - (this.year % 10);
  }

  getAttrs(attrs) {
    let res = [];
    for (let attr of attrs) {
      let v = this[attr];
      res.push(v);
    }
    return res;
  }

  sonic_vector() {
    return this.getAttrs(sonic_attrs);
  }

  get dedupe_key() {
    // deduping key
    return this.track;
  }

  // (No longer used)
  similarity(s2) {
    let v1 = this.sonic_vector();
    let v2 = s2.sonic_vector();
    return similarity(v1, v2);
  }

  get_label() {
    return `${this.artist} - ${this.track}`;
  }
}

export {Song};
