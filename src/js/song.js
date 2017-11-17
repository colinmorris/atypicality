import similarity from 'compute-cosine-similarity';

let sonic_attrs = ['energy', 'liveness', 'speechiness', 'acousticness', 'instrumentalness',
  'valence', 'danceability',
  'tempo',
]
let sonic_mean_attrs = sonic_attrs.map(s => 'mean_'+s);
let numeric_song_attrs = [
  //'Year', 
  'peak', 'wksonchart', 'typicality',
].concat(sonic_attrs).concat(sonic_mean_attrs);

class Song {

  static fromRow(row) {
    let s = new Song();
    s.Year = +row.Year; // XXX
    for (let attr of numeric_song_attrs) {
      s[attr] = +row[attr];
    }
    s.artist = row.artist;
    s.track = row.track; // XXX
    s.mode = row.mode;
    s.key = row.key;
    s.time_signature = row.time_signature;
    return s;
  }

  get decade() {
    return this.Year - (this.Year % 10);
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

  similarity(s2) {
    let v1 = this.sonic_vector();
    let v2 = s2.sonic_vector();
    return similarity(v1, v2);
  }
}

export {Song};
