import {Song} from './song.js';

let db;

function load() {
  let prom = new Promise( (resolve, reject) => {
    d3.csv('assets/number_ones.csv', Song.fromRow, dat => {
      db = dat;
      resolve();
    });
  });
  return prom;
}

function lookup(track) {
  let matches = db.filter( song => song.track == track);
  console.assert(matches.length == 1, `Ambiguous/Unknown track ${track}`);
  return matches[0];
}

function _kwargs_matcher(kwargs) {
  return (song) => {
    return Object.entries(kwargs).every( (kv) => {
      let key = kv[0];
      let val = kv[1];
      return song[key] == val;
    });
  }
}

function query_one(kwargs) {
  return db.find(_kwargs_matcher(kwargs));
}

export {load, db, lookup, query_one};
