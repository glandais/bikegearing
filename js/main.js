var canvas;
var ctx;

let debug;
let debugCompute;
let speed;
let paused;
let followRivet;
let doDrawWheel;

const HALF_LINK = 25.4 / 2.0;
let halfLinkChain;

var state;

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  initInteractive();

  resetState();
  requestAnimationFrame(frame);
}

function resetState() {
  state = {
    f: 51, // teeth front
    r: 15, // teeth rear
    cs: 406, // chainstay (mm)
    cl: 98, // chain length in rivets (mm -> cl * 2.54 / 2)

    fa: 0, // angle front
    fcu: 0, // cog hole number where chain is leaving front - up
    fru: 0, // rivet number on fcu
    fcb: 0, // cog hole number where chain is leaving front - bottom
    frb: 0, // rivet number on fcb

    ra: 0, // angle rear
    rcu: 4, // cog hole number where chain is leaving rear - up
    rru: 50, // rivet number on rcu
    rcb: 0, // cog hole number where chain is leaving rear - bottom
    rrb: 0, // rivet number on fcb

    modified: ""
  };

  debug = false;
  debugCompute = false;
  speed = 1.0;
  paused = false;

  followRivet = false;

  doDrawWheel = true;

  halfLinkChain = HALF_LINK;

  reset();
}

function reset() {
  state.fda = (2.0 * Math.PI) / state.f; // angle between two cogs
  state.fradius = (HALF_LINK / 2) / Math.sin(state.fda / 2.0); // radius to rivet - drawing1.jpg

  state.rda = (2.0 * Math.PI) / state.r; // angle between two cogs
  state.rradius = (HALF_LINK / 2) / Math.sin(state.rda / 2.0); // radius to rivet - drawing1.jpg

  // https://www.icebike.org/skid-patch-calculator/
  let reduced = reduce(state.f, state.r);
  state.skidPatchesSingleLegged = reduced[1];
  if (reduced[0] % 2 == 0) {
    state.skidPatchesAmbidextrous = reduced[1];
  } else {
    state.skidPatchesAmbidextrous = reduced[1] * 2;
  }

  state.t = 0;

  resetComputer(state);
  compute(state, 0);

  updateHalfLinkChainUI();
  document.getElementById("speed").value = speed;
  document.getElementById("f").value = state.f;
  document.getElementById("r").value = state.r;
  document.getElementById("cs1").value = Math.floor(state.cs);
  document.getElementById("cs2").value = 100.0 * (state.cs - Math.floor(state.cs));
  document.getElementById("cl").value = state.cl;
  document.getElementById("doDrawWheel").checked = doDrawWheel;
  document.getElementById("followRivet").checked = followRivet;
  document.getElementById("debug").checked = debug;
  document.getElementById("paused").checked = paused;

  resetInteractive();
}

let previousChrono;
function frame(chrono) {
  if (previousChrono === undefined) {
    previousChrono = chrono;
  }
  if (!paused) {
    let dchrono = Math.max(1, chrono - previousChrono);
    state.fps = 1000 / dchrono;
    if (dchrono > 100) {
      dchrono = 16;
    }
    compute(state, dchrono);
    draw(state);
  } else {
    state.fps = 0;
  }
  previousChrono = chrono;
  requestAnimationFrame(frame);
}
