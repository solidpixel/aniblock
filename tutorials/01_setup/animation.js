/*
 * Aniblock: Copyright (c) 2019, Pete Harris
 */

// Set up the canvas
var sc = new ABlk.Scene('animation', 400, 160, false);

// Show the blocks
var blockA = new ABlk.Block(sc, 'Hello', 100, 80, 100, 80);
blockA.show();

var blockB = new ABlk.Block(sc, 'World', 300, 80, 100, 80);
blockB.show();

// Link the blocks
var linkAB = new ABlk.Link(sc, blockA, blockB, ABlk.Edge.Right, 40, false);
linkAB.plug();

// Unblock the blocks
linkAB.unplug();

// Hide both blocks simultaneously
var fadeTime = blockA.hide();
blockB.hide(fadeTime);
