
let typicality_cmap = d3.scaleLinear()
  .domain([.5, 1])
  .range(["#ff00c7", "#000"])
  .interpolate(d3.interpolateLab);

// Color used for 'contrasting song' in song charts
let contrast_color = 'red';

export {typicality_cmap, contrast_color};
