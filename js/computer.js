
function resetComputer(state) {
    let alpha = Math.asin((state.f - state.r) / state.cs);
    state.fa = -Math.PI / 2 - Math.PI / 6;
    state.fcu = 0;
    state.fru = 0;
    state.fr = 8 + Math.round(state.f / 2.0);

    state.ra = -Math.PI / 2;
    state.rcu = 0;
    state.rru = Math.round((state.cs * Math.cos(alpha)) / HALF_LINK);
    state.rr = Math.round(state.r / 2.0);
}

function debugAngles(label, a1, a2) {
    if (debug) {
        //console.log(label + " " + Math.round(180 * a1 / Math.PI) + " " + Math.round(180 * a2 / Math.PI));
    }
}

function compute(state, dtchrono) {
    let start = performance.now();

    let dt = speed * (dtchrono / 1000);
    state.t += dt;
    let onceModified = false;

    let rpra = state.ra;
    let fpra = state.fa;

    let fra = state.fa + dt * 10;
    let modification = 0;
    while (state.fa < fra) {

        state.fa = state.fa + 0.01;
        if (state.fa > fra) {
            state.fa = fra;
        }
        let modified = false;
        let rivets = getRivets(state);
        do {
            modified = false;

            let rsr, fsr;

            fsr = getRivet(state, rivets, state.fru);
            rsr = getRivet(state, rivets, state.rru);
            let d = dist(fsr.p1, rsr.p1);
            let maxDist = halfLinkChain * getRn(state.rru - state.fru, state.cl);
            if (d >= maxDist) {
                let inter = intersection(
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
                let newRa = getAngle({ x: 0, y: 0 }, pinter);
                let currentRa = state.ra - state.rcu * state.rda;
                if (Math.abs(newRa - currentRa) > 0.00001) {
                    state.ra = state.ra + (newRa - currentRa);
                    rivets = getRivets(state);
                    modified = true;
                }
            }
            fsr = getRivet(state, rivets, state.fru);
            rsr = getRivet(state, rivets, state.rru);

            let fscm1 = getRivetPoint(state.cs, state.fradius, state.fa - (state.fcu - 1) * state.fda);
            let fsc = getRivetPoint(state.cs, state.fradius, state.fa - state.fcu * state.fda);
            let fscp1 = getRivetPoint(state.cs, state.fradius, state.fa - (state.fcu + 1) * state.fda);

            let fsra = getAngle(fsr.p1, fsr.p2);
            let fscm1a = getAngle(fscm1, fsc);
            let fscp1a = getAngle(fsc, fscp1);

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

            rsr = getRivet(state, rivets, state.rru - 1);
            let rscm1 = getRivetPoint(0, state.rradius, state.ra - (state.rcu - 1) * state.rda);
            let rsc = getRivetPoint(0, state.rradius, state.ra - state.rcu * state.rda);
            let rscp1 = getRivetPoint(0, state.rradius, state.ra - (state.rcu + 1) * state.rda);

            let rsra = getAngle(rsr.p2, rsr.p1);
            let rscm1a = getAngle(rsc, rscm1);
            let rscp1a = getAngle(rscp1, rsc);

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

            let rer = getRivet(state, rivets, state.rru + state.rr - 1);
            let recm1 = getRivetPoint(0, state.rradius, state.ra - (state.rcu + state.rr - 2) * state.rda);
            let rec = getRivetPoint(0, state.rradius, state.ra - (state.rcu + state.rr - 1) * state.rda);
            let recp1 = getRivetPoint(0, state.rradius, state.ra - (state.rcu + state.rr) * state.rda);

            let rera = getAngle(rer.p1, rer.p2);
            let recm1a = getAngle(recm1, rec);
            let recp1a = getAngle(rec, recp1);

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

            let fer = getRivet(state, rivets, state.fru - state.fr);
            let fecog = 1 + state.fcu - state.fr;
            let fecm1 = getRivetPoint(state.cs, state.fradius, state.fa - (fecog - 1) * state.fda);
            let fec = getRivetPoint(state.cs, state.fradius, state.fa - fecog * state.fda);
            let fecp1 = getRivetPoint(state.cs, state.fradius, state.fa - (fecog + 1) * state.fda);

            let fera = getAngle(fer.p1, fer.p2);
            let fecm1a = getAngle(fecm1, fec);
            let fecp1a = getAngle(fec, fecp1);

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
        state.fcu = state.fcu % state.f;
        state.rcu = state.rcu % state.r;
        state.fru = state.fru % state.cl;
        state.rru = state.rru % state.cl;
    }
    state.fa = comparableAngle(0, state.fa);
    state.ra = comparableAngle(0, state.ra);

    let rda = state.ra - rpra;
    rda = comparableAngle(0, rda);
    let fda = state.fa - fpra;
    fda = comparableAngle(0, fda);

    let distchronokm = (2100 / (1000 * 1000)) * (rda / TWO_PI);
    let dtchronoh = dtchrono / (1000 * 3600);
    let speedkmh = distchronokm / dtchronoh;

    state.speedkmh = speedkmh;

    let rotation = fda / TWO_PI;
    let dtchronomin = dtchrono / (1000 * 60);
    let rpm = rotation / dtchronomin;

    state.rpm = rpm;
    
    let computeDuration = performance.now() - start;
    state.computeLog = onceModified + " " + modification + " " + roundHuman(computeDuration, 1) + "ms";
}
