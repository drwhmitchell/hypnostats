// =================================================================
// HYPNOGRAM.JS 
// =================================================================
// 
// Two main functions:  CreateHypnoChart and CreateStatsChart
//
// Both functions take as input 
//  ID - the ID of a DIV element to draw the chart in
//  Title - an optional title string for the chart
//  Width - Width of the chart (which determines its height as well)
//  Sleep - a sleep object  (see HYPNOCHRON.JS)
//



// Dynamically creates a chart sleep data (Hypno, Asleep) added on the to the DOM element passed in
// Returns a ref to the chart object so that it can be cleaned up
function CreateHypnogramChart(chartContainerID, titleText, width, sleepArch) {
  const NULL_COLOR = '#FFFFFF';
  const DEEP_COLOR = '#27487C';
  const LIGHT_COLOR = '#458EC3';
  const REM_COLOR = '#6ECCFF';
  const WAKE_COLOR = '#F2F4F6';
  const stateColors = [NULL_COLOR, DEEP_COLOR,LIGHT_COLOR,REM_COLOR,WAKE_COLOR];

  const hypno = JSON.parse(sleepArch.hypno);  // necessary because the Sleep structured is 'double stringified'...don't ask :-)
  const startTime = hypno[0].y[0];
  const endTime = hypno[hypno.length-1].y[1];
  console.log("CreateHypnoChart with Start/End=" + startTime + "-" + endTime);

  var marshalledHypno = marshallSleepNetHypno(JSON.parse(sleepArch.hypno));
  var deSteppedHypno = DeStepHypno(marshalledHypno);
  console.log("DE-STEPPED DATA =" + JSON.stringify(deSteppedHypno));
  var newChartElID = "hypnoChart" + Math.random()*10;
  var chartsHTML = document.getElementById(chartContainerID);
  var newHTMLbuf = [];

 // const skipped = (ctx, value) => {console.log("Skipped (" + ctx.p0.parsed.y + "," + ctx.p1.parsed.y + ")"); return(ctx.p0.skip || ctx.p1.skip ? value : undefined);};
  const down = (ctx, value) => {ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined};

  const HorizBorderCol = (ctx, value) => {
    if (ctx.p0.parsed.x == ctx.p1.parsed.x) 
      return('#458EC3'); // gray for the vertical segments

    else {
      return stateColors[ctx.p0.parsed.y];
    }
    return("#afb3bd");
  }

  const BorderWidth = (ctx) => {
    if (ctx.p0.parsed.x == ctx.p1.parsed.x) 
      return(2); // thin line for verticals
    else 
      return(15);
  }

  newHTMLbuf += "<canvas id='hypnogram-canvas' width='" + width + "' height='" + 250 + "'></canvas>";
  chartsHTML.innerHTML += newHTMLbuf;   // Append the new HTML
 // console.log("Creating new Chart='" + newChartElID + "'");
  var ctx = document.getElementById('hypnogram-canvas').getContext('2d');
  const hypnoChart = new Chart(ctx, {
    data: {
        datasets: [{
            type: 'line',
            label: 'Sleep State',
            yAxisID: 'SleepState',
            segment: {
              borderColor: ctx => HorizBorderCol(ctx, '#6fdcea') || VertBorderCol(ctx, 'rgb(192,75,75)'),
              borderWidth: ctx => BorderWidth(ctx),
              borderRadius: 20,
            },
            borderWidth : getLineWidth(ctx),
            fill: false,
            radius: 0,
            data : deSteppedHypno,
          }],
      },
      options: {
        layout: {
          padding: { top: -50, right: 25, left: 20 }
        },
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend : {
            display: false,
          },
          title: {
            display: true,
//          text: titleText,
            font : { size: 18},
          }
        },
        scales: {
          x: {
            grid : {
              borderColor: '#F2F4F6',
              display: true,
              drawTicks: true,
              tickColor: '#F2F4F6',
              tickLength: 5
            },
            min: startTime,
            max: endTime,
            display: true,
            type: 'time',
            time: {
              unit: 'hour',  
              displayFormats: {
                hour: 'h a'
              }
            },
            ticks: {
              color : '#F2F4F6',
              maxRotation: 0,
              autoSkip : true,
              autoSkipPadding : 5
            }
          },
          SleepState: {
            type: 'linear',
            display: true,
            title: {
 //           display : true,
              text : 'Sleep State',
              font : { size: 18 },
            },
            position: 'left',
            min: 0.5,
            max: 4,
            ticks: {
            color : [DEEP_COLOR, LIGHT_COLOR, REM_COLOR, WAKE_COLOR],
//              color : stateColors,
              beginAtZero: true,
              min: 0,
              max: 4,
              stepSize: 1,
              callback: function(label, index, labels) {
                switch (label) {
                  case 0:
                    return '';
                  case 1:
                    return 'DEEP';
                  case 2:
                    return 'LIGHT';
                   case 3:
                    return 'REM';
                  case 4:
                    return 'WAKE';
                }
              }
            }
          }
        }
      }
  })
  return hypnoChart;
}

function CreateStatsChart(chartContainerID, titleText, width, sleepArch) {
  console.log("Creating STATS CHART");
  
  const stateColors = ["#FFFFFF","#6ECCFF","#458EC3","#27487C"];
//  const stateColors = ["#27487C", "#458EC3", "#6ECCFF", "#FFFFFF"];
  var statsData = CalcStatsData(JSON.parse(sleepArch.hypno));
  var chartsHTML = document.getElementById(chartContainerID);
  var newHTMLbuf = [];
  var newChartElID = chartContainerID + "-canvas";
 // newHTMLbuf += "<canvas id='" + newChartElID + "' style='width:400px; height:125px;'></canvas>";

  newHTMLbuf += "<canvas id='stats-canvas' width='" + width + "' height='" + 150 + "'></canvas>";

//  console.log("STATS Chart container='" + chartContainerID + "'");
  newHTMLbuf += "<hr>";
  chartsHTML.innerHTML += newHTMLbuf;   // Append the new HTML
  console.log("Creating new Stats Chart");

  const data = {
    labels: ["WAKE", "REM", "LIGHT", "DEEP"],
//    labels: ["DEEP", "LIGHT", "REM", "WAKE"],

    datasets: [
      {
        categoryPercentage: 0.8,
        barPercentage: 1.1,
        axis: 'y',
        label: 'Stats',
        display: false,
        data: statsData,
        datalabels: {
          align: 'center',
          color: ['black', 'black', 'white', 'white'],
          formatter: function(value, context) {
            return MarshallTimeForDisplay(value * 60) + (value < 1 ? ' min' : ' hr');   
          }
        },
        fill: false,
        backgroundColor: stateColors,
      }]
  };
  const options = {
      indexAxis: 'y',
      barThickness: 'flex',
      maxBarThickness: 35,
      elements: {
        bar: {
          borderWidth: 2,
        },
      },
      layout: {
        padding: {
            right: 25,
            left: 20,
        }
      },
      scales: {
        x: {         
          display: false,
          ticks: {
            },
        },
        y: {

          display: true,
          ticks: {
            callback: function(val, index) {
              // Hide every 2nd tick label
              return this.getLabelForValue(val);
            },
            color: stateColors,
          },
        },
      },
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
          text: 'Stats Bar Chart'
        }
      },
    };

  var ctx = document.getElementById('stats-canvas').getContext('2d');
  const statsChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    plugins: [ChartDataLabels],
    options: options,
  });
  return(statsChart);
}

// Convert a sleepnet hypno into a hypno we can plot in a stepline chart
function marshallSleepNetHypno(hypno) { 
  const hypnoState = ["Day","Deep", "Light", "REM", "Wake"];
  var newHypno = [];

  hypno.forEach((el, i) => {
    newHypno.push({x: el.y[0], y: hypnoState.indexOf(el.x)});
  });
  newHypno.sort((a, b) => {return a.x - b.x});  // sort the new array

  newHypno.forEach((el, i) => {el.x = new Date(el.x).toLocaleString()});    // now change from epoch secs to real dates

  // Finally, add a record onto the end that makes the Hypno work because the final element is there...
  newHypno.push({x: new Date(hypno[hypno.length-1].y[1]).toLocaleString(), y: hypnoState.indexOf(hypno[hypno.length-1].x)});
  console.log("NEW HYPNO =: " + JSON.stringify(newHypno));
  return(newHypno);
}


function getLineWidth(ctx) {

  const index = ctx.dataIndex;
  const lineWidth = index %2 ? 1 : 4;
  ctx.lineWidth = lineWidth;
  return (lineWidth);
}

function getLineColor(ctx) {
  console.log("Entering GetLineColor");

  const index = ctx.datasetIndex;
  if (index == undefined) return("#FFFFFF");
  
  const lineColor = index %2 ? "#6fdcea" : "#FFFFFF";
  console.log("GetLineColor [" + index + "] == " + lineColor);
    return (lineColor);
};

// Artificially recasts the hypno data so that it does a "stepline" chart when displayed as a scatter plot instead of what would normally happen
function DeStepHypno(hypno) {
  var newHypno = [];
  var len = hypno.length;
  for (i=0; i<len-1; i++) {
    newHypno.push({x: hypno[i].x, y: hypno[i].y});
    newHypno.push({x: hypno[i+1].x, y: hypno[i].y});  // Artificial segment
  }
  return(newHypno);
}

function ToHours(ms) {
  return (ms/3600000).toFixed(2);  
}

// Calcs the data for the hypno and sets it for the hypno object
function CalcStatsData(hypno) {
  console.log("Calcing Stats Data...");
  var wake = CountStateTime("Wake", hypno);
  var wake = CountStateTime("Wake", hypno);

  hypno.score = 90;
  hypno.tst = (hypno[hypno.length-1].y[1] - hypno[0].y[0])/3600000;
  console.log("Stats Data TST=" + hypno.tst);
  hypno.timedeep = CountStateTime("Deep", hypno);
  hypno.timelight = CountStateTime("Light", hypno);
  hypno.timerem = CountStateTime("REM", hypno);
  hypno.timeawake = CountStateTime("Wake", hypno);
  return([ToHours(hypno.timeawake), ToHours(hypno.timerem), ToHours(hypno.timelight), ToHours(hypno.timedeep)])
}



// Helper Functions

function epochTimeToHours(epochTime) {
  var elapsedHrs = Math.floor(epochTime/3600000);
  var elapsedMin = Math.floor(((epochTime/3600000) - elapsedHrs) * 60);
  return(elapsedHrs.toString() + ":" + elapsedMin.toString().padStart(2, '0'));
}
