/*
    Handles the non-Chart.js-related z-score calculator input processes.
*/

//Gets the ideal weight and height
//To be edited
/*
function getIdeal(blocking, age){
    //Get the ideal height first
    let h4aDataset = h4aData.find(e => e[0] === `h4a-${blocking}`);
    let h4aIndex = h4aDataset[1][0].findIndex(e = +`${e}` === age);
    let [, h4a_low, , , , , h4a_high] = h4aDataset[1][1].map(z => z[h4aIndex]);
    
    //Compare if ideal height is within bounds 
    let [bioSex, ageGroup] = blocking.split("-");
    if((ageGroup === "toddler") || (ageGroup === "toddler")){
        let w4h
    }

    return [w, h]
}
*/

//Actually calculates z-scores
function zCalc(zsData, bmy, xIndex){
    let [bc, median, coeff_var] = zsData[1][2].map(e => e[xIndex]);
    return (((bmy / median) ** bc) - 1) / (bc * coeff_var);
}

//Interprets nutritional status per chart
function interpretNutriStatus(at, z){
    switch(at){
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
            if(z < -3){ return "Severe Wasting/Severe Thinness/Severe Acute Malnutrition (SAM)"; }
            else if(-3 <= z && z <-2){ return "Moderate Wasting/Moderate Thinness/Moderate Acute Malnutrition (MAM)"; }
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
//Source: https://www.fantaproject.org/sites/default/files/resources/FANTA-Anthropometry-Guide-May2018.pdf?fbclid=IwAR25NpsgR2liU7bo7M8ir4PdO-hwCEPiJhWr9lHJVQBsM6Qo04Fexc1tqpI

//Processes the input
function newData(kidName, at, blocking, bmy, bmx){
    let anthroID = `${at}-${blocking}`; //Get chart ID
    
    let zsData = searchData(at).find(e => e[0] === anthroID); //Get the right group of datasets

    //If statement for weight-for-height x-value
    if(at === "w4h"){
        let newBMX = Math.round(bmx);
        let d = bmx - newBMX;
    
        if(Math.abs(d) > 0.25){
            if(d < 0){ newBMX -= 0.5; } 
            else if(d > 0){ newBMX += 0.5; }
        }

        [bmx, newBMX] = [newBMX, bmx];
    }
    let xIndex = zsData[1][0].findIndex(e => +`${e}` === bmx); //Get the right age/height/x-value

    let z_score = Math.round((zCalc(zsData, bmy, xIndex) * 100).toPrecision(10)) / 100; //Calculate the z-score
    let nutri_status = interpretNutriStatus(at, z_score); //Interpret z-score

    document.getElementById(`${kidName}-${at}-zs-summary`).innerHTML = z_score;
    document.getElementById(`${kidName}-${at}-ns-summary`).innerHTML = nutri_status;
    document.getElementById(`${kidName}-${at}-zs`).innerHTML = z_score;
    document.getElementById(`${kidName}-${at}-ns`).innerHTML = nutri_status;

    //New z-score chart
    let anthroData = [];
    for(let i = 0; i < zsData[1][0].length; i++){ (xIndex === i) ? anthroData.push(bmy) : anthroData.push(null); }

    let anthroDataset = new Dataset("No Z-Score", anthroData); 
    inputChart(kidName, anthroID, anthroDataset);

    return;
}
