
var state = {
    f: 50, // teeth front
    r: 15, // teeth rear
    cs: 410, // chainstay (mm)
    cl: 50, // chain length (mm -> cl * 2.54)
    af: 0, // angle front
    ar: 0, // angle rear
    fu: 18, // cog hole number where chain is leaving front
    cfu: 18, // rivet number on fu
    ru: 4, // cog hole number where chain is arriving on rear
    cru: 48, // rivet number on ru
    clf: 36, // rivets on front
    clr: 8 // rivets on rear
};

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initInteractive();
    draw();
    setInterval(() => {
        // state.af = state.af + 0.001;
        // state.ar = state.ar + 0.001 * (state.f / state.r);
    }, 10);
}