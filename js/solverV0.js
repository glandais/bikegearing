
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

function simpleCompute(dtchrono) {
    let da = (1 / 60.0) * speed;
    state.fa = state.fa + da;
    fru = fru + (state.f * da) / TWO_PI;
    state.fru = Math.round(fru);
    state.fcu = Math.round(14 + (state.f * state.fa) / TWO_PI) % state.f;

    let rda = da * (state.f / state.r);
    state.ra = state.ra + rda;
    rru = rru + (state.r * rda) / TWO_PI;
    state.rru = Math.round(rru);
    state.rcu = Math.round(4 + (state.r * state.ra) / TWO_PI) % state.r;
}
