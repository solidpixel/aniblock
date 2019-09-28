/*
 * Aniblock: Copyright (c) 2019, Pete Harris
 */

// Set up the canvas    svg_id       w    h    debug
var sc = new ABlk.Scene('animation', 400, 160, false);

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
