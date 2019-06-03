/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
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
const numBots = 4;
const gray = [127, 127, 127];
let bots = new Array(numBots);
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
  document.getElementById("runSim").classList = "button";
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
  for (let i = 0; i < numBots; i += 1) {
    const bot = new Bot();
    bots[i] = bot;
  }
  // These two take care of the drawing and the
  // simulation logics on separate timers for them to be independent of one another.
  DE = setInterval(drawEverything, 1000 / 60);
  CY = setInterval(cycle, 1000 / 60);
}

// Use this function to run the simulation logics. They will be independent of drawing.
// (What needs to happen in the background so the logics are not tied to framerate)
function cycle() {
  // When the changes have reached the maximum, we need to stop the simulation for a bit.

  if (chng === numChanges - 1) {
    console.log(`bots length: ${bots.length}`);
    document.getElementById("Message").innerHTML = `Generation ${gen} has finished its life, time for the fittest to have offspring!`;
    clearInterval(CY);
    gen += 1;
    chng = 0;
    // Sort the array of bots based on their fitness.
    bots.sort(compare);
    console.log(`bots length: ${bots.length}`);
    var numReplic = Math.ceil(numBots * 0.25);
    var GenReproduce = new Array(numReplic);
    // Transfer the top 25 % to another array for reproduction. Stop drawing everything.
    clearInterval(DE);
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    // We also animate the best of that generation.
    for (let i = 0; i < numReplic; i += 1) {
      GenReproduce[i] = bots[i];
      var color = bots[i].getColor();
      drawCircle((i * 20) + 15, 20, botRadius, color);
    }

    console.log(GenReproduce);
    // wait for 2 seconds to show the best from that generation before reproduction
    setTimeout(() => {
      console.log("Starting next sim");
      document.getElementById("Message").innerHTML = `Starting Generation ${gen} 's simulation.`;
      // Reproducing
      var newGen = new Array(numBots);
      var k = 0;
      for (let i = 0; i < numReplic; i += 1) {
        for (let j = 0; j < 4; j += 1) {
          newGen[k] = GenReproduce[i].reproduce();
          k += 1;
        }
      }
      // print new generation.
      bots.length = 0;
      console.log(newGen);
      bots = newGen;
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

// eslint-disable-next-line no-unused-vars
function pauseSim() {
  clearInterval(CY);
  document.getElementById("nextGen").classList = "highlightButton";
  document.getElementById("Message").innerHTML = "Paused";
}

// eslint-disable-next-line no-unused-vars
function resumeSim() {
  CY = setInterval(cycle, 1000 / 60);
  document.getElementById("nextGen").classList = "lowlightedButton";
  document.getElementById("Message").innerHTML = "Simulating...";
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
  canvasContext.fillStyle = `rgb(${color[0]},${color[1]},${color[2]}`;
  canvasContext.beginPath();
  canvasContext.arc(x, y, r * 2, 0, 2 * Math.PI);
  canvasContext.fill();
  canvasContext.beginPath();
  canvasContext.arc(x, y, r * 2, 0, 2 * Math.PI);
  canvasContext.stroke();
}


// This is just a class to keep track of the bots in case we
// add more functionalities to their behavior and changes later on.
class Bot {
  // This is used in case an ancestor is creating this bot.
  // Mutation needs to be taken care of
  // We are using the random color system, so we will
  // use the current color related to the target color as the lerp variables.

  constructor(x = 200, y = 200, DNAcolor = false, color = getRandomColor()) {
    this.x = x; this.y = y; this.DNAcolor = DNAcolor;
    if (DNAcolor === false) {
      // This is used in case the bot is created without an ancestor.
      this.color = color;
      this.DNAcolor = this.color;
      // Is it going to mutate?
    } else if (Math.random() <= mutationRate) {
      // This is used in case an ancestor is creating this bot.
      // Mutation needs to be taken care of
      // We are using the random color system,
      // so we will use the current color related to the target color as the lerp variables.
      var amountChange = Math.random() * colorMutationRate;
      // lerp with the current color as well, distance is lowered every time as well.
      this.bioLerp = Math.min(amountChange, 1);
      if (Darwin) {
        // Interpolate between the DNA of the ancestor and bioIdeal
        this.color = interpolateRGB(this.DNAcolor, bioIdeal, this.bioLerp);
        this.DNAcolor = this.color;
      } else {
        // Interpolate between the color at death of the ancestor and bioIdeal
        this.color = interpolateRGB(this.color, bioIdeal, this.bioLerp);
        this.DNAcolor = this.color;
      }
    }
  }

  update() {
    var percentChange = (Math.random() * colorChangeRate);
    // This lerp is done with the current color which means the distance is lowered every time.
    this.cultureLerp = Math.min(percentChange, 1);
    this.color = interpolateRGB(this.color, cultureIdeal, this.cultureLerp);
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
    const bot = new Bot(this.x, this.y, this.DNAcolor, this.color);
    return bot;
  }

  getColor() {
    return this.color;
  }
}

// Take the target color and it's relative positioning
// to the current colour to determine a fitness value
function calculateBioFitness(c1, c2) {
  return Math.abs(eDistance(c1, c2));
}

// Take the target color and it's relative positioning
// to the current colour to determine a fitness value
function calculateCulturalFitness(c1, c2) {
  return Math.abs(eDistance(c1, c2));
}

// Returns a random color in an RGB array Credit : Paolo Forgia Stack Overflow.
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return h2r(color);
}

// Function returns the Euclidean distance between two colors (Given their RGB values as an array).
function eDistance(p1, p2) {
  var d = 0;
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
    if (i === 0) { console.log(bots[0].color); }
    bots[i].update();
  }
}
// Used to parse a #ffffff hex string into an [r,g,b] array
var h2r = function (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
};

// Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
// Taken from the awesome ROT.js roguelike dev library at
// https://github.com/ondras/rot.js
// The functions related to the color are taken from https://codepen.io/njmcode/pen/axoyD/

// eslint-disable-next-line no-unused-vars
// function to convert from rgb to hsl
var rgb2hsl = function (color) {
  var r = color[0] / 255;
  var g = color[1] / 255;
  var b = color[2] / 255;

  var max = Math.max(r, g, b); var
    min = Math.min(r, g, b);
  var h; var s; var
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
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
var hsl2rgb = function (color) {
  var l = color[2];

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

  var s = color[1];
  var q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
  var p = 2 * l - q;
  var r = hue2rgb(p, q, color[0] + 1 / 3);
  var g = hue2rgb(p, q, color[0]);
  var b = hue2rgb(p, q, color[0] - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// eslint-disable-next-line no-unused-vars
function interpolateRGB(rgb1, rgb2, t) {
  var r_1 = rgb1[0];
  var g_1 = rgb1[1];
  var b_1 = rgb1[2];
  var a_1 = rgb1[3];

  var r_2 = rgb2[0];
  var g_2 = rgb2[1];
  var b_2 = rgb2[2];
  var a_2 = rgb2[3];

  var interpolate = function (t) {
    var r_3 = r_1 + t * (r_2 - r_1);
    var g_3 = g_1 + t * (g_2 - g_1);
    var b_3 = b_1 + t * (b_2 - b_1);
    var result = [r_3, g_3, b_3];

    if (rgb1.length === 4 && rgb2.length === 4) {
      var a_3 = a_1 + t * (a_2 - a_1);
      result.push(a_3);
    }

    return result;
  };

  if (arguments.length === 2) {
    return interpolate;
  }
  return interpolate(t);
}
