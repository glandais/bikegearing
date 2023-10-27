let Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Constraint = Matter.Constraint,
  Body = Matter.Body,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint,
  Events = Matter.Events;

let engine;
let render;
let runner;

const linkLength = 25.4;
//const linkLength = 100;
const halfLinkLength = linkLength / 2;
const linkHeight = 10;

function getChainLength(chainring, cog, chainstay) {
  const rchainring = (halfLinkLength * chainring) / (2 * Math.PI);
  const rcog = (halfLinkLength * cog) / (2 * Math.PI);

  const alpha = Math.asin((rchainring - rcog) / chainstay);
  const aroundCog =
    2 * Math.PI * rcog * ((Math.PI - 2 * alpha) / (2 * Math.PI));
  const aroundChainring =
    2 * Math.PI * rchainring * ((Math.PI + 2 * alpha) / (2 * Math.PI));
  const betweenCogChainring = chainstay * Math.cos(alpha);
  const chainLength = aroundCog + aroundChainring + betweenCogChainring * 2;

  return chainLength / linkLength;
}

function createDisk(x, r) {
  const disk = Bodies.circle(x, 200, r, {
    render: {
      fillStyle: "#dd4444",
      strokeStyle: "#222222",
      lineWidth: 3,
    },
  });
  //   disk.friction = 1.0;
  disk.density = 10.0;
  World.add(engine.world, disk);

  setInterval(() => {
    //console.log(disk.angularVelocity);
  }, 1000);

  const anchor = Constraint.create({
    pointA: { x: 0, y: 0 },
    bodyA: disk,
    pointB: { x: x, y: 200 },
    length: 0,
  });
  World.add(engine.world, anchor);

  return disk;
}

function createHalfLink(color) {
  const halfLink = Bodies.rectangle(0, 0, halfLinkLength, linkHeight, {
    render: {
      fillStyle: color,
      strokeStyle: "#222222",
      lineWidth: 3,
    },
  });
  World.add(engine.world, halfLink);
  return halfLink;
}

function createJoint(r1, r2) {
  const joint = Constraint.create({
    pointA: { x: halfLinkLength / 2, y: linkHeight / 2 },
    bodyA: r1,
    pointB: { x: -halfLinkLength / 2, y: linkHeight / 2 },
    bodyB: r2,
    length: 0,
    siffness: 1.1,
  });
  World.add(engine.world, joint);
}

function createWorld(chainring, cog, chainstay) {
  const rChainring = (halfLinkLength * chainring) / (2 * Math.PI);
  const rCog = (halfLinkLength * cog) / (2 * Math.PI);
  console.log("rChainring : " + rChainring);
  console.log("rCog : " + rCog);
  createDisk(200, rCog);
  const disk = createDisk(200 + chainstay, rChainring);

  const chainLinksDouble = getChainLength(chainring, cog, chainstay);
  const chainLinks = Math.ceil(chainLinksDouble);
  console.log(chainring + "x" + cog + " cs:" + chainstay + " cl:" + chainLinks);

  let links = [];
  for (let index = 0; index < chainLinks; index++) {
    const hl1 = createHalfLink("#4444dd");
    links.push(hl1);
    const hl2 = createHalfLink("#44dd44");
    links.push(hl2);
  }

  for (let index = 0; index < links.length; index++) {
    if (index == links.length - 1) {
        createJoint(links[index], links[0]);
        createJoint(links[index], links[0]);
        createJoint(links[index], links[0]);
    } else {
        createJoint(links[index], links[index + 1]);
        createJoint(links[index], links[index + 1]);
        createJoint(links[index], links[index + 1]);
    }
  }

  let c = 0;
  const alpha = Math.asin((rChainring - rCog) / chainstay);
  for (let index = 0; index < links.length; index++) {
    const link = links[index];

    let x = 0;
    let y = 0;
    let r = 0;
    const betweenCogChainring = chainstay * Math.cos(alpha);
    const aroundChainring =
      2 * Math.PI * rChainring * ((Math.PI + 2 * alpha) / (2 * Math.PI));
    if (c < betweenCogChainring) {
      x = 200 + c * Math.cos(alpha);
      y = 200 - rCog - c * Math.sin(alpha);
      r = -alpha;
    } else if (c < betweenCogChainring + aroundChainring) {
      const angleChainring =
        alpha - (c - betweenCogChainring) / rChainring + Math.PI / 2;
      x = 200 + chainstay + rChainring * Math.cos(angleChainring);
      y = 200 - rChainring * Math.sin(angleChainring);
      r = -angleChainring + Math.PI / 2;
    } else if (c < 2 * betweenCogChainring + aroundChainring) {
      const d = 2 * betweenCogChainring + aroundChainring - c;
      x = 200 + d * Math.cos(alpha);
      y = 200 + rCog + d * Math.sin(alpha);
      r = alpha + Math.PI;
    } else {
      const d = c - 2 * betweenCogChainring - aroundChainring;
      const angleCog = Math.PI / 2 - (d / rCog + alpha);
      x = 200 - rCog * Math.cos(angleCog);
      y = 200 + rCog * Math.sin(angleCog);
      r = -angleCog - Math.PI / 2;
    }
    Body.rotate(link, r);
    Body.translate(link, { x: x, y: y });
    c = c + halfLinkLength;
  }

  setInterval(() => {
    Body.setAngularVelocity(disk, 0.02);
  }, 1);
}

function init() {
  engine = Engine.create({
    constraintIterations: 100,
    positionIterations: 100,
    velocityIterations: 100
  });

  render = Render.create({
    element: document.getElementById("areaToRender"),
    engine: engine,
    options: {
      background: "#fafafa",
      wireframes: false,
    },
  });

  //engine.world.gravity.y = 0.01;
  //engine.timing.timeScale = 0.01;

  createWorld(50, 15, 410);
//  createWorld(50, 50, 254);

  // run the renderer
  Render.run(render);

  // create runner
  runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);
  runner.enabled = false;
  //Runner.stop(runner);
}

function pause() {
  runner.enabled = false;
}

function unpause() {
  runner.enabled = true;
}
