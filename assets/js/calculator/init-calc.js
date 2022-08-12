/*
    Initializes z-score calculators per kid.
*/

//Makes the summary report
function buildReport(kidCalc, at, b){
    //Make the report and rename it
    let report = document.getElementById("report-temp").cloneNode(true);
    report.classList.add(`${at}-report`);
    report.id = `${kidCalc.id}-${at}-report`;

    //Rename the output fields
    let rLabels = report.getElementsByTagName("label"),
        types = ["charts", "zs", "ns"];

    for(let i = 0; i < types.length; i++){
        let fieldID = `${kidCalc.id}-${at}-${types[i]}`;
        rLabels[i].htmlFor = fieldID;
        report.getElementsByClassName(types[i])[0].id = fieldID;
    }

    //Make the summary and rename it
    let summary = document.getElementById("summary-temp").cloneNode(true);
    summary.classList.add(`${at}-summary`);
    summary.id = "";

    for(let i = 1; i < types.length; i++){
        let fieldID = `${kidCalc.id}-${at}-${types[i]}-summary`;
        summary.getElementsByClassName(types[i])[0].id = fieldID;
        summary.getElementsByTagName("label")[i - 1].htmlFor = fieldID;
    }

    //Add the event listener to the button
    let reportBtn = summary.getElementsByTagName("button")[0];
    reportBtn.setAttribute("data-bs-target", `#${kidCalc.id}-${at}-report`);
    reportBtn.onclick = () => {
        report.style.display = "block";
    }

    //Fix the label for the growth chart
    let atLabel = "";
    switch(at){
        case "w4a":
            atLabel += "Weight-for-Age";
            break;
        case "h4a":
            atLabel += "Height-for-Age";
            break;
        case "bmi4a":
            atLabel += "BMI-for-Age";
            break;
        case "w4h":
            atLabel += "Weight-for-Height";
            break;
    }
    rLabels[0].innerHTML = `${kidCalc.id}'s ${atLabel} Z-Score Chart: `;
    summary.getElementsByClassName("summary-title")[0].innerHTML = `${atLabel}: `;

    kidCalc.getElementsByClassName("actual-report")[0].appendChild(report);

    kidCalc.getElementsByClassName("summary-div")[0].appendChild(summary);

    //Makes the base z-score charts
    let chartID = `${at}-${b}`;
    baseChart(
        kidCalc.id, 
        gSheets.find(sheet => sheet.canvasID === chartID), 
        searchData(at).find(cd => cd[0] === chartID)
    );
    
    return;
}

//Builds the z-score calculator per kid
function buildCalc(){
    let kidCalc = document.getElementById("calc-temp").cloneNode(true), 
        kidName = "";

    //Adds IDs to it to be able to specify it and changes IDs to reflect new kid name
    kidCalc.getElementsByTagName("input")[0].onchange = () => {
        kidName = "";
        kidName = kidCalc.getElementsByTagName("input")[0].value;
        kidCalc.id = kidName; //Entire Calculator

        //Input Fields and Labels
        let calcInputs = kidCalc.getElementsByTagName("input"), 
            labels = kidCalc.getElementsByTagName("label"); 
        for(let i = 0; i < calcInputs.length; i++){
            let field = calcInputs[i].id.split("-");
            calcInputs[i].id = `${kidName}-${field[1]}`;
            labels[i].htmlFor = calcInputs[i].id;

            if(calcInputs[i].type === "radio"){
                let rGroup = calcInputs[i].name.split("-");
                calcInputs[i].name = `${kidName}-${rGroup[1]}`;
            }
        }

        //BMI Status
        let bmiDiv = kidCalc.getElementsByClassName("bmi-div")[0]; 
        bmiDiv.getElementsByTagName("p")[0].id = `${kidName}-bmi`;
        bmiDiv.getElementsByTagName("label")[0].htmlFor = `${kidName}-bmi`;
    }

    //Calls functions to process the input
    kidCalc.getElementsByClassName("submit")[0].onclick = () => {
        //Check kidCalc ID if
        //null
        if(
            (kidName === "" || kidName === null) 
            && kidCalc.id === "calc-temp"
        ){
            alert("Pakilagay po ang pangalan ng bata. Salamat!");
            return;
        }
        //first character is not a letter
        if(!(kidName[0].match(/[a-z]/gi))){
            alert("Mangyaring baguhin lamang po ang unang karakter ng pangalan ng bata sa isang letra. Salamat!");
            return;
        }

        //Get the input
        let a = (document.getElementById(`${kidName}-age`).value)
                ? +`${document.getElementById(`${kidName}-age`).value}`
                : null,
            s = (Array.from(document.getElementsByName(`${kidName}-sex`)).find(r => r.checked) !== undefined) 
                ? Array.from(document.getElementsByName(`${kidName}-sex`)).find(r => r.checked).value 
                : null,
            d = document.getElementById(`${kidName}-date`).value,
            w = (document.getElementById(`${kidName}-weight`).value)
                ? +`${document.getElementById(`${kidName}-weight`).value}`
                : null,
            h = (document.getElementById(`${kidName}-height`).value)
                ? +`${document.getElementById(`${kidName}-height`).value}`
                : null,
            m = ((a !== undefined) && (a > 60)) 
                ? "S"
                :(Array.from(document.getElementsByName(`${kidName}-measure`)).find(r => r.checked) !== undefined) 
                    ? Array.from(document.getElementsByName(`${kidName}-measure`)).find(r => r.checked).value 
                    : null;

        //Check the input
        if(a === "" || a === null){
            alert("Pakilagay po ang edad ng bata. Salamat!");
            return;
        }
        else if(s === "" || s === null){
            alert("Pakilagay po ang kasarian ng bata. Salamat!");
            return;
        }
        else if(d === "" || d === null){
            alert("Pakilagay po ang petsa ngayon. Salamat!");
            return;
        }
        else if(w === "" || w === null){
            alert("Pakilagay po ang timbang ng bata. Salamat!");
            return;
        }
        else if(h === "" || h === null){
            alert("Pakilagay po ang katangkaran ng bata. Salamat!");
            return;
        }
        else if((a < 61) && (m === "" || m === null)){
            alert("Pakilagay po ang paraan ng pagkuha ng katangkaran ng bata. Salamat!");
            return;
        }

        //Compute the kid's height
        if((m === "R") && (23 < a && a < 61)) h -= 0.7;
        else if((m === "S") && (a <= 23)) h += 0.7; 

        //Shows the kid's BMI
        let bmi = Math.round(((w / ((h / 100) ** 2)) * 100).toPrecision(10)) / 100;
        document.getElementById(`${kidName}-bmi`).innerHTML = bmi;

        //Get the blocking 
        let bioSex, ageGroup;

        if(s === "M"){ bioSex = "boy"; }
        else if(s === "F"){ bioSex = "girl"; }

        if(0 <= a && a <= 24){ ageGroup = "infant"; }
        else if(24 < a && a <= 60){ ageGroup = "toddler"; }
        else if(60 < a && a <= 120){ ageGroup = "kid"; }
        else if(120 < a && a <= 228){ ageGroup = "teen"; }

        let blocking = `${bioSex}-${ageGroup}`;

        //Builds z-score charts
        atIndic.forEach(at => {
            let report = kidCalc.getElementsByClassName(`${at}-report`)[0],
                summary = kidCalc.getElementsByClassName(`${at}-summary`)[0];

            if(
                (at === "w4a" && a > 120) ||
                (at === "w4h" && a > 60)
            ){
                if(report) report.remove();
                if(summary) summary.remove();

                return;
            }

            if(
                report === undefined ||
                report.id !== `${kidName}-${at}-report`
            ){
                if(report) report.remove();
                if(summary) summary.remove();
                
                buildReport(kidCalc, at, blocking);
            }
        });

        //Processes the input
        if(0 <= a && a <= 120) newData(kidName, "w4a", blocking, w, a);
        newData(kidName, "h4a", blocking, h, a);
        newData(kidName, "bmi4a", blocking, bmi, a);
        if(0 <= a && a <= 60) newData(kidName, "w4h", blocking, w, h);

        kidCalc.getElementsByClassName("summary-report")[0].style.display = "block";
    }

    //Removes the calculator
    kidCalc.getElementsByClassName("rm-calc")[0].onclick = () => {
        kidCalc.remove();
    }

    document.getElementById("calculators").insertBefore(kidCalc, document.getElementById("kid-amount-div"));

    return;
}

//Gets the number of kids to be anthropometrically measured
document.getElementById("add-kids").onclick = () => {
    let kidAmount = +`${document.getElementById("kid-amount").value}`;
    for(let i = 0; i < kidAmount; i++){ buildCalc(); }
    return;
}
