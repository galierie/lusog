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
function buildSummary(kidCalc, at){
    //Makes the summary and renames it
    let summary = document.getElementById("summary-temp").cloneNode(true);
    summary.classList.add(`${at}-summary`);
    summary.id = `${kidCalc.id}-${at}-summary`;

    summary.getElementsByClassName("ns")[0].id = `${kidCalc.id}-${at}-ns`;
    summary.getElementsByClassName("meaning")[0].id = `${kidCalc.id}-${at}-meaning`;

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
    summary.getElementsByClassName("summary-title")[0].innerHTML = `${atLabel}: `;
    kidCalc.getElementsByClassName("summary-div")[0].appendChild(summary);

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

    //Select Elements
    let selects = kidCalc.getElementsByTagName("select");
    for(let i = 0; i < selects.length; i++){
        let metric = selects[i].id.split("-");
        selects[i].id = `${kidID}-${metric[1]}`;
    }

    //BMI Status, Ideal Weight and Height, Disclaimer
    let miscDiv = kidCalc.getElementsByClassName("misc-div")[0].getElementsByClassName("card"),
        miscStat = ["bmi", "ideal-w", "ideal-h"]; 
    for(let i = 0; i < miscStat.length; i++){
        miscDiv[i].getElementsByTagName("h6")[0].id = `${kidID}-${miscStat[i]}`;
        miscDiv[i].getElementsByTagName("label")[0].htmlFor = `${kidID}-${miscStat[i]}`;
    }

    kidCalc.getElementsByClassName("disclaimer")[0].id = `${kidID}-disclaimer`;

    document.getElementById("calculators").insertBefore(kidCalc, document.getElementById("kid-amount-div"));

    //Confirmation Modal
    kidCalc.getElementsByClassName("confirm")[0].id = `${kidID}-confirm`;
    kidCalc.getElementsByClassName("rm-calc")[0].setAttribute("data-bs-target", `#${kidID}-confirm`);

    //Event Listeners
    //Monitor if there's input
    
    //Age
    let ageBool = false, ageInput = document.getElementById(`${kidID}-age`);
    ageInput.onchange = () => {
        ageBool = (
            (ageInput.value !== "" && ageInput.value !== null)
            && (0 <= ageInput.value && ageInput.value <= 228)
        ) ? true : false; 
        ageInput.parentElement.style.borderColor = `var(--bs-${(ageBool) ? "primary" : "danger"})`;
        ageInput.parentElement.getElementsByClassName("warn-input")[0].style.display = (ageInput.value !== "" && ageInput.value !== null) ? "none" : "block";
        ageInput.parentElement.getElementsByClassName("warn-invalid")[0].style.display = (0 <= ageInput.value && ageInput.value <= 228) ? "none" : "block";
        
        //Sets mode of height measurement
        let measureInput = kidCalc.getElementsByClassName("measure")[0].getElementsByTagName("input"),
            mode = (ageInput.value > 60) ? 1 : 0,
            notMode = (ageInput.value > 60) ? 0 : 1;

        measureInput[notMode].removeAttribute("checked");
        measureInput[mode].setAttribute("checked", "true");
    }

    //Biological Sex
    let bsBool = false, bsInput = Array.from(document.getElementsByName(`${kidID}-sex`));
    for(let bs = 0; bs < bsInput.length; bs++){
        bsInput[bs].onclick = bsInput[bs].onchange = () => {
            bsBool = (bsInput[bs].value !== "" && bsInput[bs].value !== null) ? true : false;
            kidCalc.getElementsByClassName("sex")[0].style.borderColor = `var(--bs-${(bsBool) ? "primary" : "danger"})`;
        }
        if(bsBool) break;
    }

    //Date
    let dateBool = false, dateInput = document.getElementById(`${kidID}-date`);
    dateInput.onchange = dateInput.onblur = () => {
        dateBool = (dateInput.value !== "" && dateInput.value !== null) ? true : false;
        dateInput.style.borderColor = `var(--bs-${(dateBool) ? "primary" : "danger"})`;
        dateInput.parentElement.getElementsByClassName("warn-input")[0].style.display = (dateBool) ? "none" : "block";
    }

    //Calculates age from birthday
    let bdateBool = document.getElementById(`${kidID}-nbdate`),
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

    //Weight
    let weightBool = false, weightInput = document.getElementById(`${kidID}-weight`);
    weightInput.onchange = () => {
        weightBool = (weightInput.value !== "" && weightInput.value !== null) ? true : false;
        weightInput.style.borderColor = `var(--bs-${(weightBool) ? "primary" : "danger"})`;
        weightInput.parentElement.parentElement.getElementsByClassName("warn-input")[0].style.display = (weightBool) ? "none" : "block";
    }

    //Height
    let heightBool = false, heightInput = document.getElementById(`${kidID}-height`);
    heightInput.onchange = () => {
        heightBool = (heightInput.value !== "" && heightInput.value !== null) ? true : false;
        heightInput.style.borderColor = `var(--bs-${(heightBool) ? "primary" : "danger"})`;
        heightInput.parentElement.parentElement.getElementsByClassName("warn-input")[0].style.display = (heightBool) ? "none" : "block";
    }

    //Able to submit
    let subBtn = kidCalc.getElementsByClassName("submit")[0];
    kidCalc.getElementsByClassName("input-calc")[0].onchange = () => {
        if(ageBool && bsBool && dateBool && weightBool && heightBool){
            subBtn.classList.remove("disabled");
            subBtn.removeAttribute("disabled");
            subBtn.style.backgroundColor = `var(--bs-success)`;
            subBtn.parentElement.classList.remove("warn-submit");
        }
        else {
            subBtn.classList.add("disabled", "warn-submit");
            subBtn.setAttribute("disabled", "true");
            subBtn.style.backgroundColor = `var(--bs-danger)`;
            subBtn.parentElement.classList.add("warn-submit");
        }
    }

    //Calls functions to process the input
    subBtn.onclick = () => {
        //Get the input
        let n = (document.getElementById(`${kidID}-name`).value)
                ? `${document.getElementById(`${kidID}-name`).value}`
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
            mw = (document.getElementById(`${kidID}-metricw`).value)
                ? +`${document.getElementById(`${kidID}-metricw`).value}`
                : null,
            h = (document.getElementById(`${kidID}-height`).value)
                ? +`${document.getElementById(`${kidID}-height`).value}`
                : null,
            mh = (document.getElementById(`${kidID}-metrich`).value)
                ? +`${document.getElementById(`${kidID}-metrich`).value}`
                : null,
            m = ((a !== undefined) && (a > 60)) 
                ? "S"
                :(Array.from(document.getElementsByName(`${kidID}-measure`)).find(r => r.checked) !== undefined) 
                    ? Array.from(document.getElementsByName(`${kidID}-measure`)).find(r => r.checked).value 
                    : null;

        if(mw === 1) w /= 2.2; //Compute the kid's weight

        //Compute the kid's height
        if(mh === 1) h *= 2.54;
        if((m === "R") && (23 < a && a < 61)) h -= 0.7;
        else if((m === "S") && (a <= 23)) h += 0.7; 

        //Check anthropometric input limits
        let validInputW = true, 
            validInputH = true;

        //Weight
        if(275 < w || w < 0.90){
            let wAlert = "Kung ang timbang ng bata ay mas ";
            if(w < 0.90) wAlert += "mababa sa 0.90 kg o 2 lbs";
            else if(275 < w) wAlert += "mataas sa 275 kg o 606 lbs";
            wAlert += ", inirerekomenda na magpakonsulta na agad sa doktor. Salamat!";
            alert(wAlert);

            validInputW = false;
        }

        //Height
        if(230 < h || h < 38){
            let hAlert = "Kung ang katangkaran ng bata ay mas ";
            if(h < 38) hAlert += "mababa sa 38 cm o 15 in";
            else if(230 < h) hAlert += "mataas sa 230 cm o 91 in";
            hAlert += ", inirerekomenda na magpakonsulta na agad sa doktor. Salamat!";
            alert(hAlert);

            validInputH = false;
        }

        //Shows the kid's BMI
        let bmi = Math.round(((w / ((h / 100) ** 2)) * 100).toPrecision(10)) / 100;
        document.getElementById(`${kidID}-bmi`).innerHTML = bmi;

        //Builds the summaries
        atIndic.forEach(at => {
            let summary = kidCalc.getElementsByClassName(`${at}-summary`)[0];

            if(
                (at === "w4a" && a > 120) ||
                (at === "bmi4a" && 60 >= a) ||
                (at === "w4h" && a > 60)
            ){
                if(summary) summary.remove();
                return;
            }

            if(
                summary === undefined ||
                summary.id !== `${kidID}-${at}-summary`
            ) {
                if(summary) summary.remove();
                buildSummary(kidCalc, at);
            }
        });

        //Get the blocking 
        let bioSex, ageGroup;

        if(s === "M"){ bioSex = "boy"; }
        else if(s === "F"){ bioSex = "girl"; }

        if(0 <= a && a <= 23){ ageGroup = "infant"; }
        else if(23 < a && a <= 60){ ageGroup = "toddler"; }
        else if(60 < a && a <= 120){ ageGroup = "kid"; }
        else if(120 < a && a <= 228){ ageGroup = "teen"; }

        let blocking = `${bioSex}-${ageGroup}`;

        //Processes the input
        document.getElementById(`${kidID}-disclaimer`).innerHTML = "";

        if(0 <= a && a <= 120) newData(kidID, "w4a", blocking, w, a, validInputW);
        newData(kidID, "h4a", blocking, h, a, (validInputH));
        if(60 < a) newData(kidID, "bmi4a", blocking, bmi, a, (validInputW && validInputH));
        if(0 <= a && a <= 60) newData(kidID, "w4h", blocking, w, h, (validInputW && validInputH));
        
        //Show the ideal weight and height
        let [idealW, idealH] = getIdeal(blocking, a);
        document.getElementById(`${kidID}-ideal-w`).innerHTML = idealW;
        document.getElementById(`${kidID}-ideal-h`).innerHTML = idealH;

        disclaimer(kidID); // Disclaimer

        kidCalc.getElementsByClassName("summary-report")[0].style.display = "block";
    }

    kidCalc.getElementsByClassName("delete-calc")[0].onclick = () => kidCalc.remove(); //Removes the calculator

    return;
}

//Gets the number of kids to be anthropometrically measured
document.getElementById("add-calc").onclick = () => {
    let kidAmount = +`${document.getElementById("kid-amount").value}`;

    if(isNaN(kidAmount)){
        alert("Maglagay lamang po tayo ng numero sa field na ito. Salamat!"); //this
        return;
    }

    for(let i = 0; i < kidAmount; i++){ buildCalc(); }
    window.location.href = "#calculators";

    document.getElementById("kid-amount").value = '';
    document.getElementById("kid-amount-qtn").innerHTML = "Ilan pang bata ang kukuhanan ng <i>nutritional status</i>?";
    return;
}