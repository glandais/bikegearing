
let fru;
let rru;

function simpleInit() {
    state.fa = 0;
    state.fcu = 14;
    state.fru = 18;
    state.fr = 29;

    state.ra = 0;
    state.rcu = 4;
    state.rru = 50;
    state.rr = 8;

    fru = state.fru;
    rru = state.rru;
}

function simpleProgress() {
    const da = dt;
    state.fa = state.fa + da;
    fru = fru + (state.f * da) / (2 * Math.PI);
    state.fru = Math.round(fru);
    state.fcu = Math.round(14 + (state.f * state.fa) / (2 * Math.PI)) % state.f;

    const rda = da * (state.f / state.r);
    state.ra = state.ra + rda;
    rru = rru + (state.r * rda) / (2 * Math.PI);
    state.rru = Math.round(rru);
    state.rcu = Math.round(4 + (state.r * state.ra) / (2 * Math.PI)) % state.r;
}
