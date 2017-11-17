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

export {load, db, lookup};
