
Entry points:
- `entry.js`: loads song db, then kicks off `graphic.js`
- `graphic.js`: Kicks off song-explorer and StoryTeller from story.js

Two big top-level viz things:
- `StoryTeller`/`story.js`
  - Responsible for the scrollytelling portion of the page.
  - Root element is div#story, which exists in story.hbs, and contains a bunch of .step elements defining the transitions between songs and the associated story text.
  - StoryTeller class is responsible for choreographing all the ScrollMagic scenes.
  - Major child: .sticky, StickySongGraphic (sticky-song.js)
    - Radar chart for a song plus heading, year slider, contrast, etc.
      - RadarChart and SongChartTitle components are shared with SongExplorer
      - see comment at top of sticky-song.js for overview of DOM layout

