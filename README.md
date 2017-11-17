# starter

A starter template for projects. Check out the companion [style guide](https://polygraph-cool.github.io/starter) for best practices.

**If creating a brand new project from scratch:** create a directory and `cd` into it, then follow setup instructions for the [basic](#basic) (plain HTML/JS/CSS) or [enhanced](#enhanced) (node + gulp) version.

**If you are contributing to an existing project:** clone the repo and run `npm i`.

## Basic
```
curl -Lk http://bit.ly/2bgptna > Makefile; make boilerplate;
```

* **HTML:** Goes in `index.html` file in the `main` tag where it says `<!-- PUT ALL YOUR HTML HERE-->`.
* **CSS:** Goes in `bundle.css`. `critical.css` has some defaults like resets and basic layout stuff, do not modify this.
* **JS:** Goes in `bundle.js`. Do not modify `critical.js`, which handles font loading.

See [this guide below](fonts) on how to use our fonts.

## Enhanced
* Transpiles ES6 with [Babel](http://babeljs.io)
* [Stylus](http://stylus-lang.com/) for CSS pre-processor
* Bundles and minifies JavaScript with [Webpack](http://webpack.js.org)
* Bundles, minifies, auto-prefixes, and inlines CSS
* Async font loading (using FOUT)

### Dependencies
* [node](http://nodejs.org)
* [gulp](http://gulpjs.com)

### Setup

```
curl -Lk http://bit.ly/2bgptna > Makefile; make enhanced;
```

### Usage

#### Development
`gulp`

Any changes to the `src/` folder will trigger live reload.

* **JS**: Put JS in `src/js/`, and take a look at `entry.js` and `graphic.js`, it has some basic skeleton stuff setup for you.
* **CSS**: Put CSS in `src/css/story/`. You can put everything in `story.styl`, or create any new files you want in that directory wich are included automatically. Checkout `src/css/base/` for helper variables and functions.
* **HTML**: Put HTML in `src/html/partials/story/`. Be sure to include your partials in `src/html/index.hbs`.
* **Icons**: We have a whole set of svg icons in the `svg` folder. You can add your own too. To use, simply put this code in your `hbs` file, `@@include('name-of-icon.svg')` and it will inject it into the HTML.

#### Deploy
Run `gulp dist`

This generates a single html file with inlined css, a single js file, and a folder with assets in the **dist** folder.

To deploy new dev version on github run `make github`

To deploy live to s3, you must install [awscli](https://aws.amazon.com/cli/) and [configure](http://docs.aws.amazon.com/cli/latest/reference/configure/index.html) your settings. Then run the following, replacing  `year/month/name` with your own (eg. `2017/01/nba`):

`aws s3 sync dist s3://pudding.cool/year/month/name --delete`

To force cloudfront to fetch latest html file (replacing `id-here` with the cloudfront distro id, and `year/month/name` with your project filepath):

`aws cloudfront create-invalidation --distribution-id id-here --paths /year/month/name/`

*Note*: For cloudfront you must add [extra configuration](http://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html)

### JS Utilties
In the folder `src/js/utils` there a are a bunch of handy helper JS functions.

#### dom.js
Super minimial wrapper on basic vanilla dom selection for convenience and cross-browser.

#### is-mobile.js
Device sniffing to detect if on mobile hardware.

#### load-image.js
Async image loading to detect when image completely loaded.

#### locate.js
Estimate user location via ip address.

#### scrollytelling.js
In-house scrollytelling library for enter-exit-step pattern.

#### tracker.js
Fire simple GA tracking on events.

#### url-parameter.js
Get and set the paremeters of the URL in address bar.

### The Pudding's Favorite Libraries
* d3-annotation
* lodash.uniqby
* moveto
* jump.js
* nouislider
* geolib
* scrollmagic
* in-view
* enter-view
* ScrollWatch
