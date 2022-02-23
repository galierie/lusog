/*
    Handles all z-score chart-related functions.
*/

//Makes datasets for the z-score charts 
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

//List of the base z-score charts, by group
let w4aCharts = [],
    h4aCharts = [],
    bmi4aCharts = [],
    w4hCharts = [];

//Makes the base z-score charts
function baseChart(n, obj, cd){
    let chartID = n + obj.canvasID;
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
                    text: obj.title,
                },
            },
        },
    });

    let bm = obj.canvasID.split("-"),
        chart = {
            chartID: chartID,
            chartVis: canvasChart,
        };

    switch(bm[1]){
        case "w4a":
            w4aCharts.push(chart);
            break;
        case "h4a":
            h4aCharts.push(chart);
            break;
        case "bmi4a":
            bmi4aCharts.push(chart);
            break;
        case "w4h":
            w4hCharts.push(chart);
            break;
    }

    return;
}

//Gets the base z-score chart and adds the user inputs
function inputChart(kidName, anthroID, anthroDataset){
    let chartData, chartList, 
        chartID = kidName + anthroID,
        bm = chartID.split("-");

    switch(bm[1]){
        case "w4a":
            chartData = w4aData;
            chartList = w4aCharts;
            break;
        case "h4a":
            chartData = h4aData;
            chartList = h4aCharts;
            break;
        case "bmi4a":
            chartData = bmi4aData;
            chartList = bmi4aCharts;
            break;
        case "w4h":
            chartData = w4hData;
            chartList = w4hCharts;
            break;
    }

    let nDatasets = chartData.find(cd => cd[0] === anthroID)[1][1].slice();
    nDatasets.push(anthroDataset);

    let chart = chartList.find(cl => cl.chartID === chartID).chartVis;
    chart.data.datasets = nDatasets;
    chart.update();

    return;
}