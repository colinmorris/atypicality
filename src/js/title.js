
class SongChartTitle {
  constructor(parent) {
    this.root = parent.append('h3')
      .classed('songchart-title', true);
    this.focal = this.root.append('span').classed('focal', true);
    let con = this.root.append('span').classed('contrast', true);
    con.classed('hidden', true);
    this.contrast_container = con;
    con.append('span').classed('vs', true).text(' vs. ')
    this.contrast = con.append('span').classed('contrast-song', true)
  }
  setSong(song) {
    this.focal.text( (song && song.get_label()) || '');
    this.focal.classed('hidden', !song);
  }
  setContrast(song) {
    this.contrast.text( (song && song.get_label()) || 'avg. song');
    this.contrast_container.classed('hidden', !song);
  }
}

export {SongChartTitle}
