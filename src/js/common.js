
let typicality_cmap = d3.scaleLinear()
  .domain([.5, 1])
  .range(["#ff00c7", "#000"])
  .interpolate(d3.interpolateLab);

export {typicality_cmap};
