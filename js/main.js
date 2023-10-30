var debug = false;
let dt = 0.005;

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

  modified: false
};

let fru = state.fru;
let rru = state.rru;

function simpleInit() {
  state.daf = (2.0 * Math.PI) / state.f; // angle between two cogs
  state.fradius = halfLink / 2 / Math.sin(state.daf / 2.0); // radius to rivet - drawing1.jpg

  state.dar = (2.0 * Math.PI) / state.r; // angle between two cogs
  state.rradius = halfLink / 2 / Math.sin(state.dar / 2.0); // radius to rivet - drawing1.jpg

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
  state.daf = (2.0 * Math.PI) / state.f; // angle between two cogs
  state.fradius = halfLink / 2 / Math.sin(state.daf / 2.0); // radius to rivet - drawing1.jpg

  state.dar = (2.0 * Math.PI) / state.r; // angle between two cogs
  state.rradius = halfLink / 2 / Math.sin(state.dar / 2.0); // radius to rivet - drawing1.jpg

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

function getRivet(rivets, rn) {
  rn = getRn(rn, state.cl);
  for (let i = 0; i < rivets.length; i++) {
    if (rivets[i].rn === rn) {
      return rivets[i];
    }
  }
}

function progressV1() {
  const da = dt;
  state.fa = state.fa + da;
  let modified = false;
  let modification = 0;
  let onceModified = false;
  do {
    modified = false;
    let rivets = getRivets(state);

    let frivet = getRivet(rivets, state.fru);
    let rrivet = getRivet(rivets, state.rru);

    let chainAngle = getAngle(frivet.p1, rrivet.p1);
    let rchainAngle = getAngle(rrivet.p1, rrivet.p2);

    if (dist(frivet.p2, { x: state.cs, y: 0 }) < state.fradius) {
      state.fcu += 1;
      state.fru += 1;
      rivets = getRivets(state);
      modified = true;
    }

    if (chainAngle - rchainAngle < 0) {
      state.rcu += 1;
      state.rru += 1;
      modified = true;
    }

    let d = dist(frivet.p1, rrivet.p1);
    let maxDist = halfLinkChain * getRn(state.rru - state.fru, state.cl);
    if (d >= maxDist) {
      state.ra = state.ra + dt;
      modified = true;
    }

    let fbrivet = getRivet(rivets, state.fru - state.fr - 1);
    let fbrivetp1 = getRivet(rivets, state.fru - state.fr + 1);
    let rbrivet = getRivet(rivets, state.rru + state.rr);

    chainAngle = getAngle(rbrivet.p1, fbrivet.p1);

    fbrivetAngle = getAngle(fbrivetp1.p1, fbrivetp1.p2);
    if (chainAngle - fbrivetAngle < 0) {
      state.fr = state.fr - 1;
    }

    if (dist(fbrivet.p2, { x: state.cs, y: 0 }) + 0.1 < state.fradius) {
      state.fr += 1;
      modified = true;
    }

    let minRr = 0;
    let minAngle = 4*Math.PI;
    for (let cog = 0; cog < state.r; cog++) {
      const p1 = getRivetPoint(0, state.rradius, state.ra - cog * state.dar);  
      let angle = getAngle(p1, fbrivet.p2);
      if (angle < minAngle) {
        minAngle = angle;
        minRr = 1 + cog - state.rcu;
        while (minRr < 0) {
          minRr = minRr + state.r;
        }
      }
    }
    if (minRr != state.rr) {
      state.rr = minRr;
      modified = true;
    }

    if (modified) {
      modification++;
      onceModified = true;
    }
  } while (modified && modification < 100);
  state.modified = onceModified + " " + modification;
  state.fcu = state.fcu % state.f;
  state.rcu = state.rcu % state.r;
  state.fru = state.fru % state.cl;
  state.rru = state.rru % state.cl;
}

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  resize();
  initInteractive();
  draw();
  //simpleInit()
  //setInterval(simpleProgress, 25);
  initState();
  setInterval(progressV1, 25);
}
