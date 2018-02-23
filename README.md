
To run local preview server: `gulp`

To generate dist version: `gulp dist`

To update gh-pages: `make github`

## Data

`number_ones_munging.ipynb` loads `hot100.csv` (file from Michael) and saves a munged version to `number_ones.csv`. Transformations include:
- filtering down to songs peaking at #1
- normalizing tempo
- munging date column
- dropping unused columns


`hot100.csv` gets copied to `src/assets/`, and fetched in `song-db.js`. 
