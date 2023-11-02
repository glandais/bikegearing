function updateHalfLinkChainUI() {
  let perc = (100.0 * halfLinkChain) / 12.7 - 100;
  document.getElementById("halfLinkChain").value = perc;
}

function setHalfLinkChain(perc) {
  halfLinkChain = 12.7 * ((100.0 + perc) / 100.0);
  compute0();
}

function setCs1() {
  state.cs = 1.0 * document.getElementById("cs1").value;
  document.getElementById("cs2").value = 0;
  compute0();
}

function setCs2() {
  let cs1 = 1.0 * document.getElementById("cs1").value;
  let cs2 = document.getElementById("cs2").value / 100.0;
  state.cs = cs1 + cs2;
  compute0();
}

function setCl(cl) {
  let dcl = cl - state.cl;
  let df = getRivetIndex(state, state.fru - state.frb);
  let dr = getRivetIndex(state, state.rrb - state.rru);
  // make fru greater than frb
  state.cl = cl;
  state.frb = state.frb + dcl;
  state.fru = state.frb + df;
  state.rru = state.rrb - dr;
  moduloState(state);
  compute0();
}

function compute0() {
  compute(state, 0);
  draw(state);
}

function switchPause(cb) {
  paused = cb.checked;
  if (paused) {
    state.fps = 0;
    draw(state);
  }
}
