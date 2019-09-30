Tutorial 2: Block Animation
===========================

In this tutorial we'll look at the five main types of block animation that
are available: show, hide, moves, changes in width, and changes in height.
For sake of brevity I include the show and hide animations in the sections
explaining the others, as they are relatively simple.

Full source code for this sample can be found [here](./).

_**Note:** The source code for this sample shows how to create and animate
multiple `Scenes` simultaneously by using multiple `svg` containers._

Move animations
===============

One of the most important animations in a diagram is the ability to move
`Block` elements around.

<p align="center">
  <img src="../../media/tutorial_02_move.gif"
       alt="Demonstration of Aniblock block move animations" />
</p>

The sample code for this animation is:

```javascript
// Size parameters
var cw = 400; var ch = 160; var cpad = 20;
var bw = 100; var bh = 60;

// Create scene elements
var sc = new ABlk.Scene('animation_move', cw, ch, false);
var blkA = new ABlk.Block(sc, 'Move', cw / 2, ch / 2, bw, bh);

// Show the block
blkA.show();

// Moves in X axis
blkA.move_to_x(bw / 2 + cpad);
blkA.move_by_x(cw - bw - 2 * cpad);
blkA.move_to_x(cw / 2);

// Moves in Y axis
blkA.move_to_y(bh / 2 + cpad);
blkA.move_by_y(ch - bh - 2 * cpad);
blkA.move_to_y(ch / 2);

// Hide the block
blkA.hide();
```

What's going on?
----------------

The animation components in this sample are reasonably simple to understand:

* The `show()` call animates the block appearing.
* The `move_to_*()` calls are moves the center of the block to an absolute
  coordinate in the diagram.
* The `move_by_*()` calls are moves by a coordinate offset relative to the
  current position of the block.
* The `hide()` call animates the block disappearing.

The most important thing to remember with moves is that the origin for the
coordinate system is the top left corner of the diagram, and that Y increases
in a downward direction.


Change width animations
=======================

The final pair of animations provide the ability to change the sizes of blocks.

In width:

<p align="center">
  <img src="../../media/tutorial_02_width.gif"
       alt="Demonstration of Aniblock block move animations" />
</p>

... for which the sample code is:

```javascript
// Grow and shrink left
blkA.change_width(cw / 2 + bw / 2 - cpad, ABlk.Dir.Left);
blkA.change_width(bw, ABlk.Dir.Left);

// Grow and shrink right
blkA.change_width(cw - cpad * 2, ABlk.Dir.Right);
blkA.change_width(bw, ABlk.Dir.Right);

// Grow left and shrink back to center
blkA.change_width(cw - cpad * 2, ABlk.Dir.Left);
blkA.change_width(bw, ABlk.Dir.Center);
```

... and in height:

<p align="center">
  <img src="../../media/tutorial_02_height.gif"
       alt="Demonstration of Aniblock block move animations" />
</p>

... for which the sample code is:

```javascript
// Grow and shrink up
blkA.change_height(ch / 2 + bh / 2 - cpad, ABlk.Dir.Up);
blkA.change_height(bh, ABlk.Dir.Up);

// Grow and shrink down
blkA.change_height(ch - cpad * 2, ABlk.Dir.Down);
blkA.change_height(bh, ABlk.Dir.Down);

// Grow up and shrink back to center
blkA.change_height(ch - cpad * 2, ABlk.Dir.Up);
blkA.change_height(bh, ABlk.Dir.Center);
```

What's going on?
----------------

Again, these animations are reasonably intuitive to understand:

* The `change_height()` calls change the height of the block to the absolute
  new value.
* The `change_width()` calls change the width of the block to the absolute
  new value.

The only new concept to understand here is how to interpret the directions
that define how to grow or shrink the block shape. These should be interpreted
as the direction in which the center of mass the block has moved once the
animation has completed.

For example if you grow a block in the the `Up` direction then the bottom edge
will stay still and the top edge will move upwards, pushing the center of mass
upwards with it. Conversely you shrink a block in the `Up` direction then the
top edge will stay still and the bottom edge will move upwards, pulling the
center of mass upwards with it.


Summary
=======

In this tutorial you have seen how to perform all of the fundamental animations
of `Block` elements in the diagram.
