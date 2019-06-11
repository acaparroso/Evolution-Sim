//Class that is in charge of the logics and keeping the simulations separate.
//Parameters:
//version               Keeps track of which canvas is used.
//canvasContext         Keeps track of where the drawing happens
//width                 Width of canvas
//height                Height of canvas
//bioIdeal              The color that is selected as the ideal in a biological sense
//cultureIdeal          The color that is selected as the ideal in a cultural sense
//Darwin                Whether or not we are using Darwin's model where DNA is used to reproduce
//towardBio             Whether sims are selected to reproduce based on their culture or biological ideal.
//mutationRate          % chance to mutate on reproduction
//colorMutationRate     % of how much a sim can change each mutation
//colorChangeRate       % of how much a sim can change every Acquired Change
//numChanges            How many changes does the sim go through in their life.
//DE                    Draw Everything Interval variable
//CY                    Cycle Interval variable
class Simulation {
    //This class will be used as a js class to encapsulate the 
    //simulation characteristics in order to be able to run two simulations
    //next to each other which do fundamentally different things.
    constructor(version = "1") {
        this.version = version; //This will be used to keep track of which canvas is being used, left or right
        this.canvasContext = $("#gameCanvas" + this.version).getContext("2D");
        this.width = canvas.getAttribute("width");
        this.height = canvas.getAttribute("height");
        //This is a helper method to get the parameters of the sim with this specific version.
        fetchSimValues();
    }

    fetchSimValues() {
        this.bioIdeal = h2r(document.getElementById("Biological" + this.version).value);
        this.cultureIdeal = h2r(document.getElementById("Cultural" + this.version).value);
        var radioValue = $("input[name='model"+this.version+"']:checked").val();
        if (radioValue === 'darwin') {
            this.Darwin = true;
        } else {
            this.Darwin = false;
        }
        radioValue = $("input[name='toward"+this.version+"']:checked").val();
        if (radioValue === 'bio') {
            this.towardBio = true;
        } else {
            this.towardBio = false;
        }
        this.mutationRate = $("#mutationRate" + this.version).val() / 100;
        this.colorMutationRate = $("#colorMutRate" + this.version).val() / 100;
        this.colorChangeRate = $("#colorChangeRate" + this.version).val() / 100;
        this.numChanges = $("#numChanges" + this.version).val() / 10 * 10;

    }

    simulate() {
        document.getElementById("Message" + version).innerHTML = "Simulating...";
        document.getElementById("runSim" + version).classList = "button";
        if (this.DE) {
            clearInterval(this.DE);
            clearInterval(this.CY);
            console.log('clearing');
            this.bots.length = 0;
        }
        fetchSimValues(this.version);
        this.gen = 0; this.chng = 0;
        // Instantiate the bots
        for (let i = 0; i < this.numBots; i += 1) {
            const bot = new Bot();
            this.bots[i] = bot;
        }
        // These two take care of the drawing and the
        // simulation logics on separate timers for them to be independent of one another.
        this.DE = setInterval(this.drawEverything, 1000 / 60);
        this.CY = setInterval(this.cycle, 1000 / 60);
    }

    cycle() {

    }
}