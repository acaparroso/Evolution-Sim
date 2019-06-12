/* eslint-disable prefer-destructuring */

// eslint-disable-next-line func-names
window.onload = function () {
  // Document is ready, now we create the two sims to be used.
  // eslint-disable-next-line no-use-before-define
  const leftSim = new Simulation('1');
  // eslint-disable-next-line no-use-before-define
  const rightSim = new Simulation('2');
  var leftRun = false;
  var rightRun = false;


  // Setup listeners for the buttons on the screen
  $('#runSim1').on('click', () => {
    if (!leftRun) {
      $(this).addClass('lowlightedButton');
      $(this).removeClass('highlightButton');
      leftSim.simulate();
      leftRun = true;
    }
  });

  $('#runSim2').on('click', () => {
    if (!rightRun) {
      $(this).addClass('lowlightedButton');
      $(this).removeClass('highlightButton');
      rightSim.simulate();
      rightRun = true;
    }
  });

  $('#nextGen1').on('click', () => {
    if (leftRun) {
      $(this).addClass('lowlightedButton');
      $(this).removeClass('highlightButton');
    }
  });

  $('#nextGen2').on('click', () => {
    if (leftRun) {
      $(this).addClass('lowlightedButton');
      $(this).removeClass('highlightButton');
    }
  });
};


// Class that is in charge of the logics and keeping the simulations separate.
// Parameters:
// version               Keeps track of which canvas is used.
// canvasContext         Keeps track of where the drawing happens
// width                 Width of canvas
// height                Height of canvas
// bioIdeal              The color that is selected as the ideal in a biological sense
// cultureIdeal          The color that is selected as the ideal in a cultural sense
// Darwin                Whether or not we are using Darwin's model where DNA is used to reproduce
// towardBio             Whether sims are selected to reproduce
//                          based on their culture or biological ideal.
// mutationRate          % chance to mutate on reproduction
// colorMutationRate     % of how much a sim can change each mutation
// colorChangeRate       % of how much a sim can change every Acquired Change
// numChanges            How many changes does the sim go through in their life.
// DE                    Draw Everything Interval variable
// CY                    Cycle Interval variable
class Simulation {
  // This class will be used as a js class to encapsulate the
  // simulation characteristics in order to be able to run two simulations
  // next to each other which do fundamentally different things.
  constructor(version = '1', botRadius = 5) {
    // This will be used to keep track of which canvas is being used, left or right
    // Canvas and canvas context get sent after loading to fix null canvas context.
    this.version = version;
    this.canvas = document.getElementById(`gameCanvas${version}`);
    this.canvasContext = this.canvas.getContext('2d');
    this.width = this.canvas.getAttribute('width');
    this.height = this.canvas.getAttribute('height');
    // This is a helper method to get the parameters of the sim with this specific version.
    this.fetchSimValues();
    this.bots = new Array(this.numBots);
    this.numBots = 100;
    this.botRadius = botRadius;
  }

  fetchSimValues() {
    this.bioIdeal = h2r(document.getElementById(`Biological${this.version}`).value);
    this.cultureIdeal = h2r(document.getElementById(`Cultural${this.version}`).value);
    var radioValue = $(`input[name='model${this.version}']:checked`).val();
    if (radioValue === 'darwin') {
      this.Darwin = true;
    } else {
      this.Darwin = false;
    }
    radioValue = $(`input[name='toward${this.version}']:checked`).val();
    if (radioValue === 'bio') {
      this.towardBio = true;
    } else {
      this.towardBio = false;
    }
    this.mutationRate = $(`#mutationRate${this.version}`).val() / 100;
    this.colorMutationRate = $(`#colorMutRate${this.version}`).val() / 100;
    this.colorChangeRate = $(`#colorChangeRate${this.version}`).val() / 100;
    this.numChanges = $(`#numChanges${this.version}`).val() / 10 * 10;
  }

  simulate() {
    document.getElementById(`Message${this.version}`).innerHTML = 'Simulating...';
    document.getElementById(`runSim${this.version}`).classList = 'button';
    if (this.DE) {
      clearInterval(this.DE);
      clearInterval(this.CY);
      console.log('clearing');
      this.bots.length = 0;
    }
    this.fetchSimValues(this.version);
    this.gen = 0; this.chng = 0;
    // Instantiate the bots
    for (let i = 0; i < this.numBots; i += 1) {
      const bot = new Bot();
      this.bots[i] = bot;
    }
    console.log(`${this.canvas} and ${this.canvasContext}`);
    // These two take care of the drawing and the
    // simulation logics on separate timers for them to be independent of one another.
    this.DE = setInterval(this.drawEverything(), 1000 / 60);
    this.CY = setInterval(this.cycle(), 1000 / 60);
  }

  cycle() {
    if (this.chng === this.numChanges - 1) {
      // console.log(`bots length: ${bots.length}`);
      document.getElementById(`Message${this.version}`).innerHTML = `Generation ${gen} has finished its life, time for the fittest to have offspring!`;
      clearInterval(this.CY);
      this.gen += 1;
      this.chng = 0;
      // Sort the array of bots based on their fitness.
      // Check before sorting to determine which side is chosen
      if (this.towardBio) {
        this.bots.sort((a, b) => {
          const fitA = a.getFitness();
          const fitB = b.getFitness();

          let comparison = 0;

          if (fitA > fitB) {
            comparison = 1;
          } else if (fitA < fitB) {
            comparison = -1;
          }
          return comparison;
        });
      } else {
        this.bots.sort((a, b) => {
          const fitA = a.getCulturalFitness();
          const fitB = b.getCulturalFitness();

          let comparison = 0;

          if (fitA > fitB) {
            comparison = 1;
          } else if (fitA < fitB) {
            comparison = -1;
          }

          return comparison;
        });
      }

      // console.log(`bots length: ${bots.length}`);
      var numReplic = Math.ceil(this.numBots * 0.25);
      var GenReproduce = new Array(numReplic);
      // Transfer the top 25 % to another array for reproduction. Stop drawing everything.
      clearInterval(this.DE);
      this.canvasContext.fillStyle = 'white';
      this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // We also animate the best of that generation.
      for (let i = 0; i < numReplic; i += 1) {
        GenReproduce[i] = this.bots[i];
        var color = this.bots[i].getColor();
        this.drawCircle((i * 20) + 15, 20, this.botRadius, color);
      }

      console.log(GenReproduce);
      // wait for 2 seconds to show the best from that generation before reproduction
      setTimeout(() => {
        console.log('Starting next sim');
        document.getElementById(`Message${this.version}`).innerHTML = 'And those are Their offspring below them! <br>Press next generation to continue...';
        document.getElementById(`nextGen${this.version}`).classList = 'highlightButton';
        // Reproducing
        var newGen = new Array(this.numBots);
        var k = 0;
        for (let i = 0; i < numReplic; i += 1) {
          for (let j = 0; j < 4; j += 1) {
            newGen[k] = GenReproduce[i].reproduce();
            k += 1;
          }
        }
        // print new generation.
        this.bots.length = 0;
        // console.log(newGen);
        this.bots = newGen;
        for (let i = 0; i < this.bots.length; i += 1) {
          this.drawCircle((i * 20) + 15, 60, this.botRadius, this.bots[i].getColor());
        }
      }, 4000);

      document.getElementById(`Message${this.version}`).innerHTML = `Generation ${this.gen} Has finished its life! These are selected to reproduce in the next generation!`;
    } else {
      document.getElementById(`Message${this.version}`).innerHTML = 'Simulating...';
      this.chng += 1;
      this.acqChng();
    }
  }

  acqChng() {
    for (let i = 0; i < this.bots.length; i += 1) {
      this.bots[i].update();
    }
  }

  drawCircle(x, y, r, color) {
    this.canvasContext.fillStyle = `rgb(${color[0]},${color[1]},${color[2]}`;
    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, r * 2, 0, 2 * Math.PI);
    this.canvasContext.fill();
    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, r * 2, 0, 2 * Math.PI);
    this.canvasContext.stroke();
  }

  // Use this function to run the refresh rate and
  // the graphic logic. (What gets printed every x seconds)
  drawEverything() {
    this.canvasContext.fillStyle = 'white';
    this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw bots on bot array
    for (let i = 0; i < this.bots.length; i += 1) {
      var color = this.bots[i].getColor();
      this.drawCircle((i * 20) + 15, 20, this.botRadius, color);
    }
  }
}

// This is just a class to keep track of the bots in case we
// add more functionalities to their behavior and changes later on.
class Bot {
  // This is used in case an ancestor is creating this bot.
  // Mutation needs to be taken care of
  // We are using the random color system, so we will
  // use the current color related to the target color as the lerp variables.

  constructor(x = 200, y = 200, DNAcolor = false,
    color = getRandomColor(), mutationRate = 0.2,
    colorMutationRate = 0.004, Darwin = true, bioIdeal) {
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
      console.log('Mutated!');
      var amountChange = Math.random() * colorMutationRate;
      // lerp with the current color as well, distance is lowered every time as well.
      this.bioLerp = Math.min(amountChange, 1);
      if (Darwin) {
        // Interpolate between the DNA of the ancestor and bioIdeal
        this.color = interpolateRGB(this.DNAcolor, bioIdeal, this.bioLerp);
        this.DNAcolor = this.color;
      } else {
        // Interpolate between the color at death of the ancestor and bioIdeal
        this.color = color;
        this.color = interpolateRGB(this.color, bioIdeal, this.bioLerp);
        this.DNAcolor = this.color;
      }
    } else {
      this.color = this.DNAcolor;
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
  if (!towardBio) {
    comparison *= -1;
  }
  return comparison;
}
