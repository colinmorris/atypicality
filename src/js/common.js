import * as d3chrom from 'd3-scale-chromatic';

export let
sonic_attrs = [
  'energy', 'acousticness', 'liveness', 'speechiness', 'instrumentalness',
  'valence', 'danceability', 'tempo'
],

typicality_cmap = d3.scaleLinear()
  .domain([.5, 1])
  .range(["#ff00c7", "#000"])
  .interpolate(d3.interpolateLab),

similarity_cmap = d3.scaleSequential(d3chrom.interpolateRdYlGn)
  .domain([.25, 1]),

year_range = [1958, 2016],

// Color used for 'contrasting song' in song charts
contrast_color = 'red';

