/*
    Handles the non-Chart.js-related z-score calculator input processes.
*/

//Gets the ideal weight and height
function getIdeal(blocking, age){
    //Get the ideal height
    let h4aDataset = h4aData.find(e => e[0] === `h4a-${blocking}`);
    let i = h4aDataset[1][0].findIndex(e => +`${e}` === age);
    let lh = h4aDataset[1][1][1].data[i];
    let h = `${Math.round((lh * 100).toPrecision(10)) / 100}cm and above`;
    
    //Get the ideal weight
    let lw, uw;
    if(age < 121){
        let w4aDataset = w4aData.find(e => e[0] === `w4a-${blocking}`);
        lw = w4aDataset[1][1][1].data[i];
        uw = w4aDataset[1][1][4].data[i];
    }
    else {
        let bmi4aDataset = bmi4aData.find(e => e[0] === `bmi4a-${blocking}`);
        lw = bmi4aDataset[1][1][1].data[i] * ((lh / 100) ** 2);
        uw = bmi4aDataset[1][1][4].data[i] * ((lh / 100) ** 2);
    }
    let w = `${Math.round((lw * 100).toPrecision(10)) / 100}kg - ${Math.round((uw * 100).toPrecision(10)) / 100}kg`;

    return [w, h];
}

//Actually calculates z-scores
function zCalc(zsData, bmy, xIndex){
    let [bc, median, coeff_var] = zsData[1][2].map(e => e[xIndex]);
    let z = (((bmy / median) ** bc) - 1) / (bc * coeff_var);
    
    if(-3 <= z && z <= 3) return z;
    else {
        //Modified z-score formula for z-scores less than -3 and greater than +3 
        let z2 = zsData[1][1][(-3 > z) ? 1 : 5].data[xIndex], 
            z3 = zsData[1][1][(-3 > z) ? 0 : 6].data[xIndex];
        
        //Essentially the normal z-score formula except the first 3SDs are computed differently        
        return ((bmy - z3) / Math.abs(z3 - z2)) + ((-3 > z) ? -3 : 3);
    }
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
            else if(-3 <= z && z < -2){ return "Moderate Wasting/Moderate Thinness/Moderate Acute Malnutrition (MAM)"; }
            else if(-2 <= z && z <= 1){ return "Normal"; }
            else if(1 < z && z <= 2){ return "Possible Risk of Overweight"; }
            else if(2 < z && z <= 3){ return "Overweight"; }
            else if(3 < z){ return "Obesity"; }
            break;

        case "w4h":
            if(z < -3){ return "Severe Wasting/Severe Acute Malnutrition (SAM)"; }
            else if(-3 <= z && z < -2){ return "Moderate Wasting/Moderate Acute Malnutrition (MAM)"; }
            else if(-2 <= z && z <= 1){ return "Normal"; }
            else if(1 < z && z <= 2){ return "Possible Risk of Overweight"; }
            else if(2 < z && z <= 3){ return "Overweight"; }
            else if(3 < z){ return "Obesity"; }
            break;
    }
}
//Source: https://www.fantaproject.org/sites/default/files/resources/FANTA-Anthropometry-Guide-May2018.pdf?fbclid=IwAR25NpsgR2liU7bo7M8ir4PdO-hwCEPiJhWr9lHJVQBsM6Qo04Fexc1tqpI

//Processes the input
function newData(kidID, at, blocking, bmy, bmx){
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
    
    let z_score = Math.round((zCalc(zsData, bmy, xIndex) * 1000).toPrecision(10)) / 1000; //Calculate the z-score
    let nutri_status = interpretNutriStatus(at, z_score); //Interpret z-score
    
    document.getElementById(`${kidID}-${at}-zs-summary`).innerHTML = z_score;
    document.getElementById(`${kidID}-${at}-ns-summary`).innerHTML = nutri_status;
    document.getElementById(`${kidID}-${at}-zs`).innerHTML = z_score;
    document.getElementById(`${kidID}-${at}-ns`).innerHTML = nutri_status;

    //Disclaimers if the child does not have a normal nutritional status
    if(nutri_status !== "Normal"){
        let note = "Consulting a doctor is recommended.";
        if(
            (nutri_status !== undefined) 
            && (nutri_status.includes("Severe Acute Malnutrition"))
        ){
            note = "Please consult a doctor immediately.";
        }
        let disclaimer = `<br />Disclaimer: ${note}`;

        document.getElementById(`${kidID}-${at}-ns-summary`).innerHTML += disclaimer;
        document.getElementById(`${kidID}-${at}-ns`).innerHTML += disclaimer;
    }

    //New z-score chart
    let anthroData = [];
    for(let i = 0; i < zsData[1][0].length; i++){ (xIndex === i) ? anthroData.push(bmy) : anthroData.push(null); }

    let anthroDataset = new Dataset(kidID, anthroData); 
    inputChart(kidID, anthroID, anthroDataset);

    return;
}
