/*
    Handles all z-score chart-related functions.
*/

//Makes datasets for the z-score charts 
class Dataset {
    constructor(z, d){
        this.label = (typeof z === "number") ? `${z}SD` : z;
        this.data = d;
        this.fill = false;

        let c = "#000000";
        switch(z){
            case -3:
            case 3:
                c = "#BB342F";
                break;
            case -2:
            case 2:
                c = "#DDA448";
                break;
            case -1:
            case 1:
                c = "#8CBCB9";
                break;
            case 0:
                c = "#1B512D";
                break;
        }
        this.backgroundColor = c;
        this.borderColor = c;
    }
}

//List of the base z-score charts, by group
let w4aCharts = [],
    h4aCharts = [],
    bmi4aCharts = [],
    w4hCharts = [];

//Pick a chart
function searchChart(anthroType){
    let chartList;
    switch(anthroType){
        case "w4a":
            chartList = w4aCharts;
            break;
        case "h4a":
            chartList = h4aCharts;
            break;
        case "bmi4a":
            chartList = bmi4aCharts;
            break;
        case "w4h":
            chartList = w4hCharts;
            break;
    }

    return chartList;
}

//Makes the base z-score charts
function baseChart(kidName, sheet, cd){
    let [at, , ] = sheet.canvasID.split("-");
    
    let chartID = `${kidName}-${at}-charts`;
    let canvasChart = new Chart(chartID, {
        type: "line",
        data: {
            labels: cd[1][0],
            datasets: cd[1][1],
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    backgroundColor: "#000000",
                },
                title: {
                    display: true,
                    text: sheet.title,
                },
            },
        },
    });

    let chart = {
        chartID: chartID,
        chartVis: canvasChart,
    };

    let chartList = searchChart(at);
    chartList.push(chart);

    return;
}

//Gets the base z-score chart and adds the user inputs
function inputChart(kidName, anthroID, anthroDataset){
    let [at, bioSex, ageGroup] = anthroID.split("-");

    let chartData = searchData(at), 
        chartList = searchChart(at),
        chartID = `${kidName}-${at}-charts`;

    let nDatasets = chartData.find(cd => cd[0] === anthroID)[1][1].slice();
    nDatasets.push(anthroDataset);

    let chart = chartList.find(cl => cl.chartID === chartID).chartVis;
    chart.data.datasets = nDatasets;
    chart.data.labels = chartData.find(cd => cd[0] === anthroID)[1][0].slice();
    chart.options.plugins.title.text = gSheets.find(sheet => sheet.canvasID === anthroID).title;

    chart.update();

    return;
}

/*
Sources:
    https://www.createwithdata.com/chartjs-and-csv/
    https://www.w3schools.com/ai/ai_chartjs.asp
    https://www.chartjs.org/
*/
