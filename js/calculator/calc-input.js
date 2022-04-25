/*
    Handles the non-Chart.js-related z-score calculator input processes.
*/

//Actually calculates z-scores
function zCalc(zsData, bmy, xIndex){
    let [bc, median, coeff_var] = zsData[1][2].map(e => e[xIndex]);
    return (((bmy / median) ** bc) - 1) / (bc * coeff_var);
}

//Interprets nutritional status per chart
function interpretNutriStatus(anthroType, z){
    switch(anthroType){
        case "w4a":
            if(z < -3){ return "Severe Underweight"; }
            else if(-3 <= z && z < -2){ return "Moderate Underweight"; }
            else if(-2 <= z && z <= 1){ return "Normal"; }
            else if(1 < z){ return "Use BMI-for-age"; }
            break;

        case "h4a":
            if(z < -3){ return "Severe Stunting"; }
            else if(-3 <= z && z < -2){ return "Moderate Stunting"; }
            else if(-2 <= z && z <= 3){ return "Normal"; }
            else if(3 < z){ return "Normal (not a nutrition issue but might be a sign of an endocrine disorder)"; }
            break;

        case "bmi4a":
            if(z < -3){ return "Severe Wasting/Severe Acute Malnutrition (SAM)"; }
            else if(-3 <= z && z <-2){ return "Moderate Wasting/Moderate Acute Malnutrition (MAM)"; }
            else if(-2 <= z && z <= 1){ return "Normal"; }
            else if(1 < z && z <= 2){ return "Possible Risk of Overweight"; }
            else if(2 < z && z <= 3){ return "Overweight"; }
            else if(3 < z){ return "Obesity"; }
            break;

        case "w4h":
            if(z < -3){ return "Severe Wasting/Severe Acute Malnutrition (SAM)"; }
            else if(-3 <= z && z <-2){ return "Moderate Wasting/Moderate Acute Malnutrition (MAM)"; }
            else if(-2 <= z && z <= 1){ return "Normal"; }
            else if(1 < z && z <= 2){ return "Possible Risk of Overweight"; }
            else if(2 < z && z <= 3){ return "Overweight"; }
            else if(3 < z){ return "Obesity"; }
            break;
    }
}

//Processes the input
function newData(kidName, anthroType, blocking, bmy, bmx){
    let anthroID = `${anthroType}-${blocking}`; //Get chart ID
    
    let zsData = searchData(anthroType).find(e => e[0] === anthroID); //Get the right group of datasets

    //If statement for weight-for-height x-value
    if(anthroType === "w4h"){
        let newBMX = Math.round(bmx);
        let d = bmx - newBMX;
    
        if(Math.abs(d) > 0.25){
            if(d < 0){ newBMX -= 0.5; } 
            else if(d > 0){ newBMX += 0.5; }
        }

        [bmx, newBMX] = [newBMX, bmx];
    }
    let xIndex = zsData[1][0].findIndex(e => +`${e}` === bmx); //Get the right age/height/x-value

    let z_score = zCalc(zsData, bmy, xIndex); //Calculate the z-score
    
    
    document.getElementById(`${kidName}-${anthroType}-status`).innerHTML = `${z_score}; ${interpretNutriStatus(anthroType, z_score)}`; //Interpret z-score

    //New z-score chart
    let anthroData = [];
    for(let i = 0; i < zsData[1][0].length; i++){ (xIndex === i) ? anthroData.push(bmy) : anthroData.push(null); }

    let anthroDataset = new Dataset("No Z-Score", anthroData); 
    inputChart(kidName, anthroID, anthroDataset);

    return;
}
