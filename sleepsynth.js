// JAVASCRIPT CODE and Data for Sleep Averages by Age

// Population Data Sleep Averages by Age
sleepAvgTable = [ {Age: 5, TST: 536, Deep: 193, REM: 108, Light: 235, WakeT: 6, WakeN: 0, Onset: 0},
  {Age: 10, TST: 525, Deep: 156, REM: 115, Light: 254, WakeT: 10, WakeN: 1, Onset: 5},
  {Age: 15, TST: 465, Deep: 107, REM: 102, Light: 256, WakeT: 16, WakeN: 2, Onset: 5},
  {Age: 25, TST: 430, Deep: 74, REM: 100, Light: 256, WakeT: 20, WakeN: 3, Onset: 10},
  {Age: 35, TST: 396, Deep: 57, REM: 91, Light: 248, WakeT: 23, WakeN: 4, Onset: 10},
  {Age: 45, TST: 380, Deep: 60, REM: 83, Light: 237, WakeT: 39, WakeN: 5, Onset: 20},
  {Age: 55, TST: 380, Deep: 72, REM: 83, Light: 225, WakeT: 49, WakeN: 6, Onset: 30},
  {Age: 65, TST: 364, Deep: 49, REM: 70, Light: 245, WakeT: 61, WakeN: 5, Onset: 250},
  {Age: 75, TST: 343, Deep: 42, REM: 66, Light: 235, WakeT: 78, WakeN: 5, Onset: 20},
  {Age: 85, TST: 319, Deep: 20, REM: 69, Light: 230, WakeT: 82, WakeN: 5, Onset: 10},
];

// Helper-function:  Performs simple linear interpolation between two points for a value X to determine it's y
function linearInterpolate(x, x1, x2, y1, y2) {
  const m = (y2-y1)/(x2-x1);
  const y = y1 + m * (x-x1);
  return (y);
}

// Returns an sleep object containing sleep values for the specified age which corresponds to a row in the table "table"
// Performs linear interpolation to determine values that fall between specified ages in the table
function fetchSleepStats(table, age) {
  // handle age LOW-out-of-range case
  if (age <= table[0].Age) 
    return(table[0]);
  else {
    // Find closest 2 ages and interpolate
    for (i=0; i<table.length; i++) {
      if (age == table[i].Age) 
        return(table[i]);  // Lucky, right on the age table entry!
      else if (age < table[i].Age) {
        // Create linear interpolation for answer
        const newTableEntry = 
            {Age: age, 
             TST: linearInterpolate(age, table[i].Age, table[i-1].Age, table[i].TST, table[i-1].TST),  
             Deep: linearInterpolate(age, table[i].Age, table[i-1].Age, table[i].Deep, table[i-1].Deep),
             REM: linearInterpolate(age, table[i].Age, table[i-1].Age, table[i].REM, table[i-1].REM),
             Light: linearInterpolate(age, table[i].Age, table[i-1].Age, table[i].Light, table[i-1].Light),
             WakeT: linearInterpolate(age, table[i].Age, table[i-1].Age, table[i].WakeT, table[i-1].WakeT),
             WakeN: linearInterpolate(age, table[i].Age, table[i-1].Age, table[i].WakeN, table[i-1].WakeN),
             Onset: linearInterpolate(age, table[i].Age, table[i-1].Age, table[i].Onset, table[i-1].Onset)};
        return newTableEntry;
     ``}
    }
    // Didn't find value, assume HIGH-out-of-range
    return(table[table.length-1]);
  }
}

// Nifty higher order helper function ath applies the Function "f" (e.g. "min") to the values with property "objProp" in a list of objects
function fcnOfObjList(f, objList, objProp) {
  const max = Math[f](...objList.map(item => item[objProp]));
  return(max);
}

// Given a "table" that is a list of sleep data objects,  an age correspondind to a row in the table with property "Age", a sleep stat property name 
// "stat" and a percentile "percentile" returns a list of the {min, max, lowBand, center, highBand} for that age and stat
// For example, ageRangeBand(sleepAvgs, 55, "REM", 15) returns the min and max of REM for all ages as well as the average (Center) and 15th precentiles bands
function ageRangeBand(table, age, statName, percentile) {
  const min = fcnOfObjList("min", table, statName);
  const max = fcnOfObjList("max", table, statName);
  const sleepForAge = fetchSleepStats(table, age);
  const center = sleepForAge[statName];
  const left = Math.max(0, center - (percentile/100 * (max-min))); 
  const right = center + (percentile/100 * (max-min));
  return([min, max, Math.round(left), Math.round(center), Math.round(right)]);
}

// Test function for testing sleep data functions
function testSleepStateFetch() {
  console.log("Testing Sleep Table Functions...");
  const sleepFor50YearOld = fetchSleepStats(sleepAvgTable, 50);
  console.log("Sleep Averages for a 50 Year Old: " + JSON.stringify(sleepFor50YearOld));
  const rangeREM = ageRangeBand(sleepAvgTable, 50, "REM", 10);
  console.log("10% REM Range Bands for a 50 Year Old: " + JSON.stringify(rangeREM));
  const rangeDeep = ageRangeBand(sleepAvgTable, 60, "Deep", 20);
  console.log("20% REM Range Bands for a 60 Year Old: " + JSON.stringify(rangeDeep));

  // Now test sleep cycle distribution
  var phases;
  // This is how we'll distribute sleep for those with 5 cycles ()
  phases = distribute(5, 2.4, 6, 110);
  console.log("Distribute Sleep Buckets (4, 3, 4, 110)= " + JSON.stringify(phases));

  mapSleepPhases(50);
}

// Distribute 'T' into 'b' buckets returning an array of length 'len' using distribution coefficient 'a'
// Formula (SUM n=1 to n=b (a^nx)) = T
function distribute(b, a, n, t) {
  var arr = [];
  var sum = 0;
  if (b <= n) targetB = b; else targetB=n;  // can't divide into more buckets than we come in with
  for (i=0; i<n; i++) {
    if (i<targetB) 
      sum += a**(i+1);
    arr.push(0);
  }
  const x = t/sum;
  // Now calc and assign bucket #s
  for (j=0; j<targetB; j++)
    arr[targetB-j-1] = Math.round(a**(j+1) * x);
  // Lastly, clean up rounding errors
  arr[0] -= arraySum(arr) - t;

  return(arr);
}

// MapSleepPhases -- for each phase of sleep, map phases based on age table
function mapSleepPhases(age) {
  const sleepRec = fetchSleepStats(sleepAvgTable, age);
  console.log("Sleep Averages for " + age + " Year Old: " + JSON.stringify(sleepRec));
  // Looks like this object:  {Age: 45, TST: 380, Deep: 60, REM: 83, Light: 237, WakeT: 39, WakeN: 5, Onset: 20}
  const numCycles = Math.ceil(sleepRec.TST/90);
  console.log("Total Slee Time (TST): " + sleepRec.TST + " (" + sleepRec.TST/90 + ")");
  console.log("Total Sleep Cycles: " + numCycles);
  var a, b;  // control variables for distribution of sleep states into cycles
  if (numCycles > 5) b = 4; else b = 3;
  a = 2.2; 
  deepBins = distribute(b, a, numCycles, sleepRec.Deep);
  console.log("Deep:" + JSON.stringify(deepBins));
  REMbins = distribute(b, a, numCycles, sleepRec.REM);
  REMbins.reverse();
  console.log("REM:" + JSON.stringify(REMbins));

}


function SynthHypno(startTime, endTime, age) {
  const sleepArch = {hypno: []};
  const cycleStates = ["Wake", "Light", "Deep", "REM"];
  var h;
  var sleepState;

  // Cycle through as many 'P90' cycles as we need to to fill in between 'startTime' and 'endTime' with sleep states
  h = [];
  cycleNo = 0;
  var now = startTime;
  while (now < endTime) {

    for (phase=0; phase < cycleStates.length; phase++) {
      sleepState = createSleepState(cycleStates[phase], cycleNo, now, age); 
      now = sleepState.y[1];
      if (now >= endTime) {
        console.log("----------------------Breaking cycle to WAKE!!!")
        sleepState.y[1] = endTime; 
        h.push(sleepState);
        h.push({x: "Wake", y: [endTime-1, endTime]});
        break;
      }
      h.push(sleepState);
    }
    cycleNo++
    console.log("SynthHypno Cycle #" + cycleNo);
  }
  // To make the format match what Jack's APIs return
  sleepArch.hypno = JSON.stringify(h);

  // Stuff some values into the rest of the Sleep Arch object
  sleepArch.score = 90;
  //   sleepArch.tst = 7 * (60 * 60 * 1000);
  sleepArch.tst = h[h.length-1].y[1] - h[0].y[0];
console.log("==>TST == " + sleepArch.tst/3600000);
  sleepArch.timedeep = CountStateTime("Deep", h);
console.log("==>Deep == " + sleepArch.timedeep/3600000);

  //   sleepArch.timedeep =1.2 * (60 * 60 * 1000);
  sleepArch.timerem = CountStateTime("REM", h);
  sleepArch.timeawake = CountStateTime("Wake", h);

  return(sleepArch)
}

// Synthesizes a SleepArchitecture object based on population data averages and demographic information, and then 'warps'
// this sleep architecture based on the customer-subjective "feel" information
// startTime/endTime :  epoch millisecond start/end times
// age : years
function RoughSynthHypno(startTime, endTime, age) {
  const sleepArch = {hypno: []};
  const cycleStates = ["Wake", "Light", "Deep", "REM"];
  var h;
  var sleepState;

  // Cycle through as many 'P90' cycles as we need to to fill in between 'startTime' and 'endTime' with sleep states
  h = [];
  cycleNo = 0;
  var now = startTime;
  while (now < endTime) {

    for (phase=0; phase < cycleStates.length; phase++) {
      sleepState = createSleepState(cycleStates[phase], cycleNo, now, age); 
      now = sleepState.y[1];
      if (now >= endTime) {
        console.log("----------------------Breaking cycle to WAKE!!!")
        sleepState.y[1] = endTime; 
        h.push(sleepState);
        h.push({x: "Wake", y: [endTime-1, endTime]});
        break;
      }
      h.push(sleepState);
    }
    cycleNo++
    console.log("SynthHypno Cycle #" + cycleNo);
  }
  // To make the format match what Jack's APIs return
  sleepArch.hypno = JSON.stringify(h);

  // Stuff some values into the rest of the Sleep Arch object
  sleepArch.score = 90;
  //   sleepArch.tst = 7 * (60 * 60 * 1000);
  sleepArch.tst = h[h.length-1].y[1] - h[0].y[0];
  sleepArch.timedeep = CountStateTime("Deep", h);
  //   sleepArch.timedeep =1.2 * (60 * 60 * 1000);
  sleepArch.timerem = CountStateTime("REM", h);
  sleepArch.timeawake = CountStateTime("Wake", h);

  return(sleepArch)
}

function createSleepState(state, cycleNo, t, age) {
  const millisecToMin = 60000;
  var start, end;

  switch (state) {
    case "Wake"  : 
        start = t;    // wake goes up with age
        ageCycleMins = (9 * age/10)/(8);
        end = t + (millisecToMin * (ageCycleMins + getRandomInt(5)));
        break;
    case "Light" :
        start = t;
        end = t + (millisecToMin * (40 + getRandomInt(5)));
        break;
    case "Deep" :
        start = t;
        deepCycleMins = (160 - age/10)/(4*3*2);   // deep goes down with age
        end = t + (millisecToMin * (Math.floor(6 - cycleNo) * deepCycleMins)); 
        break;
    case "REM" :
        start = t;
        end = t + (millisecToMin * ((cycleNo*10) + getRandomInt(5)));
        break;
  }
  return({x: state, y: [start, end]});
}

function CountStateTime(state, h) {
  var total = 0;
  h.forEach(element => {
    if (element.x == state) {
      total += (element.y[1] - element.y[0]);
    }
  });
  return(total);
}


// ==========================================================================================
//  UTILITY FUNCTIONS 
// ==========================================================================================


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//Helper functino that returns utc epoch time corresponding to Last Night at Hour 
/*
function LastNight(hour, min, ampm) {
  const startDate = new Date();
  var offset;
  if (ampm == "am") offset = 12;
  else offset = 24; 
  startDate.setHours(startDate.getHours() -offset);  // go back a day
  startDate.setHours(hour, min, 0);
  console.log("Last Night =" + startDate.toLocaleString());
return startDate.getTime();
}
*/

// Returns a Date object with yesterday's date and the hour and min (military time)
function LastNight(hour, min) {
  // assume PM
  var previous = new Date();
  previous.setDate(previous.getDate() - 1);
  previous.setHours(hour);
  previous.setMinutes(min);
  return previous.getTime();
}

//Helper functino that returns utc epoch time corresponding to Last Night at Hour 
function ThisMorning(hour, min) {
  // assumes 'am'
  const startDate = new Date();
  startDate.setHours(hour, min, 0);
  console.log("This Morning =" + startDate.toLocaleString());
  return startDate.getTime();
}


// Helper function to sum an array
function arraySum(arr) {
  return(arr.reduce((a, i)=>a+i,0));
}