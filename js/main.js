let canvas;
let ctx;

//var debug = true;
//let dt = 0.001;
var debug = false;
let dt = 0.015;

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

  document.getElementById("dt").value = dt;
  document.getElementById("f").value = state.f;
  document.getElementById("r").value = state.r;
  document.getElementById("cs").value = state.cs;
  document.getElementById("cl").value = state.cl;
}

function progress() {
  //simpleProgress()
  progressV1();
}

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resize();
  initInteractive();
  reset();
  setInterval(progress, 25);
  draw();
}

function setHalfLinkChain(perc) {
  halfLinkChain = 12.7 * ((100.0 + perc) / 100.0);
}