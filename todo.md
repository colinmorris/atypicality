


Candidates for close inspection:
- 1963: Lesley Gore - It's My Party (82.6% typical)
- 1963: Singing Nun - Dominique (72.9%)
- 1964: Beach Boys - I Get Around (69.1%)
- 1966: Come Together (66%)
- 1968: Marvin Gaye - I Heard It Through The Grapevine (70.7%)
- 1970: Ain't No Mountain
- 1974: I Shot the Sherriff
- 1973: [Love Train]
- 1975: The Hustle
- 1976: Shake Shake Shake Shake Your Booty
- 1978: Stayin Alive (75%)
- 1979: I Will Survive (interesting combo of low valence, high nrg)
  - other e.g.s: Total Eclipse of the Heart, Sweet Dreams
- 1981: Physical
- 1981: [Rapture]
- 1982: Vangelis - Chariots of Fire - Titles
- 1983: Billie Jean, Beat It
- 1984: Lionel Richie - Hello (low energy, valence, danceability, low everything)
- 1987: Whitesnake - Here I Go Again
  - similar: 1986: Bon Jovi - You Give Love a Bad Name
- 1992: Madonna - This Used To Be My Playground
- 1994: Lisa Loeb - Stay
- 1999: Livin La Vida Loca
- 2000: Mariah Carey - Thank God I Found You
- 2009: Just Dance

General idea: seek out seminal songs, first of a kind, trendsetters

If you're going to drop attributes from the viz./similarity score (mode, instrumentalness, key), you need a recalculated typicality score per song without those attrs).


consider incorporating some non-#1 songs? e.g. in the 'most similar' section.

think about scrollytelling. I think it would really help the narrative a lot. Even tho it's a big pain in the ass.


Idea: Animated visualization of 'mean song' over time.



Outline:

Intro. It pays to be different. Trendsetters. Here's this research.

What're we doing? Exploring some examples of atypical #1s through the ages.


Minor todos:
- sonic attr tooltips
- Resize hooks. Lesson learned from last time. Maybe if you keep them in mind from the beginning, it'll be less painful?
- gh-pages deploy
- non-radar metadata
- color polygon segments by attr typicality?
- think about how to show local attr baselines. Seems hard to do nicely. Argument for z-transform?
  - one cool thing you might try is encoding some kind of histogram of values as the baseline. Maybe some kind of heatmap thing showing at what attribute values songs concentrate. Though seems tricky, and hard to imagine how to do it without it being distracting.
- layout stuff. Flow text beside example songcharts, if there's room.

Design/editorial qs:
- Links to audio? YouTube? Inline players?

Methodology qs/notes:
- Looking at some actual examples, I'm growing skeptical of the use of cosine similarity here. It seems really weird to say that if song A has twice the bpm of song B, is twice as danceable, twice as instrumental, twice as energetic, etc. then they're 100% similar. Those songs probably sound very, very different. In other words, magnitude seems like it should count for something - not just direction.
- Fig 1: major and minor keys are equally typical on average?
- Accuracy of mode labels
- Artist self-similarity confound
- sometimes just stymied by seemingly bad sonic attr values. Like why does Blondie's Rapture have a 0 for speechiness?
  - Pretty sure Lisa Loeb's "Stay" isn't 166 bpm
- How is Bee Gees Tragedy 75% typical? I guess a lot of this comes down to mode.
