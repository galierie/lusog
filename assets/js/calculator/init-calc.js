/*
    Initializes z-score calculators per kid.
*/

//Generates an ID
let kidIDList = [];
function makeKidID(){
    let engAB = "abcdefghijklmnopqrstuvwxyz";

    let l = engAB[Math.floor(Math.random() * engAB.length)],
        num = `${Math.floor(Math.random() * 100000000)}`;
    while(num.length < 8) num = "0" + num;

    let kidID = `${l}${num}`;

    while(kidIDList.find(id => id === kidID) !== undefined){
        l = engAB[Math.floor(Math.random() * engAB.length)];
        num = `${Math.floor(Math.random() * 100000000)}`;
        while(num.length < 8) num = "0" + num;

        kidID = `${l}${num}`;
    }

    kidIDList.push(kidID);
    
    return kidID;
}

//Makes the summary report
function buildReport(kidCalc, n, at, b){
    //Makes the report and rename it
    let report = document.getElementById("report-temp").cloneNode(true);
    report.classList.add(`${at}-report`);
    report.id = `${kidCalc.id}-${at}-report`;

    //Renames the output fields
    let rLabels = report.getElementsByTagName("label"),
        types = ["charts", "zs", "ns"];

    for(let i = 0; i < types.length; i++){
        let fieldID = `${kidCalc.id}-${at}-${types[i]}`;
        rLabels[i].htmlFor = fieldID;
        report.getElementsByClassName(types[i])[0].id = fieldID;
    }

    //Makes the summary and renames it
    let summary = document.getElementById("summary-temp").cloneNode(true);
    summary.classList.add(`${at}-summary`);
    summary.id = "";

    for(let i = 1; i < types.length; i++){
        let fieldID = `${kidCalc.id}-${at}-${types[i]}-summary`;
        summary.getElementsByClassName(types[i])[0].id = fieldID;
        summary.getElementsByTagName("label")[i - 1].htmlFor = fieldID;
    }

    //Adds the event listener to the button
    let reportBtn = summary.getElementsByTagName("button")[0];
    reportBtn.setAttribute("data-bs-target", `#${kidCalc.id}-${at}-report`);
    reportBtn.onclick = () => { report.style.display = "block"; }

    //Fixes the label for the growth chart
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
    rLabels[0].innerHTML = `${n}'s ${atLabel} Z-Score Chart: `;
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
        kidID = makeKidID();

    kidCalc.id = kidID; //Adds IDs to the calculator to be able to specify it 

    //Input Fields and Labels
    let calcInputs = kidCalc.getElementsByTagName("input"), 
        labels = kidCalc.getElementsByTagName("label"); 
    for(let i = 0; i < calcInputs.length; i++){
        let field = calcInputs[i].id.split("-");
        calcInputs[i].id = `${kidID}-${field[1]}`;
        labels[i].htmlFor = calcInputs[i].id;

        if(calcInputs[i].type === "radio" || calcInputs[i].type === "checkbox"){
            let rGroup = calcInputs[i].name.split("-");
            calcInputs[i].name = `${kidID}-${rGroup[1]}`;
        }
    }

    //BMI Status and Ideal Weight and Height
    let miscDiv = kidCalc.getElementsByClassName("misc-div")[0].getElementsByTagName("div"),
        miscStat = ["bmi", "ideal-w", "ideal-h"]; 
    for(let i = 0; i < miscStat.length; i++){
        miscDiv[i].getElementsByTagName("p")[0].id = `${kidID}-${miscStat[i]}`;
        miscDiv[i].getElementsByTagName("label")[0].htmlFor = `${kidID}-${miscStat[i]}`;
    }

    document.getElementById("calculators").insertBefore(kidCalc, document.getElementById("kid-amount-div"));

    //Event Listeners
    //Sets mode of height measurement
    let ageInput = document.getElementById(`${kidID}-age`);
    ageInput.onchange = () => {
        let measureInput = kidCalc.getElementsByClassName("measure")[0].getElementsByTagName("input"),
            mode = (ageInput.value > 60) ? 1 : 0,
            notMode = (ageInput.value > 60) ? 0 : 1;

        measureInput[notMode].removeAttribute("checked");
        measureInput[mode].setAttribute("checked", "true");
    }

    //Calculates age from birthday
    let dateInput = document.getElementById(`${kidID}-date`),
        bdateBool = document.getElementById(`${kidID}-nbdate`),
        bdateInput = document.getElementById(`${kidID}-bdate`);

    bdateInput.onchange = dateInput.onchange = () => {
        if((bdateInput.value !== "" && dateInput.value !== "") && !(bdateBool.checked)){
            let bdate = new Date(bdateInput.value),
                date = new Date(dateInput.value);

            let age = Math.round(
                ((date.getFullYear() - bdate.getFullYear()) * 12) 
                + (date.getMonth() - bdate.getMonth()) 
                + ((date.getDate() - bdate.getDate()) * 0.033)
            );

            ageInput.value = age;
            ageInput.dispatchEvent(new Event("change"));
        }
    }

    //See if age is calculable
    bdateBool.onchange = () => {
        if(bdateBool.checked){
            ageInput.removeAttribute("disabled");
            bdateInput.setAttribute("disabled", "true");
        }
        else {
            ageInput.setAttribute("disabled", "true");
            bdateInput.removeAttribute("disabled");
        }
    }

    //Calls functions to process the input
    kidCalc.getElementsByClassName("submit")[0].onclick = () => {
        //Get the input
        let n = (document.getElementById(`${kidID}-name`).value)
                ? +`${document.getElementById(`${kidID}-name`).value}`
                : null,
            a = (document.getElementById(`${kidID}-age`).value)
                ? +`${document.getElementById(`${kidID}-age`).value}`
                : null,
            s = (Array.from(document.getElementsByName(`${kidID}-sex`)).find(r => r.checked) !== undefined) 
                ? Array.from(document.getElementsByName(`${kidID}-sex`)).find(r => r.checked).value 
                : null,
            d = document.getElementById(`${kidID}-date`).value,
            w = (document.getElementById(`${kidID}-weight`).value)
                ? +`${document.getElementById(`${kidID}-weight`).value}`
                : null,
            h = (document.getElementById(`${kidID}-height`).value)
                ? +`${document.getElementById(`${kidID}-height`).value}`
                : null,
            m = ((a !== undefined) && (a > 60)) 
                ? "S"
                :(Array.from(document.getElementsByName(`${kidID}-measure`)).find(r => r.checked) !== undefined) 
                    ? Array.from(document.getElementsByName(`${kidID}-measure`)).find(r => r.checked).value 
                    : null;

        //Check the input
        if(n === "" || n === null){
            alert("Pakilagay po ang pangalan ng bata. Salamat!");
            return;
        }
        if(a === "" || a === null){
            alert("Pakilagay po ang edad ng bata. Salamat!");
            return;
        }
        else if(s === "" || s === null){
            alert("Pakilagay po ang kasarian ng bata. Salamat!");
            return;
        }
        else if(d === "" || d === null){
            alert("Pakilagay po ang petsa ng pagkuha ng timbang at katangkaran ng bata. Salamat!");
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

        //Check anthropometric input limits
        //Weight
        let validInputW = true, 
            validInputH = true;

        if(275 < w || w < 0.90){
            let wAlert = "Kung ang timbang ng bata ay mas ";
            if(w < 0.90) wAlert += "mababa sa 0.90";
            else if(275 < w) wAlert += "mataas sa 275";
            wAlert += " kg, inirerekomenda na magpakonsulta na agad sa doktor. Salamat!";
            alert(wAlert);

            validInputW = false;
        }

        //Height
        if(230 < h || h < 38){
            let hAlert = "Kung ang katangkaran ng bata ay mas ";
            if(h < 38) hAlert += "mababa sa 38";
            else if(230 < h) hAlert += "mataas sa 230";
            hAlert += " cm, inirerekomenda na magpakonsulta na agad sa doktor. Salamat!";
            alert(hAlert);

            validInputH = false;
        }

        //Compute the kid's height
        if((m === "R") && (23 < a && a < 61)) h -= 0.7;
        else if((m === "S") && (a <= 23)) h += 0.7; 

        //Shows the kid's BMI
        let bmi = Math.round(((w / ((h / 100) ** 2)) * 100).toPrecision(10)) / 100;
        document.getElementById(`${kidID}-bmi`).innerHTML = bmi;

        //Get the blocking 
        let bioSex, ageGroup;

        if(s === "M"){ bioSex = "boy"; }
        else if(s === "F"){ bioSex = "girl"; }

        if(0 <= a && a <= 23){ ageGroup = "infant"; }
        else if(23 < a && a <= 60){ ageGroup = "toddler"; }
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
                report.id !== `${kidID}-${at}-report`
            ){
                if(report) report.remove();
                if(summary) summary.remove();
                
                buildReport(kidCalc, n, at, blocking);
            }
        });

        //Processes the input
        if(0 <= a && a <= 120) newData(kidID, "w4a", blocking, w, a, validInputW);
        newData(kidID, "h4a", blocking, h, a, validInputH);
        newData(kidID, "bmi4a", blocking, bmi, a, (validInputW && validInputH));
        if(0 <= a && a <= 60) newData(kidID, "w4h", blocking, w, h, (validInputW && validInputH));

        //Show the ideal weight and height
        let [idealW, idealH] = getIdeal(blocking, a);
        document.getElementById(`${kidID}-ideal-w`).innerHTML = idealW;
        document.getElementById(`${kidID}-ideal-h`).innerHTML = idealH;

        kidCalc.getElementsByClassName("summary-report")[0].style.display = "block";
    }

    //Removes the calculator
    kidCalc.getElementsByClassName("rm-calc")[0].onclick = () => { kidCalc.remove(); }

    return;
}

//Gets the number of kids to be anthropometrically measured
document.getElementById("add-kids").onclick = () => {
    let kidAmount = +`${document.getElementById("kid-amount").value}`;
    for(let i = 0; i < kidAmount; i++){ buildCalc(); }
    return;
}
