
var debug = true;

var state = {
    f: 50, // teeth front
    r: 15, // teeth rear
    cs: 410, // chainstay (mm)
    cl: 100, // chain length in rivets (mm -> cl * 2.54 / 2)
    af: 0, // angle front
    ar: 0, // angle rear
    fu: 14, // cog hole number where chain is leaving front
    cfu: 18, // rivet number on fu
    ru: 4, // cog hole number where chain is arriving on rear
    cru: 48, // rivet number on ru
    clf: 28, // rivets on front
    clr: 8 // rivets on rear
};

let cfu = state.cfu;
let cru = state.cru;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initInteractive();
    draw();
    setInterval(() => {
        /*
        state.af = state.af + 0.001;
        cfu = cfu + state.f * 0.001 / (2 * Math.PI);
        state.cfu = Math.round(cfu);
        state.fu = Math.round(14 + state.f * state.af / (2 * Math.PI));

        const dar = 0.001 * (state.f / state.r);
        state.ar = state.ar + dar;
        cru = cru + state.r * dar / (2 * Math.PI);
        state.cru = Math.round(cru);
        state.ru = Math.round(4 + state.r * state.ar / (2 * Math.PI));
        */
    }, 10);
}