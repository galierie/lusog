d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vTtU42Ck82OytMrUnVQNKo0A1Uz4XdfJczT8j2x-9rry366zWruZxWA7rZICaTyjB2juMtLgbBxmb0M/pub?gid=1545525530&single=true&output=csv").then(w4aGirlChart);

function w4aGirlChart(csvData){
    let age = csvData.map((cd) => { return cd.age; });
    let neg_3SD = csvData.map((cd) => { return cd.neg_3SD; });
    let neg_2SD = csvData.map((cd) => { return cd.neg_2SD; });
    let neg_1SD = csvData.map((cd) => { return cd.neg_1SD; });
    let ave_mean = csvData.map((cd) => { return cd.ave_mean; });
    let pos_1SD = csvData.map((cd) => { return cd.pos_1SD; });
    let pos_2SD = csvData.map((cd) => { return cd.pos_2SD; });
    let pos_3SD = csvData.map((cd) => { return cd.pos_3SD; });

    let chart = new Chart("w4a_girl", {
        type: "line",
        data: {
            labels: age,
            datasets: [
                {
                    label: "-3SD",
                    data: neg_3SD,
                    backgroundColor: "#BB342F",
                    borderColor: "#BB342F",
                    fill: false,
                },
                {
                    label: "-2SD",
                    data: neg_2SD,
                    backgroundColor: "#DDA448",
                    borderColor: "#DDA448",
                    fill: false,
                },
                {
                    label: "-1SD",
                    data: neg_1SD,
                    backgroundColor: "#8CBCB9",
                    borderColor: "#8CBCB9",
                    fill: false,
                },
                {
                    label: "Mean",
                    data: ave_mean,
                    backgroundColor: "#1B512D",
                    borderColor: "#1B512D",
                    fill: false,
                },
                {
                    label: "+1SD",
                    data: pos_1SD,
                    backgroundColor: "#8CBCB9",
                    borderColor: "#8CBCB9",
                    fill: false,
                },
                {
                    label: "+2SD",
                    data: pos_2SD,
                    backgroundColor: "#DDA448",
                    borderColor: "#DDA448",
                    fill: false,
                },
                {
                    label: "+3SD",
                    data: pos_3SD,
                    backgroundColor: "#BB342F",
                    borderColor: "#BB342F",
                    fill: false,
                },
            ],
        },
        options: {
            legend: {
                display: true,
                backgroundColor: "#000000",
            },
            title: {
                display: true,
                text: "Weight for Age (F, 0-5 yrs)",
            },
        },
    });

    return chart;
}

/*
Sources: 
    https://www.createwithdata.com/chartjs-and-csv/
    https://www.w3schools.com/ai/ai_chartjs.asp
    https://www.chartjs.org/
    https://d3js.org/
*/

document.getElementById("submit").addEventListener('click', () => {
    let h = +`${document.getElementById("height").value}`;
    let w = +`${document.getElementById("weight").value}`;
    let a = +`${document.getElementById("age").value}`;
    let s = document.getElementById("sex").value;

    let bmi = w / (h ** 2);

    document.getElementById("bmi").innerHTML = bmi;
});
