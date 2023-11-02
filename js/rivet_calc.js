class BikeGearingRivetsCalculator {
  constructor(state) {
    this.state = state;
  }

  getCogIndex(c, i) {
    while (i < 0) {
      i = i + c;
    }
    return i % c;
  }

  getRivet(rivets, i) {
    return rivets[this.state.getRivetIndex(i)];
  }

  getFrontCogPoint(c) {
    let a = this.state.fa - c * this.state.fda;
    return {
      x: this.state.cs + this.state.fradius * Math.cos(a),
      y: this.state.fradius * Math.sin(a),
    };
  }

  getRearCogPoint(c) {
    let a = this.state.ra - c * this.state.rda;
    return {
      x: this.state.rradius * Math.cos(a),
      y: this.state.rradius * Math.sin(a),
    };
  }

  getRivetsUp(rivets) {
    let s = this.getFrontCogPoint(this.state.fcu);
    let e = this.getRearCogPoint(this.state.rcu);
    let rc = this.state.getRivetIndex(this.state.rru - this.state.fru);
    let points = BikeGearingCatenary.getCatenaryIntervals(
      s,
      e,
      rc * BikeGearingState.HALF_LINK,
      rc
    );
    for (let i = 0; i < points.length; i++) {
      rivets.push(points[i]);
    }
  }

  getRivetsRear(rivets) {
    let count = this.state.getRivetIndex(this.state.rrb - this.state.rru);
    for (let i = 1; i < count; i++) {
      let c = this.state.rcu + i;
      let p = this.getRearCogPoint(c);
      rivets.push(p);
    }
  }

  getRivetsDown(rivets) {
    let s = this.getRearCogPoint(this.state.rcb);
    let e = this.getFrontCogPoint(this.state.fcb);
    let rc = this.state.getRivetIndex(this.state.frb - this.state.rrb);
    let points = BikeGearingCatenary.getCatenaryIntervals(
      s,
      e,
      rc * BikeGearingState.HALF_LINK,
      rc
    );
    for (let i = 0; i < points.length; i++) {
      rivets.push(points[i]);
    }
  }

  getRivetsFront(rivets) {
    let count = this.state.getRivetIndex(this.state.fru - this.state.frb);
    for (let i = 1; i < count; i++) {
      let c = this.state.fcb + i;
      let p = this.getFrontCogPoint(c);
      rivets.push(p);
    }
  }

  getRivets() {
    let rivets = [];
    this.getRivetsUp(rivets);
    this.getRivetsRear(rivets);
    this.getRivetsDown(rivets);
    this.getRivetsFront(rivets);
    let result = [];
    for (let i = 0; i < this.state.cl; i++) {
      result.push(rivets[this.state.getRivetIndex(i - this.state.fru)]);
    }
    return result;
  }
}
