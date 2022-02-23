/*
    Handles the base data to which user input will be compared to. 
*/

//Processes the base z-score data to something easily configurable
function configData(csvData){
    let x_axis = csvData.map(cd => { return cd.x_axis; }),
        neg_3SD = csvData.map(cd => { return cd.neg_3SD; }),
        neg_2SD = csvData.map(cd => { return cd.neg_2SD; }),
        neg_1SD = csvData.map(cd => { return cd.neg_1SD; }),
        ave_mean = csvData.map(cd => { return cd.ave_mean; }),
        pos_1SD = csvData.map(cd => { return cd.pos_1SD; }),
        pos_2SD = csvData.map(cd => { return cd.pos_2SD; }),
        pos_3SD = csvData.map(cd => { return cd.pos_3SD; });

    let z_scores = [
        new Dataset(-3, neg_3SD),
        new Dataset(-2, neg_2SD),
        new Dataset(-1, neg_1SD),
        new Dataset(0, ave_mean),
        new Dataset(1, pos_1SD),
        new Dataset(2, pos_2SD),
        new Dataset(3, pos_3SD),
    ];

    return [x_axis, z_scores];
}

//List of basis data, grouped by chart
let w4aData = [],
    h4aData = [],
    bmi4aData = [],
    w4hData = [];

//Gets the info for the base z-score charts
function loadData(obj){
    d3
    .csv(`https://docs.google.com/spreadsheets/d/e/2PACX-1vTtU42Ck82OytMrUnVQNKo0A1Uz4XdfJczT8j2x-9rry366zWruZxWA7rZICaTyjB2juMtLgbBxmb0M/pub?gid=${obj.gsID}&single=true&output=csv`)
    .then(csvData => { 
        let bm = obj.canvasID.split("-"),
            zsData = [obj.canvasID, configData(csvData)];
        switch(bm[1]){
            case "w4a":
                w4aData.push(zsData);
                break;
            case "h4a":
                h4aData.push(zsData);
                break;
            case "bmi4a":
                bmi4aData.push(zsData);
                break;
            case "w4h":
                w4hData.push(zsData);
                break;
        }
    });

    return;
}

//List of sheets where base z-score data is stored
const gSheets = [
    //Weight-for-age
    {
        canvasID: "-w4a-boy-toddler",
        title: "Weight for Age (M, 0-5 yrs)",
        gsID: 0,
    },
    { 
        canvasID: "-w4a-girl-toddler",
        title: "Weight for Age (F, 0-5 yrs)",
        gsID: 1545525530,
    },
    {
        canvasID: "-w4a-boy-kid",
        title: "Weight for Age (M, 5-19 yrs)",
        gsID: 1189429997,
    },
    {
        canvasID: "-w4a-girl-kid",
        title: "Weight for Age (F, 5-19 yrs)",
        gsID: 362934378,
    },
    //Height-for-age
    //BMI-for-age
    {
        canvasID: "-bmi4a-girl-toddler",
        title: "BMI for Age (F, 0-5 yrs)",
        gsID: 1204570084,
    },
    {
        canvasID: "-bmi4a-girl-kid",
        title: "BMI for Age (F, 5-19 yrs)",
        gsID: 307989340,
    },
    //Weight-for-height
];
gSheets.forEach(sheet => loadData(sheet));