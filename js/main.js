var debug = true;
let dt = 0;

var state = {
  f: 50, // teeth front
  r: 15, // teeth rear
  cs: 410, // chainstay (mm)
  cl: 100, // chain length in rivets (mm -> cl * 2.54 / 2)
  af: 0, // angle front
  ar: 0, // angle rear
  fu: 14, // cog hole number where chain is leaving front
  cfu: 18, // rivet number on fu
  ru: 5, // cog hole number where chain is arriving on rear
  cru: 49, // rivet number on ru
  clf: 29, // rivets on front
  clr: 8, // rivets on rear
};

let cfu = state.cfu;
let cru = state.cru;

function simpleProgress() {
  const da = dt;
  state.af = state.af + da;
  cfu = cfu + (state.f * da) / (2 * Math.PI);
  state.cfu = Math.round(cfu);
  state.fu = Math.round(14 + (state.f * state.af) / (2 * Math.PI)) % state.f;

  const dar = da * (state.f / state.r);
  state.ar = state.ar + dar;
  cru = cru + (state.r * dar) / (2 * Math.PI);
  state.cru = Math.round(cru);
  state.ru = Math.round(4 + (state.r * state.ar) / (2 * Math.PI)) % state.r;
}

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resize();
  initInteractive();
  draw();
  setInterval(progressV1, 25);
}

function switchDebug() {
    debug = !debug;
}
function setDt(v) {
    dt = v;
}