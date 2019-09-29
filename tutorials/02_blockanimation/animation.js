/*
 * Aniblock: Copyright (c) 2019, Pete Harris
 */

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


// Create the scene elements
var sc = new ABlk.Scene('animation_width', cw, ch, false);
var blkA = new ABlk.Block(sc, 'Width', cw / 2, ch / 2, bw, bh);

// Show the block
blkA.show();

// Grow and shrink left
blkA.change_width(cw / 2 + bw / 2 - cpad, ABlk.Dir.Left);
blkA.change_width(bw, ABlk.Dir.Left);

// Grow and shrink right
blkA.change_width(cw - cpad * 2, ABlk.Dir.Right);
blkA.change_width(bw, ABlk.Dir.Right);

// Grow left and shrink back to center
blkA.change_width(cw - cpad * 2, ABlk.Dir.Left);
blkA.change_width(bw, ABlk.Dir.Center);

// Hide the block
blkA.hide();


// Create the scene elements
var sc = new ABlk.Scene('animation_height', cw, ch, false);
var blkA = new ABlk.Block(sc, 'Height', cw / 2, ch / 2, bw, bh);

// Show the block
blkA.show();

// Grow and shrink up
blkA.change_height(ch / 2 + bh / 2 - cpad, ABlk.Dir.Up);
blkA.change_height(bh, ABlk.Dir.Up);

// Grow and shrink down
blkA.change_height(ch - cpad * 2, ABlk.Dir.Down);
blkA.change_height(bh, ABlk.Dir.Down);

// Grow up and shrink back to center
blkA.change_height(ch - cpad * 2, ABlk.Dir.Up);
blkA.change_height(bh, ABlk.Dir.Center);

// Hide the block
blkA.hide();
