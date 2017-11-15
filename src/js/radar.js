
let dimens = ['energy', 'liveness', 'speechiness', 'acousticness', 'instrumentalness',
  'valence', 'danceability',
  'tempo',
];

class SongChart {
  constructor (root, song) {
    this.root = root;
    this.song = song;
    this.heading = this.root.append('h1').classed('heading', true);
    let W = 600;
    let H = 400;
    this.svg = this.root.append('svg')
    .attr('width', W)
    .attr('height', H);
    this.radar = new RadarChart(this.svg);

    this.setSong(this.song);
  }

  setSong(song) {
    let title = `${song.artist} - ${song.track}`;
    this.heading.text(title);
    this.radar.setSong(this.song);
  }

  contrastSong (song) {
  }
}

class RadarChart {

  constructor(root) {
    this.root = root;
    let W = this.root.attr('width');
    let H = this.root.attr('height');
    this.origin = {x: W/2, y: H/2};
    this.scales = dimens.map( (dim, i) => (
      d3.scaleLinear()
      .domain([0,1])
      .range([ [this.origin.x, this.origin.y], [
        W/2 * (1 - Math.sin(i*2*Math.PI / dimens.length)),
        H/2 * (1 - Math.cos(i*2*Math.PI / dimens.length))
      ] ])
    ))

    this.root.selectAll('.axis')
    .data(this.scales)
    .enter()
    .append('g')
    .classed('axis', true)
    .attr('transform', (ax, i) => (
      `translate(${this.origin.x} ${this.origin.y})`
    ))
    .append('line')
    // XXX YOUAREHERE
    //.attr('x1', 

  }

  plotSong(song) {
  }

  setSong(song) {
  }

  setSongs(songs) {
  }
}

export {RadarChart, SongChart};
