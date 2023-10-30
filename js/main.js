var debug = true;
let dt = 0;

var state = {
  f: 50, // teeth front
  r: 15, // teeth rear
  cs: 410, // chainstay (mm)
  cl: 98, // chain length in rivets (mm -> cl * 2.54 / 2)

  fa: 0, // angle front
  fcu: 14, // cog hole number where chain is leaving front
  fru: 18, // rivet number on fcu
  fr: 29, // rivets on front

  ra: 0, // angle rear
  rcu: 4, // cog hole number where chain is arriving on rear
  rru: 50, // rivet number on rcu
  rr: 8, // rivets on rear
};

let fru = state.fru;
let rru = state.rru;

function simpleInit() {
  state.fa = 0;
  state.fcu = 14;
  state.fru = 18;
  state.fr = 29;

  state.ra = 0;
  state.rcu = 4;
  state.rru = 50;
  state.rr = 8;
}

function simpleProgress() {
  const da = dt;
  state.fa = state.fa + da;
  fru = fru + (state.f * da) / (2 * Math.PI);
  state.fru = Math.round(fru);
  state.fcu = Math.round(14 + (state.f * state.fa) / (2 * Math.PI)) % state.f;

  const dar = da * (state.f / state.r);
  state.ra = state.ra + dar;
  rru = rru + (state.r * dar) / (2 * Math.PI);
  state.rru = Math.round(rru);
  state.rcu = Math.round(4 + (state.r * state.ra) / (2 * Math.PI)) % state.r;
}

function initState() {
  const alpha = Math.asin((state.f - state.r) / state.cs);
  state.fa = -Math.PI / 2 - Math.PI / 6;
  state.fcu = 0;
  state.fru = 0;
  state.fr = Math.round(state.f / 2.0);

  state.ra = -Math.PI / 2;
  state.rcu = 0;
  state.rru = Math.round((state.cs * Math.cos(alpha)) / halfLink);
  state.rr = Math.round(state.r / 2.0);
}

function progressV1() {
  const da = dt;
  state.fa = state.fa + da;
}

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resize();
  initInteractive();
  draw();
  simpleInit()
  setInterval(simpleProgress, 25);
  //initState();
  //setInterval(progressV1, 25);
}
