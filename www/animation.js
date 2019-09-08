// Standard size configuration
var lnkW = 50;

var blkW = 180;
var blkHL = 80;
var blkHM = 70;
var blkHS = 50;

// Set up the Canvas
var sc = new ABlk.Scene('animation', 960, 540, true);
var bookmark = null;

sc.add_constant('BLK_W', blkW);
sc.add_constant('BLK_HL', blkHL);
sc.add_constant('BLK_HM', blkHM);
sc.add_constant('BLK_HS', blkHS);

sc.add_vguide('c', '50%');
sc.add_vguide('c-1', 'c - BLK_W + 20');
sc.add_vguide('c+1', 'c + BLK_W - 20');

sc.add_hguide('bus', '45%');
sc.add_hguide('pro', 'bus - BLK_HL - 25');
sc.add_hguide('mif', 'bus + BLK_HM + 20');
sc.add_hguide('ext', 'mif + BLK_HS + 40');

// Show the CPU
var cpu = new ABlk.BlockLoad(sc, 'bCPU1', 's1', 'CPU', 'c', 'pro', blkW, blkHL);
cpu.show();
cpu.show_load();
cpu.set_load(10, 5);

// Show the DRAM
var dram = new ABlk.Block(sc, 'bDRAM', 's4', 'DRAM', 'c', 'ext', blkW, blkHS);
dram.show();

// Link CPU and DRAM to memory bus
var bus = new ABlk.Block(sc, 'bBUS', 'ALink', 'Memory Bus', 'c', 'bus', blkW, 40);
bus.show();

var cpuLnk = new ABlk.Link(sc, 'lCPU1', null, null, cpu, bus, ABlk.Edge.Bottom, lnkW, false);
var dramLnk = new ABlk.Link(sc, 'lDRAM', null, null, dram, bus, ABlk.Edge.Top, lnkW, false);
bookmark = cpuLnk.plug();
dramLnk.plug(bookmark);

// Add DMC
dramLnk.unplug();
var dmc = new ABlk.Block(sc, 'bDMC', 's4', 'Memory\nController', 'c', 'mif', blkW, blkHM);
dmc.show();
dramLnk.plug();

// Add SMC
bus.change_width(460, ABlk.Dir.Center);
bookmark = dmc.move_to_x('c-1');
dram.move_to_x('c-1', bookmark);

var smc = new ABlk.Block(sc, 'bSMC', 's4', 'Flash\nController', 'c+1', 'mif', blkW, blkHM);
smc.show();

var flash = new ABlk.Block(sc, 'bFLS', 's4', 'Flash', 'c+1', 'ext', blkW, blkHS);
flash.show();

var flashLnk = new ABlk.Link(sc, 'lFLS', null, null, flash, bus, ABlk.Edge.Top, lnkW, false);
flashLnk.plug();
