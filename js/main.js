var canvas;
var ctx;

let debug;
let speed;
let paused;
let followRivet;
let doDrawWheel;

const HALF_LINK = 25.4 / 2.0;
let halfLinkChain = 25.4 / 2.0;

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
    f: 50, // teeth front
    r: 15, // teeth rear
    cs: 409, // chainstay (mm)
    cl: 98, // chain length in rivets (mm -> cl * 2.54 / 2)

    fa: 0, // angle front
    fcu: 14, // cog hole number where chain is leaving front
    fru: 18, // rivet number on fcu
    fr: 29, // rivets on front

    ra: 0, // angle rear
    rcu: 4, // cog hole number where chain is arriving on rear
    rru: 50, // rivet number on rcu
    rr: 8, // rivets on rear

    modified: ""
  };

  debug = false;
  speed = 1.0;
  paused = false;

  followRivet = false;

  doDrawWheel = true;

  halfLinkChain = 25.4 / 2.0;

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
