/*
    Initializes z-score calculators per kid.
*/

//Makes new z-score charts per kid
function buildNutriCharts(kidCalc, anthroType, blocking){
    //Makes new z-score chart containers
    let atChart = document.getElementById("chart-temp").cloneNode(true),
        atChartID = `${kidCalc.id}-${anthroType}-chart`;
    
    atChart.id = "";
    atChart.classList.add(`${anthroType}-chart`);
    atChart.getElementsByTagName("canvas")[0].id = atChartID;
    atChart.getElementsByTagName("label")[0].htmlFor = atChartID;
    
    let label = `${kidCalc.id}'s `;
    switch(anthroType){
        case "w4a":
            label += "Weight-for-Age";
            break;
        case "h4a":
            label += "Height-for-Age";
            break;
        case "bmi4a":
            label += "BMI-for-Age";
            break;
        case "w4h":
            label += "Weight-for-Height";
            break;
    }

    atChart.getElementsByTagName("label")[0].innerHTML = label;

    kidCalc.getElementsByClassName("charts")[0].appendChild(atChart);

    //Makes the base z-score charts
    let atID = `${anthroType}-${blocking}`,
        chartData = searchData(anthroType);
    baseChart(
        kidCalc.id, 
        gSheets.find(sheet => sheet.canvasID === atID), 
        chartData.find(cd => cd[0] === atID)
    ); 

    return;
}

//Makes new nutritional status text containers
function buildNutriStatus(kidCalc, anthroType){
    let atStatus = document.getElementById("status-temp").cloneNode(true),
        atStatusID = `${kidCalc.id}-${anthroType}-status`;

    atStatus.id = "";
    atStatus.classList.add(`${anthroType}-status`);
    atStatus.getElementsByTagName("p")[0].id = atStatusID;
    atStatus.getElementsByTagName("label")[0].htmlFor = atStatusID;

    let label = "";
    switch(anthroType){
        case "w4a":
            label += "Weight-for-Age: ";
            break;
        case "h4a":
            label += "Height-for-Age: ";
            break;
        case "bmi4a":
            label += "BMI-for-Age: ";
            break;
        case "w4h":
            label += "Weight-for-Height: ";
            break;
    }
    atStatus.getElementsByTagName("label")[0].innerHTML = label;

    kidCalc.getElementsByClassName("statuses")[0].appendChild(atStatus);
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
