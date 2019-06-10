class Simulation {
    //This class will be used as a js class to encapsulate the 
    //simulation characteristics in order to be able to run two simulations
    //next to each other which do fundamentally different things.
    constructor(version = "") {
        this.version = version; //This will be used to keep track of which canvas is being used, left or right
        this.canvasContext = $("#gameCanvas" + this.version).getContext("2D");
        this.width = canvas.getAttribute("width");
        this.height = canvas.getAttribute("height");

        fetchSimValues();
    }

    fetchSimValues() {
        this.bioIdeal = h2r(document.getElementById("Biological" + this.version).value);
        this.cultureIdeal = h2r(document.getElementById("Cultural" + this.version).value);
        var radioValue = $("input[name='model']:checked").val();
        if (radioValue === 'darwin') {
            this.Darwin = true;
        } else {
            this.Darwin = false;
        }
        radioValue = $("input[name='toward']:checked").val();
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