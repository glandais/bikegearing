
function initStateV1() {
    const alpha = Math.asin((state.f - state.r) / state.cs);
    state.fa = -Math.PI / 2 - Math.PI / 6;
    state.fcu = 0;
    state.fru = 0;
    state.fr = 8 + Math.round(state.f / 2.0);

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

function debugAngles(label, a1, a2) {
    if (debug) {
        console.log(label + " " + Math.round(180 * a1 / Math.PI) + " " + Math.round(180 * a2 / Math.PI));
    }
}

function progressV1() {
    const da = dt;
    state.t += dt;
    state.fa = state.fa + da;
    let modified = false;
    let modification = 0;
    let onceModified = false;
    let rearMoved = false;
    let rivets = getRivets(state);
    do {
        modified = false;

        let rsr, fsr;

        fsr = getRivet(rivets, state.fru);
        rsr = getRivet(rivets, state.rru);
        let d = dist(fsr.p1, rsr.p1);
        let maxDist = halfLinkChain * getRn(state.rru - state.fru, state.cl);
        if (d >= maxDist) {
            const inter = intersection(
                {
                    x: fsr.p1.x,
                    y: fsr.p1.y,
                    r: maxDist
                },
                {
                    x: 0,
                    y: 0,
                    r: state.rradius
                }
            );
            let pinter;
            if (inter.point_1.y < 0) {
                pinter = inter.point_1;
            } else {
                pinter = inter.point_2;
            }
            const newRa = getAngle({ x: 0, y: 0 }, pinter);
            const currentRa = state.ra - state.rcu * state.rda;
            state.ra = state.ra + (newRa - currentRa);
            rivets = getRivets(state);
            modified = true;
            rearMoved = true;
        }
        fsr = getRivet(rivets, state.fru);
        rsr = getRivet(rivets, state.rru);

        const fscm1 = getRivetPoint(state.cs, state.fradius, state.fa - (state.fcu - 1) * state.fda);
        const fsc = getRivetPoint(state.cs, state.fradius, state.fa - state.fcu * state.fda);
        const fscp1 = getRivetPoint(state.cs, state.fradius, state.fa - (state.fcu + 1) * state.fda);

        const fsra = getAngle(fsr.p1, fsr.p2);
        const fscm1a = getAngle(fscm1, fsc);
        const fscp1a = getAngle(fsc, fscp1);

        if (fsra < fscp1a - 0.001) {
            debugAngles("fsra < fscp1a", fsra, fscp1a);
            state.fcu += 1;
            state.fru += 1;
            rivets = getRivets(state);
            modified = true;
        } else if (fsra > fscm1a + 0.001) {
            debugAngles("fsra > fscm1a", fsra, fscm1a);
            state.fcu -= 1;
            state.fru -= 1;
            rivets = getRivets(state);
            modified = true;
        }

        rsr = getRivet(rivets, state.rru - 1);
        const rscm1 = getRivetPoint(0, state.rradius, state.ra - (state.rcu - 1) * state.rda);
        const rsc = getRivetPoint(0, state.rradius, state.ra - state.rcu * state.rda);
        const rscp1 = getRivetPoint(0, state.rradius, state.ra - (state.rcu + 1) * state.rda);

        const rsra = getAngle(rsr.p2, rsr.p1);
        const rscm1a = getAngle(rsc, rscm1);
        const rscp1a = getAngle(rscp1, rsc);

        if (rsra > rscm1a + 0.001) {
            debugAngles("rsra > rscm1a", rsra, rscm1a);
            state.rcu -= 1;
            state.rru -= 1;
            rivets = getRivets(state);
            modified = true;
        } else if (rsra < rscp1a - 0.001) {
            debugAngles("rsra < rscp1a", rsra, rscp1a);
            state.rcu += 1;
            state.rru += 1;
            rivets = getRivets(state);
            modified = true;
        }

        const rer = getRivet(rivets, state.rru + state.rr - 1);
        const recm1 = getRivetPoint(0, state.rradius, state.ra - (state.rcu + state.rr - 2) * state.rda);
        const rec = getRivetPoint(0, state.rradius, state.ra - (state.rcu + state.rr - 1) * state.rda);
        const recp1 = getRivetPoint(0, state.rradius, state.ra - (state.rcu + state.rr) * state.rda);

        const rera = getAngle(rer.p1, rer.p2);
        const recm1a = getAngle(recm1, rec);
        const recp1a = getAngle(rec, recp1);

        if (rera > recm1a + 0.001) {
            debugAngles("rera > recm1a", rera, recm1a);
            state.rr -= 1;
            rivets = getRivets(state);
            modified = true;
        } else if (rera < recp1a - 0.001) {
            debugAngles("rera < recp1a", rera, recp1a);
            state.rr += 1;
            rivets = getRivets(state);
            modified = true;
        }

        const fer = getRivet(rivets, state.fru - state.fr);
        const fecog = 1 + state.fcu - state.fr;
        const fecm1 = getRivetPoint(state.cs, state.fradius, state.fa - (fecog - 1) * state.fda);
        const fec = getRivetPoint(state.cs, state.fradius, state.fa - fecog * state.fda);
        const fecp1 = getRivetPoint(state.cs, state.fradius, state.fa - (fecog + 1) * state.fda);

        const fera = getAngle(fer.p1, fer.p2);
        const fecm1a = getAngle(fecm1, fec);
        const fecp1a = getAngle(fec, fecp1);

        if (fera > fecm1a + 0.001) {
            debugAngles("fera < fecm1a", fera, fecm1a);
            state.fr += 1;
            rivets = getRivets(state);
            modified = true;
        } else if (fera < fecp1a - 0.001) {
            debugAngles("fera < fecp1a", fera, fecp1a);
            state.fr -= 1;
            rivets = getRivets(state);
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
    return rearMoved;
}
