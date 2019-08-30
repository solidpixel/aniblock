// Standard size configuration
var lnkW = 50;

var blkW = 180;
var blkHL = 130;
var blkHM = 80;
var blkHS = 50;

params = {
    showTime: 1,
    hideTime: 1,
    morphTime: 4,
    linkTime: 0.2,
    moveTime: 1,
}

// Set up the Canvas
var sc = new ABox.AScene('animation', 1280, 720, true);
sc.configure(params);

sc.add_vguide('c', '50%');
sc.add_vguide_rel('c-1', 'c', -blkW);
sc.add_vguide_rel('c+1', 'c', +blkW);

sc.add_hguide('bus', '45%');
sc.add_hguide_rel('pro', 'bus', -(blkHL + 60));
sc.add_hguide_rel('mif', 'bus', +(blkHS + 50));
sc.add_hguide_rel('ext', 'bus', +(blkHL + 80));

// Show the CPU
var cpu = new ABox.ABlockLoad(sc, 'bCPU1', 's1', 'CPU', 'c', 'pro', blkW, blkHL);
var dur = cpu.show();
cpu.show_load();
cpu.set_load(90, 25);
sc.add_idle(5);
cpu.set_load(10, 5);
sc.add_idle(5);

// Show the DRAM
var dram = new ABox.ABlock(sc, 'bDRAM', 's4', 'DRAM', 'c', 'ext', blkW, blkHS);
dur = dram.show();

// Link CPU and DRAM to memory bus
var bus = new ABox.ABlock(sc, 'bBUS', 'b1', 'Memory Bus', 'c', 'bus', blkW, blkHS);
dur = bus.show();

cpu.set_load(10, 15);

var cpuLnk = new ABox.ALink(sc, 'lCPU1', 'l1', null, cpu, bus, ABox.Edge.Bottom, lnkW, false);
var dramLnk = new ABox.ALink(sc, 'lDRAM', 'l1', null, dram, bus, ABox.Edge.Top, lnkW, false);
dur = cpuLnk.plug();
dur = dramLnk.plug(-dur);

// Add DMC
dramLnk.unplug();
var dmc = new ABox.ABlock(sc, 'bDMC', 's4', 'Memory\nController', 'c', 'mif', blkW, blkHM);
dur = dmc.show();
dramLnk.plug();

cpu.set_load(50, 15);

// Add SMC
dur = bus.change_width(460, ABox.Dir.Center);
dur = dmc.move_to_x('c-1');
dur = dram.move_to_x('c-1', -dur);

var smc = new ABox.ABlock(sc, 'bSMC', 's4', 'Flash\nController', 'c+1', 'mif', blkW, blkHM);
dur = smc.show();

var flash = new ABox.ABlock(sc, 'bFLS', 's4', 'Flash', 'c+1', 'ext', blkW, blkHS);
dur = flash.show();

var flashLnk = new ABox.ALink(sc, 'lFLS', 'l1', null, flash, bus, ABox.Edge.Top, lnkW, false);
dur = flashLnk.plug();
