class Dataset {
    constructor(z, d){
        this.label = (typeof z === "number") ? `${z}SD` : z;
        this.data = d;
        this.fill = false;

        switch(z){
            case -3:
            case 3:
                this.backgroundColor = "#BB342F";
                this.borderColor = "#BB342F";
                break;
            case -2:
            case 2:
                this.backgroundColor = "#DDA448";
                this.borderColor = "#DDA448";
                break;
            case -1:
            case 1:
                this.backgroundColor = "#8CBCB9";
                this.borderColor = "#8CBCB9";
                break;
            case 0:
                this.backgroundColor = "#1B512D";
                this.borderColor = "#1B512D";
                break;
            default: 
                this.backgroundColor = "#000000";
                this.borderColor = "#000000";
                break;
        }
    }
}

let chartList = [];
function configData(canvasID, title, csvData){
    let age = csvData.map((cd) => { return cd.age; }),
        neg_3SD = csvData.map((cd) => { return cd.neg_3SD; }),
        neg_2SD = csvData.map((cd) => { return cd.neg_2SD; }),
        neg_1SD = csvData.map((cd) => { return cd.neg_1SD; }),
        ave_mean = csvData.map((cd) => { return cd.ave_mean; }),
        pos_1SD = csvData.map((cd) => { return cd.pos_1SD; }),
        pos_2SD = csvData.map((cd) => { return cd.pos_2SD; }),
        pos_3SD = csvData.map((cd) => { return cd.pos_3SD; });

    let zscores = [
        new Dataset(-3, neg_3SD),
        new Dataset(-2, neg_2SD),
        new Dataset(-1, neg_1SD),
        new Dataset(0, ave_mean),
        new Dataset(1, pos_1SD),
        new Dataset(2, pos_2SD),
        new Dataset(3, pos_3SD),
    ];

    let canvasChart = new Chart(canvasID, {
        type: "line",
        data: {
            labels: age,
            datasets: zscores,
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    backgroundColor: "#000000",
                },
                title: {
                    display: true,
                    text: title,
                },
            },
        },
    });

    let chart = {
        chartID: canvasID,
        chartVis: canvasChart,
    };

    chartList.push(chart);

    return;
}

function loadData(obj){
    d3
    .csv(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTtU42Ck82OytMrUnVQNKo0A1Uz4XdfJczT8j2x-9rry366zWruZxWA7rZICaTyjB2juMtLgbBxmb0M/pub?gid=${obj.gsID}&single=true&output=csv`)
    .then((csvData) => { configData(obj.canvasID, obj.title, csvData); });

    return;
}

const gSheets = [
    { 
        canvasID: "w4a_girl",
        title: "Weight for Age (F, 0-5 yrs)",
        gsID: 1545525530,
    },
    {
        canvasID: "w4a_boy",
        title: "Weight for Age (M, 0-5 yrs)",
        gsID: 0,
    },
];
for(let i = 0; i < gSheets.length; i++){ loadData(gSheets[i]); }

function newData(h, w, a, s){
    /* Weight for Age */
    let w4aData = [];
    for(let i = 0; i < 61; i++){ (a === i) ? w4aData.push(w) : w4aData.push(null); }

    let w4aDataset = new Dataset("No Z-Score", w4aData);

    let w4aID;
    switch(s){
        case "F":
        case "f":
            w4aID = "w4a_girl";
            break;
        case "M":
        case "m":
            w4aID = "w4a_boy";
            break;
    }

    for(let i = 0; i < chartList.length; i++){
        if(chartList[i].chartID.valueOf() === w4aID){
            let nChart = chartList[i].chartVis;
            nChart.data.datasets.push(w4aDataset);
            nChart.update();

            break;
        }
    }
    
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

document.getElementById("submit").addEventListener('click', () => {
    let h = +`${document.getElementById("height").value}`;
    let w = +`${document.getElementById("weight").value}`;
    let a = +`${document.getElementById("age").value}`;
    let s = document.getElementById("sex").value;

    let bmi = w / (h ** 2);

    document.getElementById("bmi").innerHTML = bmi;

    newData(h, w, a, s);
});
