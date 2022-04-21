/*
    Handles the base data to which user input will be compared to. 
*/

//Processes the base z-score data to something easily configurable
function configData(csvData){
    let x_axis = csvData.map(cd => { return cd.x_axis; }),

        bc = csvData.map(cd => { return cd.bc; }),
        median = csvData.map(cd => { return cd.median; }),
        coeff_var = csvData.map(cd => { return cd.coeff_var; }),

        neg_3SD = csvData.map(cd => { return cd.neg_3SD; }),
        neg_2SD = csvData.map(cd => { return cd.neg_2SD; }),
        neg_1SD = csvData.map(cd => { return cd.neg_1SD; }),
        zeroSD = csvData.map(cd => { return cd.zeroSD; }),
        pos_1SD = csvData.map(cd => { return cd.pos_1SD; }),
        pos_2SD = csvData.map(cd => { return cd.pos_2SD; }),
        pos_3SD = csvData.map(cd => { return cd.pos_3SD; });

    let 
        z_scores = [
            new Dataset(-3, neg_3SD),
            new Dataset(-2, neg_2SD),
            new Dataset(-1, neg_1SD),
            new Dataset(0, zeroSD),
            new Dataset(1, pos_1SD),
            new Dataset(2, pos_2SD),
            new Dataset(3, pos_3SD),
        ],
        lms = [bc, median, coeff_var];

    return [x_axis, z_scores, lms];
}

//List of anthropometric indicators
let atIndic = ["w4a", "h4a", "bmi4a", "w4h"];

//List of basis data, grouped by anthropometric indicator
let w4aData = [],
    h4aData = [],
    bmi4aData = [],
    w4hData = [];

//Pick which basis data
function searchData(anthroType){
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

    return chartData;
}

//Gets the info for the base z-score charts
function loadData(obj){
    d3
    .csv(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTtU42Ck82OytMrUnVQNKo0A1Uz4XdfJczT8j2x-9rry366zWruZxWA7rZICaTyjB2juMtLgbBxmb0M/pub?gid=${obj.gsID}&single=true&output=csv`)
    .then(csvData => { 
        let [anthroType, , ] = obj.canvasID.split("-"),
            zsData = [obj.canvasID, configData(csvData)];
            
        let chartData = searchData(anthroType);
        chartData.push(zsData);
    })
    .catch(() => {
        //alert("Base data cannot be retrieved. Please try again. Thank you.");
    });

    return;
}

//List of sheets where base z-score data is stored
const gSheets = [
    /*
    Object Template
    {
        canvasID: "-${Growth Chart Code}-${girl/boy}-${toddler (0-5 yrs)/kid (5-19 yrs)}",
        title: "${Growth Chart} (${M/F}, ${Age Range} yrs)",
        gsID:
    },
    */

    //Weight-for-age
    { 
        canvasID: "w4a-girl-infant",
        title: "Weight-for-Age (F, 0-2 yrs)",
        gsID: 1545525530,
    },
    { 
        canvasID: "w4a-girl-toddler",
        title: "Weight-for-Age (F, 2-5 yrs)",
        gsID: 1615685772,
    },
    {
        canvasID: "w4a-girl-kid",
        title: "Weight-for-Age (F, 5-10 yrs)",
        gsID: 362934378,
    },
    {
        canvasID: "w4a-boy-infant",
        title: "Weight-for-Age (M, 0-2 yrs)",
        gsID: 0,
    },
    {
        canvasID: "w4a-boy-toddler",
        title: "Weight-for-Age (M, 2-5 yrs)",
        gsID: 1714450265,
    },
    {
        canvasID: "w4a-boy-kid",
        title: "Weight-for-Age (M, 5-10 yrs)",
        gsID: 1189429997,
    },
    
    //Height-for-age
    {
        canvasID: "h4a-girl-infant",
        title: "Height-for-Age (F, 0-2 yrs)",
        gsID: 2081201493,
    },
    {
        canvasID: "h4a-girl-toddler",
        title: "Height-for-Age (F, 2-5 yrs)",
        gsID: 358932355,
    },
    {
        canvasID: "h4a-girl-kid",
        title: "Height-for-Age (F, 5-19 yrs)",
        gsID: 1844474538,
    },
    {
        canvasID: "h4a-boy-infant",
        title: "Height-for-Age (M, 0-2 yrs)",
        gsID: 2024421291,
    },
    {
        canvasID: "h4a-boy-toddler",
        title: "Height-for-Age (M, 2-5 yrs)",
        gsID: 1212513320,
    },
    {
        canvasID: "h4a-boy-kid",
        title: "Height-for-Age (M, 5-19 yrs)",
        gsID: 998321320,
    },

    //BMI-for-age
    {
        canvasID: "bmi4a-girl-infant",
        title: "BMI-for-Age (F, 0-2 yrs)",
        gsID: 1204570084,
    },
    {
        canvasID: "bmi4a-girl-toddler",
        title: "BMI-for-Age (F, 2-5 yrs)",
        gsID: 1658361091,
    },
    {
        canvasID: "bmi4a-girl-kid",
        title: "BMI-for-Age (F, 5-19 yrs)",
        gsID: 307989340,
    },
    {
        canvasID: "bmi4a-boy-infant",
        title: "BMI-for-Age (M, 0-2 yrs)",
        gsID: 1334077550,
    },
    {
        canvasID: "bmi4a-boy-toddler",
        title: "BMI-for-Age (M, 2-5 yrs)",
        gsID: 1308246530,
    },
    {
        canvasID: "bmi4a-boy-kid",
        title: "BMI-for-Age (M, 5-19 yrs)",
        gsID: 1408176015,
    },
    
    //Weight-for-height
    {
        canvasID: "w4h-girl-infant",
        title: "Weight-for-Height (F, 0-2 yrs)",
        gsID: 59739130,
    },
    {
        canvasID: "w4h-girl-toddler",
        title: "Weight-for-Height (F, 2-5 yrs)",
        gsID: 1272831840,
    },
    {
        canvasID: "w4h-boy-infant",
        title: "Weight-for-Height (M, 0-2 yrs)",
        gsID: 1500705257,
    },
    {
        canvasID: "w4h-boy-toddler",
        title: "Weight-for-Height (M, 2-5 yrs)",
        gsID: 901539759,
    },
];
gSheets.forEach(sheet => loadData(sheet));

/*
Sources: 
    https://d3js.org/
    https://www.tutorialsteacher.com/d3js/loading-data-from-file-in-d3js
*/
