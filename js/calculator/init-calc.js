/*
    Initializes z-score calculators per kid.
*/

//Builds the visuals for the calculator results
function buildNutriStatus(anthroType, blocking, kidCalc){
    //Makes new nutritional status text containers
    let atStatus = document.getElementById(`${anthroType}-temp`).cloneNode(true);
    atStatus.id = "";
    atStatus.getElementsByTagName("p")[0].id = `${kidCalc.id}-${anthroType}`;
    atStatus.getElementsByTagName("label")[0].htmlFor = `${kidCalc.id}-${anthroType}`;
    kidCalc.getElementsByClassName("statuses")[0].appendChild(atStatus);

    //Makes new z-score chart containers
    let atChart = document.getElementById(`${anthroType}-${blocking}-temp`).cloneNode(true);
    atChart.id = "";
    atChart.getElementsByTagName("canvas")[0].id = kidCalc.id + atChart.getElementsByTagName("canvas")[0].id;
    atChart.getElementsByTagName("label")[0].htmlFor = atChart.getElementsByTagName("canvas")[0].id;
    kidCalc.getElementsByClassName("charts")[0].appendChild(atChart);

    //Makes the base z-score charts
    let chartData;
    switch(anthroType){
        case "w4a":
            chartData = w4aData;
            break;
        case "h4a":
            chartData = h4aData;
            break;
        case "bmi4a":
            chartData = bmi4aData;
            break;
        case "w4h":
            chartData = w4hData;
            break;
    }

    baseChart(
        kidCalc.id,
        gSheets.find(sheet => sheet.canvasID === `-${anthroType}-${blocking}`),
        chartData.find(cd => cd[0] === `-${anthroType}-${blocking}`)
    );

    return;
}

//Builds the z-score calculator per kid
function buildCalc(){
    let kidCalc = document.getElementById("calc-temp").cloneNode(true), kidName = ""; 
    
    //Adds IDs to it to be able to specify it and changes IDs to reflect new kid name
    kidCalc.getElementsByTagName("input")[0].onchange = () => {
        kidName = "";
        kidName = kidCalc.getElementsByTagName("input")[0].value;
        kidCalc.id = kidName; //Entire Calculator

        //Input Fields and Labels
        let calcInputs = kidCalc.getElementsByTagName("input"), 
            labels = kidCalc.getElementsByTagName("label"); 
        for(let j = 0; j < calcInputs.length; j++){
            let field = calcInputs[j].id.split("-");
            calcInputs[j].id = `${kidName}-${field[1]}`;
            labels[j].htmlFor = calcInputs[j].id;
        }

        //BMI Status
        let bmiDiv = kidCalc.getElementsByClassName("bmi-div")[0]; 
        bmiDiv.getElementsByTagName("p")[0].id = `${kidName}-bmi`;
        bmiDiv.getElementsByTagName("label")[0].htmlFor = `${kidName}-bmi`;

        //Anthropometric Indicator Statuses and Charts
        atIndic.forEach(at => {
            let atID = `${kidName}-${at}`,
                atStatus = kidCalc.getElementsByClassName(`${at}-status`)[0],
                atChart = kidCalc.getElementsByClassName(`${at}-chart`)[0];

            if(atStatus){
                atStatus.getElementsByTagName("p")[0].id = `${atID}-status`;
                atStatus.getElementsByTagName("label")[0].htmlFor = `${atID}-status`;
            }

            if(atChart){
                atChart.getElementsByTagName("canvas")[0].id = `${atID}-chart`;
                atChart.getElementsByTagName("label")[0].htmlFor = `${atID}-chart`;
            }
        });
    }


    //Calls functions to process the input
    kidCalc.getElementsByClassName("submit")[0].addEventListener('click', () => {
        let a = +`${document.getElementById(`${kidName}-age`).value}`,
            s = document.getElementById(`${kidName}-sex`).value,
            h = +`${document.getElementById(`${kidName}-height`).value}`,
            w = +`${document.getElementById(`${kidName}-weight`).value}`;
    
        //Shows the kid's BMI
        let bmi = w / (h ** 2);
        document.getElementById(`${kidName}-bmi`).innerHTML = bmi;

        //Get the blocking 
        let bioSex, ageGroup;

        if(s === "M" || s === "m"){ bioSex = "boy"; }
        else if(s === "F" || s === "f"){ bioSex = "girl"; }

        if(0 <= a && a <= 60){ ageGroup = "toddler"; }
        else if(60 < a && a <= 228){ ageGroup = "kid"; }

        let blocking = bioSex + "-" + ageGroup;

        //Builds z-score charts and processes the input
        if(0 <= a && a <= 120){
            if(document.getElementById(`${kidName}-w4a-${blocking}`) === null){ buildNutriStatus("w4a", blocking, kidCalc); }
            newData(kidName, "w4a", blocking, w, a);
        }

        if(document.getElementById(`${kidName}-h4a-${blocking}`) === null){ buildNutriStatus("h4a", blocking, kidCalc); }
        newData(kidName, "h4a", blocking, h, a);

        if(document.getElementById(`${kidName}-bmi4a-${blocking}`) === null){ buildNutriStatus("bmi4a", blocking, kidCalc); }
        newData(kidName, "bmi4a", blocking, bmi, a);

        if(0 <= a && a <= 60){
            if(document.getElementById(`${kidName}-w4h-${blocking}`) === null){ buildNutriStatus("w4h", blocking, kidCalc); }
            newData(kidName, "w4h", blocking, w, h);
        }
        
    });

    document.getElementById("calculators").insertBefore(kidCalc, document.getElementById("kid-amount-div"));

    return;
}

//Gets the number of kids to be anthropometrically measured
document.getElementById("add-kids").onclick = () => {
    let kidAmount = +`${document.getElementById("kid-amount").value}`;
    for(let i = 0; i < kidAmount; i++){ buildCalc(); }
    return;
}

/*
Sources: 
    https://www.createwithdata.com/chartjs-and-csv/
    https://www.w3schools.com/ai/ai_chartjs.asp
    https://www.chartjs.org/
    https://d3js.org/
    https://www.tutorialsteacher.com/d3js/loading-data-from-file-in-d3js
*/
