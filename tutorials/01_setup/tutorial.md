In this first tutorial I will run though the obligatory creation of the simple
"Hello World" animated block diagram shown below:

<p align="center">
  <img src="../../media/tutorial_01.gif" alt="Aniblock Hello World" />
</p>

Source code for this sample can be found [here](./).

Animation creation
==================

Aniblock renders using a browser, so creating an animated diagram simply
consists of creating two files:

- An HTML file, which provides the main file for the browser to load.
- A JavaScript file, to provide the definition of the animation.

... and including the Aniblock library and its default CSS definitions. It is
also possible to provide additional CSS definitions to providing custom styling
of the diagram elements, but we'll come back to that later.

Directory structure
-------------------

Once you've finished this tutorial your file structure should look like this:

    ├── index.html
    ├── animation.js
    └── dist
        ├── aniblock.css
        └── aniblock.js


The HTML file
-------------

The `index.html` I use here is the bare-bones needed to load the JavaScript
and CSS files, and provide a single `svg` element to render into. In reality
your webpage may be a lot more complex than this ...

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="dist/aniblock.css">
  </head>
  <body>
    <svg id="animation"></svg>
    <script src="dist/aniblock.js"></script>
    <script src="animation.js"></script>
  </body>
</html>
```

The `svg` element provides the container for the animation. The `id` is user
defined; you will need to know this when creating the animation `Scene` later.
Note that any child elements of the `svg` will be deleted when the `Scene` is
first created, so it is recommended that an empty `svg` element is used to
avoid any confusion.

**Note:** The JavaScript files are deliberately included at the end of the
document; this ensures that the DOM is loaded before the scripts start
executing. If you include the scripts in the `head` of the document, you must
ensure that your `animation.js` user script does not execute until the DOM can
safely be manipulated. This can be achieved by using a jQuery
`$(document).ready()` callback, for example.

The JavaScript file
-------------------

The user provided `animation.js` file is the script which does the heavy
lifting

```javascript
// Set up the canvas    svg_id       w    h    debug
var sc = new ABlk.Scene('animation', 400, 160, false);

// Show the blocks              label    x    y   w    h
var blockA = new ABlk.Block(sc, 'Hello', 100, 80, 100, 80);
blockA.show();

var blockB = new ABlk.Block(sc, 'World', 300, 80, 100, 80);
blockB.show();

// Link the blocks             src     dst     src_exit_edge    sz  plug
var linkAB = new ABlk.Link(sc, blockA, blockB, ABlk.Edge.Right, 40, false);
linkAB.plug();

// Unblock the blocks
linkAB.unplug();

// Hide both blocks simultaneously
var fadeTime = blockA.hide();
blockB.hide(fadeTime);
```
