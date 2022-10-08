// =================================================================
// HYPNOTEST.JS
// =================================================================


const awakeState = 0;
const lightState = 1;
const deepState = 2;
const remState = 3;
const dayState = 4;


function initializePage() {

//   startTime = new Date().getTime() - (12 * 3600000);
//   endTime = startTime + (8 * 3600000);
startTime = LastNight(21, 0);
endTime = ThisMorning(6, 30);

console.log("StartTime/EndTime = (" + startTime + "," + endTime + ")");
   var newSleep = SynthHypno(startTime, endTime, 60);

   CreateHypnochron('hypnochron-container', HYPNOGRAM_WIDTH, true, newSleep) 
   CreateHypnogramChart('hypnogram-container', "Synth Sleep Architecture", HYPNOCHRON_WIDTH, newSleep);
   CreateStatsChart('stats-container', "Synth Sleep Architecture", HYPNOSTATS_WIDTH, newSleep);

   testSleepStateFetch();
}

function TestScoreFcn(hypnoScore) {

    var attaBoyText;
console.log("Entered Test Score FCN");

    if (hypnoScore < 70) {
        attaBoyText = "REST UP";
     } else if (hypnoScore < 80) {
        attaBoyText = "NOT BAD";
     } else if (hypnoScore < 90) {
        attaBoyText = "GREAT SLEEP";
     } else {
        attaBoyText = "OPTIMAL!";
     } 
     return(attaBoyText);
}

function createRandomTestScore(hypno, min, max) {

    var testScore = Math.floor(min + Math.random()*(max-min));
    return(testScore);
 }
 
 function createRandomTestStats() {
     const statObj = {total: 8, rem: 1.2, deep: 1.7, awake: 1.1};
     return(statObj);
  }
 
 
  function createCompleteHypno(scoreing, statistics, hypnogram) {
     const h = {};
     h.score = scoreing; 
     h.stats = statistics;
     h.hypno = hypnogram;
     return(h);
  }
  
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  
  
 function createRandomTestHypno(approxOnset, approxAwake) {
     // Pick random start time around the approx onset
     var newHypno = [];
     var newSlice = {};
  
  console.log("CreateTestHypno/n");
  
     startTime = approxOnset + (getRandomInt(3) - 2);  // a random time +/- 2 hours from approxOnset
     endTime = approxAwake + (getRandomInt(3) - 2);  // a random time +/- 2 hours from approxOnset
     sleepSpan = (12 - (startTime % 12)) + endTime;
  
  console.log("StartTime/EndTime/SleepSpan: " + startTime + "/ " + endTime + "/" + sleepSpan);
  
  //newSlice = {state: dayState, start: 0, stop: 12};
  //newHypno.push(newSlice);
  
     // Now artificially advance the time by 3 hours so we don't have to deal with the 12-1 break
     currentTime = startTime;
     currentState = -1;
     sleepTracked = 0;
     while (sleepTracked <= sleepSpan) {
        sleepInterval = (random(55)+5)/60; 
        currentState = pickALikelyState(currentState);
        newSlice = createNewSlice(currentState, currentTime, ((currentTime + sleepInterval) % 13) + Math.floor(((currentTime + sleepInterval) / 13)));
        currentTime = newSlice.stop;
        sleepTracked = sleepTracked + sleepInterval;
        newHypno.push(newSlice);
//        console.log("The new HypnoSlice is: {"+ Math.round(newSlice.state) +"," + Math.round(newSlice.start) + "," + Math.round(newSlice.stop) + "}");
    }
     return (newHypno);
  }
  
  
 function pickALikelyState(currentState) {
     switch (currentState) {
        case -1 : return(awakeState); return;
        case awakeState : return(lightState);
           break;
        case lightState : if (random(2) == 1) { 
                             return(remState);
                          } else {
                             return(deepState);
                          }
           break;
        case deepState : return(lightState);
           break;
        case remState : if (random(2) == 1) return(awakeState);
                          else return(lightState);
           break;      
     }
  }
 
  
 function createNewSlice(newState, newStart, newStop) {
     const newSlice = {state: newState, start: newStart, stop:  newStop};
     return(newSlice);
  }
  
  function random(number) {
    const result = Math.floor(Math.random() * number);
    return result;
  }
 
  function CreateTestSleeps(num) {
     var sleeps = [];
     var testHypno, testScore, testStats;
     for (i=0; i<num; i++) {
       testHypno = createRandomTestHypno(11.0, 6.5)
       testScore = createRandomTestScore(testHypno, 50, 100);
       testStats = createRandomTestStats();
       sleeps.push(createCompleteHypno(testScore, testStats, testHypno));
     }
    return(sleeps);
  }
  
  
function DrawTestSummary(sleep) {
    var targetDivEl = document.getElementById('summary-container');
    var buf = "";
 
    var wake = CountStateTime('Wake', JSON.parse(sleep.hypno)); 
    var light = CountStateTime('Light', JSON.parse(sleep.hypno)); 
    var rem = CountStateTime('REM', JSON.parse(sleep.hypno)); 
    var deep = CountStateTime('Deep', JSON.parse(sleep.hypno)); 
 
    buf += "Wake: " +  MStoHours(wake) + "<br>"; 
    buf += "Light: " + MStoHours(light) + "<br>"; ; 
    buf += "Deep: " + MStoHours(deep) + "<br>"; ; 
    buf += "REM: " + MStoHours(rem) + "<br>"; ; 
 
    targetDivEl.innerHTML = buf;
 }
 