
var state = {
    f: 50,
    r: 15,
    cs: 410,
    cl: 50,
    af: 0,
    ar: 0,
    fu: 18,
    cfu: 18,
    ru: 4,
    cru: 48,
    clf: 36,
    clr: 8
};

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initInteractive();
    draw();
}