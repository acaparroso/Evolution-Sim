$(document).ready(function(){
    //Document is ready, now we create the two sims to be used.
    let left = new Simulation("1");
    let right = new Simulation("2");
    var leftRun = false;
    var rightRun = false;
    //Setup listeners for the buttons on the screen
    $("#runSim1").on("click", function() {
        if(!leftRun){
            $(this).addClass("lowlightedButton");
            $(this).removeClass("highlightButton");
            left.simulate();
        }
    });
});