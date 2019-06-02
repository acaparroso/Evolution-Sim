/* eslint-disable no-bitwise */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-multi-assign */
/* eslint-disable func-names */
/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
/* eslint-disable quotes */
/* eslint-disable linebreak-style */
let canvas;
let canvasContext;
const mutationRate = 0.2;
const colorChangeRate = 0.003;
const colorMutationRate = 0.045;
const numGenerations = 10;
const numChanges = 300;
const numBots = 100;
const gray = [127, 127, 127];
const bots = new Array(numBots);
const genBest = new Array(0);
const botRadius = 5;
let bioIdeal;
let cultureIdeal;
let DE;
let CY;
let width;
let height;
let gen;
let chng;
const Darwin = true;
window.onload = function () {
  canvas = document.getElementById("gameCanvas");
  canvasContext = canvas.getContext("2d");
  width = canvas.getAttribute("width");
  height = canvas.getAttribute("height");
};

// eslint-disable-next-line no-unused-vars
function simulate() {
  document.getElementById("Message").innerHTML = "Simulating...";
  if (DE) {
    clearInterval(DE);
    clearInterval(CY);
    console.log('clearing');
    bots.length = 0;
  }
  bioIdeal = h2r(document.getElementById("Biological").value);
  cultureIdeal = h2r(document.getElementById("Cultural").value);
  gen = 0; chng = 0;
  // Instantiate the bots
  for (let i = 0; i < bots.length; i += 1) {
    const bot = new Bot();
    bots[i] = bot;
  }
  // These two take care of the drawing and the simulation
  // logics on separate timers for them to be independent of one another.
  DE = setInterval(drawEverything, 1000 / 60);
  CY = setInterval(cycle, 1000 / 60);
}

// Use this function to run the simulation logics. They will be independent of drawing.
// (What needs to happen in the background so the logics are not tied to framerate)
function cycle() {
  // When the changes have reached the maximum, we need to stop the simulation for a bit.

  if (chng === numChanges - 1) {
    document.getElementById("Message").innerHTML = `Generation ${gen} has finished its life, time for the fittest to have offspring!`;
    clearInterval(CY);
    gen += 1;
    chng = 0;
    // Sort the array of bots based on their fitness.
    bots.sort(compare);

    const numReplic = Math.ceil(numBots * 0.25);
    const GenReproduce = new Array(numReplic);
    // Transfer the top 25 % to another array for reproduction. Stop drawing everything.
    clearInterval(DE);
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    // We also animate the best of that generation.
    for (let i = 0; i < numReplic; i += 1) {
      GenReproduce[i] = bots[i];
      const color = bots[i].getColor();
      drawCircle((i * 20) + 15, 20, botRadius, color);
    }


    // wait for 2 seconds to show the best from that generation before reproduction
    setTimeout(() => {
      document.getElementById("Message").innerHTML = `Starting Generation ${gen} 's simulation.`;
      console.log(bots.length);
      // Reproducing
      for (let i = 0; i < numReplic; i += 1) {
        for (let j = 0; j < 4; j += 1) {
          GenReproduce[i].reproduce();
        }
      }
      // print new generation.
      for (let i = 0; i < bots.length; i += 1) {
        drawCircle((i * 20) + 15, 60, botRadius, bots[i].getColor());
      }
      setTimeout(() => {
        // wait 2 seconds and then restart the simulation
        DE = setInterval(drawEverything, 1000 / 60);
        CY = setInterval(cycle, 1000 / 60);
      }, 2000);
    }, 2000);
  } else {
    chng += 1;

    acqChng();
  }
}

// Use this function to run the refresh rate and
// the graphic logic. (What gets printed every x seconds)
function drawEverything() {
  canvasContext.fillStyle = 'white';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  // Draw bots on bot array
  for (let i = 0; i < bots.length; i += 1) {
    var color = bots[i].getColor();
    drawCircle((i * 20) + 15, 20, botRadius, color);
  }
}


// Circle with position x, y, radius r and whichever color. It has a black outline around it.
function drawCircle(x, y, r, color) {
  canvasContext.fillStyle = r2h(color);
  canvasContext.beginPath();
  canvasContext.arc(x, y, r * 2, 0, 2 * Math.PI);
  canvasContext.fill();
  canvasContext.beginPath();
  canvasContext.arc(x, y, r * 2, 0, 2 * Math.PI);
  canvasContext.stroke();
}


// This is just a class to keep track of the bots in case we add
// more functionalities to their behavior and changes later on.
class Bot {
  constructor(x = 200, y = 200, DNAcolor = false, bioInterpDNA = 0, ancestColor = false) {
    this.x = x; this.y = y; this.DNAcolor = DNAcolor;
    this.bioLerp = bioInterpDNA; this.ancestorColor = ancestColor; this.cultureLerp = 0;
    this.color = [0, 0, 0];
    if (DNAcolor === false) {
      // This is used in case the bot is created without an ancestor.
      this.color = getRandomColor();
      this.DNAcolor = this.color;
    } else {
      // This is used in case an ancestor is creating this bot.
      // Mutation needs to be taken care of
      // We are using the random color system, so we will
      // use the current color related to the target color as the lerp variables.


    }
  }

  update() {
    const percentChange = (Math.random() * colorChangeRate);
    // This lerp is done with the current color which means the distance is lowered every time.
    this.cultureLerp = Math.min(this.cultureLerp + percentChange, 1);
    this.color = interpolateHSL(this.DNAcolor, cultureIdeal, this.cultureLerp);
  }

  getFitness() {
    this.fitness = calculateBioFitness(this.color, bioIdeal);
    return this.fitness;
  }

  getCultureFitness() {
    this.fitness = calculateCulturalFitness(this.color, cultureIdeal);
    return this.fitness;
  }

  reproduce() {
    const bot = new Bot(this.x, this.y, this.DNAcolor, this.bioInterpFitness, this.ancestColor);
    bots.push(bot);
  }

  getColor() {
    return this.color;
  }
}

// Take the target color and it's
// relative positioning to the current colour to determine a fitness value
function calculateBioFitness(c1, c2) {
  return Math.abs(eDistance(c1, c2));
}

// Take the target color and it's relative positioning to the current
// colour to determine a fitness value
function calculateCulturalFitness(c1, c2) {
  return Math.abs(eDistance(c1, c2));
}

// Returns a random color in an RGB array Credit : Paolo Forgia Stack Overflow.
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return h2r(color);
}

// Function returns the Euclidean distance between two colors (Given their RGB values as an array).
function eDistance(p1, p2) {
  let d = 0;
  for (let i = 0; i < p1.length; i += 1) {
    d += (p1[i] - p2[i]) * (p1[i] - p2[i]);
  }
  return Math.sqrt(d);
}

// Used to sort the bots array.
function compare(a, b) {
  const fitA = a.getFitness();
  const fitB = b.getFitness();

  let comparison = 0;

  if (fitA > fitB) {
    comparison = 1;
  } else if (fitA < fitB) {
    comparison = -1;
  }

  return comparison * -1;
}

function acqChng() {
  for (let i = 0; i < bots.length; i += 1) {
    bots[i].update();
  }
}
// Used to parse a #ffffff hex string into an [r,g,b] array
var h2r = function (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
};

// Parse an [rgb] array to a #ffffff string
var r2h = function (rgb) {
  return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`;
};

// Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
// Taken from the awesome ROT.js roguelike dev library at
// https://github.com/ondras/rot.js
// The functions related to the color are taken from https://codepen.io/njmcode/pen/axoyD/

// eslint-disable-next-line no-unused-vars
const interpolateColor = function (color1, color2, factor) {
  // eslint-disable-next-line no-param-reassign
  if (arguments.length < 3) { factor = 0.5; }
  const result = color1.slice();
  for (let i = 0; i < 3; i += 1) {
    result[i] += factor * (color2[i] - color1[i]);
  }
  return result;
};
// function to convert from rgb to hsl
const rgb2hsl = function (color) {
  const r = color[0] / 255;
  const g = color[1] / 255;
  const b = color[2] / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
    // eslint-disable-next-line default-case
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
};

// function to convert from hsl to rgb
const hsl2rgb = function (color) {
  let l = color[2];

  if (color[1] === 0) {
    l = Math.round(l * 255);
    return [l, l, l];
  }
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  const s = color[1];
  const q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
  const p = 2 * l - q;
  const r = hue2rgb(p, q, color[0] + 1 / 3);
  const g = hue2rgb(p, q, color[0]);
  const b = hue2rgb(p, q, color[0] - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

var interpolateHSL = function (color1, color2, factor) {
  if (arguments.length < 3) { factor = 0.5; }
  const hsl1 = rgb2hsl(color1);
  const hsl2 = rgb2hsl(color2);
  for (let i = 0; i < 3; i += 1) {
    hsl1[i] += factor * (hsl2[i] - hsl1[i]);
  }
  return hsl2rgb(hsl1);
};
