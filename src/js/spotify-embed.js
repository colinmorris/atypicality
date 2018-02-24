
const W = 300;
const H = 80;

class SpotifyEmbed {
  constructor(parent) {
    this.root = parent.append('div')
    .classed('embeds', true);
    this.widgets = {};
    let main = this.root.append('iframe')
    .classed('focal', true)
    .attr('width', W)
    .attr('height', H)
    .attr('frameborder', '0') // I don't know what this and the next attr do
    .attr('allow', 'encrypted-media');
    let contrast = this.root.append('iframe')
    .classed('contrast', true)
    .attr('width', W)
    .attr('height', H)
    .attr('frameborder', '0') // I don't know what this and the next attr do
    .attr('allow', 'encrypted-media');
    this.widgets.main = main;
    this.widgets.contrast = contrast;
  }

  _setSong(song, widget) {
    if (!song || !song.spotify_id) {
      widget.attr('src', undefined);
    } else {
      widget.attr('src', 'https://open.spotify.com/embed?uri=spotify:track:' + song.spotify_id);
    }
  }

  setSong(song) {
    this._setSong(song, this.widgets.main);
  }
  setContrast(song) {
    this._setSong(song, this.widgets.contrast);
  }
}

export {SpotifyEmbed};
