Tutorial 1: Hello World
=======================

In this first tutorial I will run though the obligatory creation of the simple
"Hello World" animated block diagram shown below:

<p align="center">
  <img src="../../media/tutorial_01.gif" alt="Aniblock Hello World" />
</p>

Full source code for this sample can be found [here](./).


Animation creation
==================

Aniblock renders using a browser, so creating an animated diagram simply
consists of creating two files:

- An HTML file, to provide the main document to load in the browser.
- A JavaScript file, to provide the definition of the animation.

... and then including the Aniblock library and its default CSS definitions. It
is also possible to provide additional CSS definitions to providing custom
styling of the diagram elements, but we'll come back to that later.

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
Note that any child elements of this SVG will be deleted when the `Scene` is
first created, so it is recommended that an empty SVG element is used to avoid
any confusion.

**Note:** The JavaScript files are deliberately included at the end of the
document; this ensures that the DOM is loaded before the scripts start
executing. If you include the scripts in the `<head>` of the document, you must
ensure that your `animation.js` user script does not execute until the DOM can
safely be manipulated. If needed this could be achieved by using a jQuery
`$(document).ready()` callback, for example.

The JavaScript file
-------------------

The user provided `animation.js` file is the script which does the heavy
lifting, and the entire script for this animation is shown below:

```javascript
// Set up the canvas    svg_id       w    h
var sc = new ABlk.Scene('animation', 400, 160);

// Create the blocks          label    x    y   w    h
var blkA = new ABlk.Block(sc, 'Hello', 100, 80, 100, 80);
var blkB = new ABlk.Block(sc, 'World', 300, 80, 100, 80);

// Create the link             src   dst   src_exit_edge    sz  plug
var linkAB = new ABlk.Link(sc, blkA, blkB, ABlk.Edge.Right, 40, false);

// Show the blocks
blkA.show();
blkB.show();

// Plug them together
linkAB.plug();

// Unplug them
linkAB.unplug();

// Hide both blocks simultaneously
var fadeTime = blkA.hide();
blkB.hide(fadeTime);
```

What's going on?
================

That was quite a lot to absorb in one go, so let's step though it line by line.

The Scene
---------

The Scene is the main management class for the animation. All other diagram
elements we create are created in the context of a specific Scene instance.

```javascript
// Set up the canvas    svg_id       w    h
var sc = new ABlk.Scene('animation', 400, 160);
```

This line creates a new `Scene` instance, wrapping the SVG element with an `id`
of `animation` in the HTML file. This scene is created with a fixed size of
400x160 pixels, and cannot be resized once created.

**Note:** All Aniblock animations are currently fixed size; they do not
currently support responsive rescaling.

The Blocks
----------

The `Block` is the main diagram element for the animation, defining the major
components in the system we are rendering. Blocks can have a rendered fill,
a stroke, and a label.

```javascript
// Create the blocks          label    x    y   w    h
var blkA = new ABlk.Block(sc, 'Hello', 100, 80, 100, 80);
var blkB = new ABlk.Block(sc, 'World', 300, 80, 100, 80);
```

This creates two Blocks, each with an absolute starting location and size in
pixel coordinates. In this animation we don't move or resize blocks, but that is
possible and we'll come back to that in a later tutorial.

**Note:** The (0,0) origin for the SVG coordinate space is at the top left of
the diagram.

The Link
--------

The `Link` is the means to connect two Block components together. A
Link will automatically adjust its location and size to keep its two Blocks
linked together. A Link can only have a rendered fill; they do not support
strokes or labels.

```javascript
// Create the link             src   dst   src_exit_edge    sz  plug
var linkAB = new ABlk.Link(sc, blkA, blkB, ABlk.Edge.Right, 40, false);
```

This creates a Link joining `blkA` to `blkB`. Note that Links are directional,
and that they are strongly attached to `src` and weakly attached to `dst`.

Links always attach to the center of the named `src` edge and travel
outwards from that edge in a vertical (for `Top` or `Bottom` edges) or
horizontal (for `Left` and `Right` edges) direction.

Links will grow from `src` toward `dst` when animating a `plug()` action, and
will detach from `dst` and shrink into `src` when animating an `unplug()`
action.

**Note:** There is no validation that Link animations make sense. It is
possible to plug two blocks together with a link that fails to insect `dst`,
or to plug together blocks which are not currently visible, both of which will
result in a Link with one end floating in space. Avoiding this is the
responsibility of the animator.

The Animation
-------------

The final pieces of code implement the actual animation sequence we want.
Hopefully when seen alongside the animation it is relatively obvious what is
going on here ...

<p align="center">
  <img src="../../media/tutorial_01.gif" alt="Aniblock Hello World" />
</p>

```javascript
// Show the blocks
blkA.show();
blkB.show();

// Plug them together (grow from A to B)
linkAB.plug();

// Unplug them (shrink from B to A)
linkAB.unplug();

// Hide both blocks simultaneously
var fadeTime = blkA.hide();
blkB.hide(fadeTime);
```

The animation process is based on the concept of a timeline. By default each
new animation that is added without an explicit start time is added to the end
of the timeline, and will start when the final animation currently on the
timeline has finished.

It is often useful to have multiple animations playing at the same time. To
support this each animation function can accept an absolute start time
(in seconds). If this is specified the animation will start at that point in
the timeline, in parallel to any other animations already present.

To make synchronizing animations easier each animation function which adds an
event to the timeline will return its own start time. We use this here to start
the hide animation for `blkB` at the same time as the hide animation we `blkA`.

**Important Note:** All animation rendering is asynchronous; the Aniblock
functions simply define the steps needed and queue the required operations on
the timeline for processing at the appropriate time. For this reason it is
never safe to directly modify DOM elements corresponding to an Aniblock SVG in
your user scripts; such direct modification will apply immediately and will be
completely out-of-synch with the animation.


Summary
=======

In this tutorial you have seen how to set up a new Aniblock `Scene`, which
consists of `Blocks` and `Links` between them. You have also been introduced to
the fundamental concept of the animation timeline, and seen how you can use it
sequence individual Aniblock animations.
