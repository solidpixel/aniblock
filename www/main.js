// Standard size configuration
var lnkW = 50;

var blkW = 180;
var blkHL = 80;
var blkHM = 70;
var blkHS = 50;

// Set up the Canvas
var sc = new ABlk.AScene('animation', 960, 540, true);
var bookmark = null;

sc.add_vguide('c', '50%');
sc.add_vguide_rel('c-1', 'c', -(blkW-20));
sc.add_vguide_rel('c+1', 'c', +(blkW-20));

sc.add_hguide('bus', '35%');
sc.add_hguide_rel('pro', 'bus', -(blkHL + 25));
sc.add_hguide_rel('mif', 'bus', +(blkHM + 20));
sc.add_hguide_rel('ext', 'mif', +(blkHS + 40));


// Show the CPU
var cpu = new ABlk.ABlock(sc, 'bCPU1', 's1', 'CPU', 'c', 'pro', blkW, blkHL);
cpu.show();

// Show the DRAM
var dram = new ABlk.ABlock(sc, 'bDRAM', 's4', 'DRAM', 'c', 'ext', blkW, blkHS);
dram.show();

// Link CPU and DRAM to memory bus
var bus = new ABlk.ABlock(sc, 'bBUS', 'b1', 'Memory Bus', 'c', 'bus', blkW, 40);
bus.show();

var cpuLnk = new ABlk.ALink(sc, 'lCPU1', 'l1', null, cpu, bus, ABlk.Edge.Bottom, lnkW, false);
var dramLnk = new ABlk.ALink(sc, 'lDRAM', 'l1', null, dram, bus, ABlk.Edge.Top, lnkW, false);
bookmark = cpuLnk.plug();
dramLnk.plug(bookmark);

// Add DMC
dramLnk.unplug();
var dmc = new ABlk.ABlock(sc, 'bDMC', 's4', 'Memory\nController', 'c', 'mif', blkW, blkHM);
dmc.show();
dramLnk.plug();

// Add SMC
bus.change_width(460, ABlk.Dir.Center);
bookmark = dmc.move_to_x('c-1');
dram.move_to_x('c-1', bookmark);

var smc = new ABlk.ABlock(sc, 'bSMC', 's4', 'Flash\nController', 'c+1', 'mif', blkW, blkHM);
smc.show();

var flash = new ABlk.ABlock(sc, 'bFLS', 's4', 'Flash', 'c+1', 'ext', blkW, blkHS);
flash.show();

var flashLnk = new ABlk.ALink(sc, 'lFLS', 'l1', null, flash, bus, ABlk.Edge.Top, lnkW, false);
flashLnk.plug();
