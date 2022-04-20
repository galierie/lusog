/*
    Handles the non-Chart.js-related z-score calculator input processes.
*/

//Actually calculates z-scores
function zCalc(){
    //grrrr
}

//Interprets nutritional status per chart
function interpretW4A(anthroID, w, a){
    let zsData = w4aData.find(e => e[0] === anthroID),
        bmx = a;

    let i = zsData[1][0].findIndex(e => +`${e}` === bmx);
    let dataset = zsData[1][1].map(e => { return e.data[i]; });

    if(w < dataset[0]){ return "Severe Underweight"; } // z < -3
    else if(dataset[0] <= w && w < dataset[1]){ return "Moderate Underweight"; } // -3 <= z < -2
    else if(dataset[1] <= w && w <= dataset[4]){ return "Normal"; } // -2 <= z <= 1
    else if(dataset[4] < w){ return "Use BMI-for-age"; } // 1 < z
}

function interpretH4A(anthroID, h, a){
    let zsData = h4aData.find(e => e[0] === anthroID),
        bmx = a;

    let i = zsData[1][0].findIndex(e => +`${e}` === bmx);
    let dataset = zsData[1][1].map(e => { return e.data[i]; });

    if(h < dataset[0]){ return "Severe Stunting"; } // z < -3
    else if(dataset[0] <= h && h< dataset[1]){ return "Moderate Stunting"; } // -3 <= z < -2
    else if(dataset[1] <= h && h <= dataset[6]){ return "Normal"; } // -2 <= z <= 3
    else if(dataset[6] < h){ return "Normal (not a nutrition issue but might be a sign of an endocrine disorder)"; } // 3 < z
}

function interpretBMI4A(anthroID, bmi, a){
    let zsData = bmi4aData.find(e => e[0] === anthroID),
        bmx = a;

    let i = zsData[1][0].findIndex(e => +`${e}` === bmx);
    let dataset = zsData[1][1].map(e => { return e.data[i]; });

    if(bmi < dataset[0]){ return "Severe Wasting/Severe Acute Malnutrition (SAM)"; } // z < -3
    else if(dataset[0] <= bmi && bmi < dataset[1]){ return "Moderate Wasting/Moderate Acute Malnutrition (MAM)"; } // -3 <= z <-2
    else if(dataset[1] <= bmi && bmi <= dataset[4]){ return "Normal"; } // -2 <= z <= 1
    else if(dataset[4] < bmi && bmi <= dataset[5]){ return "Possible Risk of Overweight"; } // 1 < z <= 2
    else if(dataset[5] < bmi && bmi <= dataset[6]){ return "Overweight"; } // 2 < z <= 3
    else if(dataset[6] < bmi){ return "Obesity"; } // 3 < z
}

function interpretW4H(anthroID, w, h){
    let zsData = w4hData.find(e => e[0] === anthroID),
        bmx = Math.round(h),
        d = h - bmx;
    
    if(Math.abs(d) > 0.25){
        if(d < 0){ bmx -= 0.5; } 
        else if(d > 0){ bmx += 0.5; }
    }

    let i = zsData[1][0].findIndex(e => +`${e}` === bmx);
    let dataset = zsData[1][1].map(e => { return e.data[i]; });

    if(w < dataset[0]){ return "Severe Wasting/Severe Acute Malnutrition (SAM)"; } // z < -3
    else if(dataset[0] <= w && w < dataset[1]){ return "Moderate Wasting/Moderate Acute Malnutrition (MAM)"; } // -3 <= z <-2
    else if(dataset[1] <= w && w <= dataset[4]){ return "Normal"; } // -2 <= z <= 1
    else if(dataset[4] < w && w <= dataset[5]){ return "Possible Risk of Overweight"; } // 1 < z <= 2
    else if(dataset[5] < w && w <= dataset[6]){ return "Overweight"; } // 2 < z <= 3
    else if(dataset[6] < w){ return "Obesity"; } // 3 < z
}

//Processes the input
function newData(kidName, anthroType, blocking, bmy, bmx){
    let anthroID = `${anthroType}-${blocking}`; //Get chart ID
    console.log(anthroID);
    
    //Interpret z-score
    let nutriStatus = "";
    switch(anthroType){
        case "w4a":
            nutriStatus = interpretW4A(anthroID, bmy, bmx);
            break;
        case "h4a":
            nutriStatus = interpretH4A(anthroID, bmy, bmx);
            break;
        case "bmi4a":
            nutriStatus = interpretBMI4A(anthroID, bmy, bmx);
            break;
        case "w4h":
            nutriStatus = interpretW4H(anthroID, bmy, bmx);
            break;
    }
    document.getElementById(`${kidName}-${anthroType}-status`).innerHTML = nutriStatus;

    //New z-score chart
    if(anthroType === "w4h"){
        let newBMX = Math.round(bmx),
            d = bmx - newBMX;
    
        if(Math.abs(d) > 0.25){
            if(d < 0){ newBMX -= 0.5; } 
            else if(d > 0){ newBMX += 0.5; }
        }

        [bmx, newBMX] = [newBMX, bmx];
    }

    let zsData = searchData(anthroType).find(e => e[0] === anthroID);

    let xIndex = zsData[1][0].findIndex(e => +`${e}` === bmx),
        anthroData = [];
    for(let i = 0; i < zsData[1][0].length; i++){ (xIndex === i) ? anthroData.push(bmy) : anthroData.push(null); }

    let anthroDataset = new Dataset("No Z-Score", anthroData); 

    inputChart(kidName, anthroID, anthroDataset);

    //Actually calculate the z-score

    return;
}
