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
        let new_z = ((bmy - z3) / Math.abs(z3 - z2)) + ((-3 > z) ? -3 : 3);       
        return (new_z == NaN) ? "Not computable" : new_z;
    }
}

//Interprets nutritional status per chart
function interpretNutriStatus(at, z){
    switch(at){
        case "w4a":
            if(z < -3){ return ["Severe Underweight", "Masyadong mababa ang timbang ng bata!", "danger"]; }
            else if(-3 <= z && z < -2){ return ["Moderate Underweight", "Mag-ingat. Mababa ang timbang ng bata.", "warning"]; }
            else if(-2 <= z && z <= 1){ return ["Normal", "Tama lang ang timbang ng bata.", "success"]; }
            else if(1 < z){ return ["Gamitin ang BMI-for-age/Weight-for-Height", "", "warning"]; }
            break;

        case "h4a":
            if(z < -3){ return ["Severe Stunting", "Masyadong mababa ang tangkad ng bata!", "danger"]; }
            else if(-3 <= z && z < -2){ return ["Moderate Stunting", "Mag-ingat. Mababa ang tangkad ng bata.", "warning"]; }
            else if(-2 <= z && z <= 3){ return ["Normal", "Tama lang ang tangkad ng bata.", "success"]; }
            else if(3 < z){ return ["Normal", "Malamang hindi ito problema sa nutrisyon. Maaaring tingnan kung may <i>endocrine disorder</i>.", "success"]; }
            break;

        case "bmi4a":
            if(z < -3){ return ["Severe Thinness/Severe Acute Malnutrition (SAM)", "<b>Malala ang kondisyon ng bata</b>. Kailangan niya kaagad ng medical treatment.", "danger"]; }
            else if(-3 <= z && z < -2){ return ["Moderate Thinness/Moderate Acute Malnutrition (MAM)", "Mababa ang timbang ng bata. Magpatingin sa doktor at nutritionist.", "warning"]; }
            else if(-2 <= z && z <= 1){ return ["Normal", "Tama lang ang timbang ng bata.", "success"]; }
            else if(1 < z && z <= 2){ return ["Possible Risk of Overweight", "Mag-ingat. Posibleng tumaas ang timbang ng bata.", "warning"]; }
            else if(2 < z && z <= 3){ return ["Overweight", "Mataas ang timbang ng bata.", "warning"]; }
            else if(3 < z){ return ["Obesity", "Masyadong mabigat ang bata!", "danger"]; }
            break;

        case "w4h":
            if(z < -3){ return ["Severe Wasting/Severe Acute Malnutrition (SAM)", "<b>Malala ang kondisyon ng bata</b>. Kailangan niya kaagad ng medical treatment.", "danger"]; }
            else if(-3 <= z && z < -2){ return ["Moderate Wasting/Moderate Acute Malnutrition (MAM)", "<b>Malala ang kondisyon ng bata</b>. Magpatingin sa doktor at nutritionist.", "warning"]; }
            else if(-2 <= z && z <= 1){ return ["Normal", "Tama lang ang timbang ng bata.", "success"]; }
            else if(1 < z && z <= 2){ return ["Possible Risk of Overweight", "Mag-ingat. Posibleng tumaas ang timbang ng bata.", "warning"]; }
            else if(2 < z && z <= 3){ return ["Overweight", "Mataas ang timbang ng bata.", "warning"]; }
            else if(3 < z){ return ["Obesity", "Masyadong mabigat ang bata!", "danger"]; }
            break;
    }
}
//Source: https://www.fantaproject.org/sites/default/files/resources/FANTA-Anthropometry-Guide-May2018.pdf?fbclid=IwAR25NpsgR2liU7bo7M8ir4PdO-hwCEPiJhWr9lHJVQBsM6Qo04Fexc1tqpI

//Processes the input
let nsList = [];
function newData(kidID, at, blocking, bmy, bmx, validInput){
    let z_score, nutri_status, meaning, color_code;
    let anthroID = `${at}-${blocking}`; //Get chart ID

    //See if input is valid
    if(validInput){         
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
        
        z_score = Math.round((zCalc(zsData, bmy, xIndex) * 1000).toPrecision(10)) / 1000; //Calculate the z-score
        [nutri_status, meaning, color_code] = (isNaN(z_score)) ? ["Can't be computed", "", "light"] : interpretNutriStatus(at, z_score); //Interpret the z-score
    }
    else {
        //Don't put anything for z-score and nutritional status
        z_score = "";
        nutri_status = "Can't be computed";
        meaning = "";
        color_code = "light";
    }

    nsList.push(nutri_status);

    //Output to HTML
    document.getElementById(`${kidID}-${at}-ns`).innerHTML = nutri_status;
    document.getElementById(`${kidID}-${at}-ns`).style.backgroundColor = `var(--bs-${color_code})`;
    if(color_code === "light") document.getElementById(`${kidID}-${at}-ns`).style.color = `var(--bs-black)`;

    document.getElementById(`${kidID}-${at}-meaning`).innerHTML = meaning;

    return;
}

function disclaimer(kidID){
    //Disclaimer if the child does not have a normal nutritional status
    let disclaimerMsg = "",
        disclaimerCon = document.getElementById(`${kidID}-disclaimer`)
        disclaimerNeed = false;

    if(
        nsList.find(ns => ns.includes("Moderate")) !== undefined
        || (nsList.find(ns => ns === undefined)) !== undefined
    ){
        disclaimerMsg = "Magpatingin sa doktor at nutritionist upang ma-monitor ang nutrisyon ng bata";
        disclaimerNeed = true;
    }
    
    if(
        nsList.find(ns => ns.includes("Severe")) !== undefined
        || nsList.find(ns => ns.includes("Obesity")) !== undefined
    ){
        disclaimerMsg = "Kailangang magpakonsulta kaagad sa doktor at nutritionist";
        disclaimerNeed = true;
    }

    if(disclaimerNeed) disclaimerCon.innerHTML = `Disclaimer: ${disclaimerMsg}. <a href='/impormasyon#more-info' target='_blank'>Paano?</a>`;
}