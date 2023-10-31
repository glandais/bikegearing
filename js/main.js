let canvas;
let ctx;

//var debug = true;
//let speed = 0.1;
// let paused = true;
var debug = false;
let speed = 1.0;
let paused = false;

let speeda = 1.0;

let followRivet = false;

const halfLink = 25.4 / 2.0;
let halfLinkChain = 25.4 / 2.0;

var state = {
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

function reset() {
  state.fda = (2.0 * Math.PI) / state.f; // angle between two cogs
  state.fradius = halfLink / 2 / Math.sin(state.fda / 2.0); // radius to rivet - drawing1.jpg

  state.rda = (2.0 * Math.PI) / state.r; // angle between two cogs
  state.rradius = halfLink / 2 / Math.sin(state.rda / 2.0); // radius to rivet - drawing1.jpg

  state.t = 0;
  //simpleInit()
  initStateV1();

  document.getElementById("speeda").value = speeda;
  document.getElementById("speed").value = speed;
  document.getElementById("f").value = state.f;
  document.getElementById("r").value = state.r;
  document.getElementById("cs1").value = Math.floor(state.cs);
  document.getElementById("cs2").value = 100.0 * (state.cs - Math.floor(state.cs));
  document.getElementById("cl").value = state.cl;
}

function progress(dtchrono) {
  let start = performance.now();
  //simpleProgress(dtchrono)
  progressV1(dtchrono);
  state.progressDuration = performance.now() - start;
}

let previousChrono;
function frame(chrono) {
  if (previousChrono === undefined) {
    previousChrono = chrono;
  }
  if (!paused) {
    let dchrono = chrono - previousChrono;
    if (dchrono > 100) {
      dchrono = 16;
    }
    progress(dchrono);
    draw();
  }
  previousChrono = chrono;
  requestAnimationFrame(frame);
}

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resize();
  initInteractive();
  reset();
  requestAnimationFrame(frame);
}

function setHalfLinkChain(perc) {
  halfLinkChain = 12.7 * ((100.0 + perc) / 100.0);
}

function setCs1() {
  state.cs = 1.0 * document.getElementById("cs1").value;
  document.getElementById("cs2").value = 0;
}

function setCs2() {
  let cs1 = 1.0 * document.getElementById("cs1").value;
  let cs2 = document.getElementById("cs2").value / 100.0;
  state.cs = cs1 + cs2;
}

function pause() {
  paused = !paused;
}

function drawIfPaused() {
  if (paused) {
    draw();
  }
}

function switchDebug() {
  debug = !debug;
  drawIfPaused();
}
