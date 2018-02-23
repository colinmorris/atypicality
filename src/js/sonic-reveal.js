
let attr_texts = {
  danceability: [
    `<a href="https://www.youtube.com/watch?v=n7RuIga3vdk">It's got a good beat, and you can dance to it!</a>`,
    `The <b>danceability</b> score is a measure of how suitable a song is to dance to. “Believe” is a real banger, so it's a little surprising it wasn't rated 100% on this scale. However, it's important to note that these scores don't come from kids on American Bandstand - they come from a computer. Danceability is calculated algorithmically using criteria like the tempo and the strength and regularity of the beat.`,
    `The latter might explain why this song didn't reach the top of the danceability scale. The song features two sections dominated by synth pads, with no percussion: the intro, and a breakdown following the bridge. Our algorithm is very likely to "lose the beat" during these sections, and therefore ding the danceability score.`
  ],
  tempo: [
    `<b>Tempo</b> is the simplest, most primitive sonic feature in our toolbox. It's just the speed of the song. “Believe” clocks in at a moderately fast 133 beats per minute.`,
    // TODO: should confirm legitimacy of these explanations of failure modes
    `Computers are generally pretty good at guessing a song's tempo (“Believe”'s official sheet music gives the tempo as a "moderate disco beat" of 132 bpm - not bad!). But when they do fail, they tend to fail pretty spectacularly. The most common failure mode is to guess half the actual tempo (e.g. because of a weak 2nd and 4th beat), or double it (e.g. because of a strong hi-hat on the eigth notes).`
  ],
  energy: [
    `<b>Energy</b> is a measure of a track's "intensity". This might seem similar to danceability, but a song can be energetic (fast, loud, noisy), but undanceable because of a disjointed or weak beat.`,
    `“Believe”, with its <a href="https://www.youtube.com/watch?v=Lxc2nCmZzrs">"boots and pants"</a> techno beat and throbbing synths gets a very high energy score.`
  ],
  acousticness: [
    `<b>Acousticness</b> is how likely the algorithm thinks it is that this song was recorded acoustically (i.e. without electronic instruments or effects).`,
    `Cher's extravagantly autotuned vocals - a famous and trendsetting feature of the song - aren't fooling anyone. Not even a computer. This song is 0% acoustic.`
  ],
  liveness: [
    `<b>Liveness</b> is how likely the algorithm thinks it is that this song was recorded live. Again, “Believe”'s heavy-handed production leads to a very low score on this metric.`
  ],
  speechiness: [
    `<b>Speechiness</b> is a measure of the amount of spoken-word (as opposed to singing) in the track. “Believe” gets a low score here, though not quite 0 (perhaps because of the "I don't need you anymore" section of the bridge, which has a somewhat speechy feel).`
  ],
  instrumentalness: [
    `<b>Instrumentalness</b> is the estimated likelihood that this is an instrumental track. “Believe”, with its prominent vocals throughout, gets a 0 on this.`
  ],
  valence: [
    `Finally, <b>valence</b> is one of the most high-level, abstract features used. It represents the "positiveness" of the track. That is, is listening to it likely to make you happy? Or does it have more of a sad, dark vibe?`,
    // Major except the bridge?
    `“Believe” gets a slightly below average 48% valence score. We might agree with that based on the lyrics ("I really don't think it's strong enough"), but the algorithm only has access to the raw audio of the song, not the liner notes. Its assessment of valence comes from the song's sound.`,
   `I would tend to agree that “Believe” doesn't sound like sunshine and rainbows, but it's hard to say exactly why. It's commonly observed that songs in a 
      <a href="https://www.youtube.com/watch?v=-9YopDo5_xU">major key</a>
      tend to sound more upbeat and positive than those written in a 
      <a href="https://www.youtube.com/watch?v=jcA--c2U4Wg">minor key</a>,
      but “Believe” is in the key of G major, so the answer isn't that simple.`,
      `Maybe there's just something unsettling about the alien, artificial sound of those synth pads? Or maybe it's something in the harmonies. The arpeggiated chord played after the first line of the chorus sounds a bit wonky: it's a major seventh, inverted such that the first two notes are separated by a semitone - an extremely dissonant interval. Or maybe it's just Cher's creepy robot voice.`
    // Other Cher songs that share this property. Half-breed. Dark lady.
  ]
}

export {attr_texts};
