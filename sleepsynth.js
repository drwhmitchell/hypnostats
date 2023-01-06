// JAVASCRIPT CODE and Data for Sleep Averages by Age

// Population Data Sleep Averages by Age
sleepAvgTable = [ {Age: 5, TST: 536, Deep: 193, REM: 108, Light: 235, WakeT: 6, WakeN: 0, Onset: 0, InBed: 23.35},
  {Age: 10, TST: 525, Deep: 156, REM: 115, Light: 254, WakeT: 10, WakeN: 1, Onset: 9, InBed: 23.35},
  {Age: 15, TST: 465, Deep: 107, REM: 102, Light: 256, WakeT: 16, WakeN: 2, Onset: 10, InBed: 23.35},
  {Age: 25, TST: 430, Deep: 74, REM: 100, Light: 256, WakeT: 20, WakeN: 3, Onset: 9, InBed: 23.35},
  {Age: 35, TST: 396, Deep: 57, REM: 91, Light: 248, WakeT: 23, WakeN: 4, Onset: 9, InBed: 23.35},
  {Age: 45, TST: 380, Deep: 60, REM: 83, Light: 237, WakeT: 39, WakeN: 5, Onset: 8, InBed: 23.35},
  {Age: 55, TST: 380, Deep: 72, REM: 83, Light: 225, WakeT: 49, WakeN: 6, Onset: 6, InBed: 23.35},
  {Age: 65, TST: 364, Deep: 49, REM: 70, Light: 245, WakeT: 61, WakeN: 5, Onset: 9, InBed: 23.35},
  {Age: 75, TST: 343, Deep: 42, REM: 66, Light: 235, WakeT: 78, WakeN: 5, Onset: 11, InBed: 23.35},
  {Age: 85, TST: 319, Deep: 20, REM: 69, Light: 230, WakeT: 82, WakeN: 5, Onset: 13, InBed: 23.35},
];

const AWAKE_BIN = 0;
const LIGHT_BIN = 1;
const DEEP_BIN = 2;
const REM_BIN = 3;

// Helper-function:  Performs simple linear interpolation between two points for a value X to determine it's y
function LinearInterpolate(x, x1, x2, y1, y2) {
  const m = (y2-y1)/(x2-x1);
  const y = y1 + m * (x-x1);
  return (y);
}

// Returns an sleep object containing sleep values for the specified age which corresponds to a row in the table "table"
// Performs linear interpolation to determine values that fall between specified ages in the table
function FetchSleepStats(table, age) {
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
             TST: LinearInterpolate(age, table[i].Age, table[i-1].Age, table[i].TST, table[i-1].TST),  
             Deep: LinearInterpolate(age, table[i].Age, table[i-1].Age, table[i].Deep, table[i-1].Deep),
             REM: LinearInterpolate(age, table[i].Age, table[i-1].Age, table[i].REM, table[i-1].REM),
             Light: LinearInterpolate(age, table[i].Age, table[i-1].Age, table[i].Light, table[i-1].Light),
             WakeT: LinearInterpolate(age, table[i].Age, table[i-1].Age, table[i].WakeT, table[i-1].WakeT),
             WakeN: LinearInterpolate(age, table[i].Age, table[i-1].Age, table[i].WakeN, table[i-1].WakeN),
             Onset: LinearInterpolate(age, table[i].Age, table[i-1].Age, table[i].Onset, table[i-1].Onset), 
             InBed: LinearInterpolate(age, table[i].Age, table[i-1].Age, table[i].InBed, table[i-1].InBed), 
            };
        return newTableEntry;
     ``}
    }
    // Didn't find value, assume HIGH-out-of-range
    return(table[table.length-1]);
  }
}

// Nifty higher order helper function ath applies the Function "f" (e.g. "min") to the values with property "objProp" in a list of objects
function FcnOfObjList(f, objList, objProp) {
  const max = Math[f](...objList.map(item => item[objProp]));
  return(max);
}

// Given a "table" that is a list of sleep data objects,  an age correspondind to a row in the table with property "Age", a sleep stat property name 
// "stat" and a percentile "percentile" returns a list of the {min, max, lowBand, center, highBand} for that age and stat
// For example, ageRangeBand(sleepAvgs, 55, "REM", 15) returns the min and max of REM for all ages as well as the average (Center) and 15th precentiles bands
function AgeRangeBand(table, age, statName, percentile) {
  const min = FcnOfObjList("min", table, statName);
  const max = FcnOfObjList("max", table, statName);
  const sleepForAge = FetchSleepStats(table, age);
  const center = SleepForAge[statName];
  const left = Math.max(0, center - (percentile/100 * (max-min))); 
  const right = center + (percentile/100 * (max-min));
  return([min, max, Math.round(left), Math.round(center), Math.round(right)]);
}

// Test function for testing sleep data functions
function TestSleepStateFetch() {
  console.log("Testing Sleep Table Functions...");
  const sleepFor50YearOld = FetchSleepStats(sleepAvgTable, 50);
  console.log("Sleep Averages for a 50 Year Old: " + JSON.stringify(sleepFor50YearOld));
  const rangeREM = AgeRangeBand(sleepAvgTable, 50, "REM", 10);
  console.log("10% REM Range Bands for a 50 Year Old: " + JSON.stringify(rangeREM));
  const rangeDeep = AgeRangeBand(sleepAvgTable, 60, "Deep", 20);
  console.log("20% REM Range Bands for a 60 Year Old: " + JSON.stringify(rangeDeep));
  // Now test sleep cycle distribution
  var phases;
  // This is how we'll distribute sleep for those with 5 cycles ()
  phases = Distribute(5, 2.4, 6, 110);
  console.log("Distribute Sleep Buckets (5, 2.4, 6, 110)= " + JSON.stringify(phases));

  MapSleepPhases(20);
}

// Distribute 'T' into 'b' buckets returning an array of length 'len' using distribution coefficient 'a'
// Formula (SUM n=1 to n=b (a^nx)) = T
function Distribute(b, a, n, t) {
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
function MapSleepPhases(sleepRec) {
  console.log("Sleep Averages for " + sleepRec.Age + " Year Old: " + JSON.stringify(sleepRec));
  // Looks like this object:  {Age: 45, TST: 380, Deep: 60, REM: 83, Light: 237, WakeT: 39, WakeN: 5, Onset: 20}
  const numCycles = Math.ceil((sleepRec.TST + sleepRec.WakeT)/90);
  console.log("Total Sleep Time (TST): " + sleepRec.TST + " (" + sleepRec.TST/60 + ")");
  console.log("Total Sleep Cycles: " + numCycles);
  // Need this to fixup last cycle -- since we use 90 min cycle times and fill with Light we'll have extra light sleep
  var totalTimeInBedTime = sleepRec.TST + sleepRec.WakeT +sleepRec.Onset;
  var excessLightSleep = (90 * numCycles) - totalTimeInBedTime;

  var a, b;  // control variables for distribution of sleep states into cycles
  b= (numCycles > 5) ? 4 : 3;
  a = 2.2; 
  deepBins = Distribute(b, a, numCycles, sleepRec.Deep);
  console.log("Deep:" + JSON.stringify(deepBins));
  a = 1.3;  // less agressive tilt in REM than DEEP
  REMbins = Distribute(numCycles-1, a, numCycles, sleepRec.REM);
  REMbins.reverse();
  console.log("REM:" + JSON.stringify(REMbins));
  // This is tricky....the initial wake cycle has to have Onset time, the rest is distributed
  awakeBins = Distribute(numCycles-1, 1.2, numCycles, sleepRec.WakeT);
  awakeBins.reverse();   /* More awakes later in the night */
  awakeBins[0] = sleepRec.Onset;
console.log("AWAKE BINS ==> " + JSON.stringify(awakeBins));

  console.log("Awake:" + JSON.stringify(awakeBins));
  // Now figure out Light Sleep == 90 - (Deep + REM + Awake)
  var lightBins = [];
  for (i=0; i<numCycles; i++) {
    lightBins.push(Math.max(0, 90-(deepBins[i]+REMbins[i]+awakeBins[i])));
  }
  console.log("Light:" + JSON.stringify(lightBins));
  var netBins = []
  for (i=0; i<numCycles; i++) {
    if (i == numCycles - 1) 
      // Special case for the last cycle
      netBins.push([awakeBins[i], Math.max(0, lightBins[i] - excessLightSleep), deepBins[i], REMbins[i]]);
    else
      netBins.push([awakeBins[i], lightBins[i], deepBins[i], REMbins[i]]);
  }

  return(netBins);
}


// Given a starting time and sleep bins for each phase, generate a Hypno and return it
function SynthHypno(inBed, sleepBins) {
  console.log("SynthHypno() with:" + inBed + ", " + sleepBins);
  var sleepArch = {hypno: []};
  const cycleStates = ["Wake", "Light", "Deep", "REM"];
  var h;
  var sleepState;
//  var startTime = eval.InBed;
//  var endTime = eval.Wakeup;

var startTime = LastNight(Math.floor(inBed), Math.floor((inBed - Math.floor(inBed)) * 60));
var st = new Date(startTime);
  console.log("Start Time=" + startTime + " which is " + st.toTimeString() + " for InBed= " + eval.InBed);
//  var eT = endTMilFraction(eval.InBed, sleepRec.Onset + sleepRec.TST + sleepRec.WakeT);
//  console.log("eT/endTMilFraction = " + eT + "/" + eT.toFixed(2));
 // var endTime = ThisMorning(Math.floor(eT), Math.floor((Math.floor(eT) - eT) * 60));
//var endTime = ThisMorning(Math.floor(eval.Wakeup), Math.floor((Math.floor(eval.Wakeup) - eval.Wakeup) * 60));
//  console.log("End Time=" + endTime);

  h = [];
  var now = startTime;
  for (cycle=0; cycle<sleepBins.length; cycle++) {
    for (phase=0; phase < cycleStates.length; phase++) {
  //    console.log("New Sleep State " + cycle + "/" + phase);
      h.push({x: cycleStates[phase], y: [now, now + (sleepBins[cycle][phase] * 60000)]});
      now = now + (sleepBins[cycle][phase] * 60000);
    }
  }
 // console.log("Sleep Arch = " + JSON.stringify(h));
  // To make the format match what Jack's APIs return
  sleepArch.hypno = JSON.stringify(h);

    // Stuff some values into the rest of the Sleep Arch object
    //   sleepArch.tst = 7 * (60 * 60 * 1000);
    sleepArch.tst = h[h.length-1].y[1] - h[0].y[0];
  console.log("==>TST == " + sleepArch.tst/3600000);
    sleepArch.timedeep = CountStateTime("Deep", h);
  console.log("==>Deep == " + sleepArch.timedeep/3600000);
  
    //   sleepArch.timedeep =1.2 * (60 * 60 * 1000);
    sleepArch.timerem = CountStateTime("REM", h);
    sleepArch.timeawake = CountStateTime("Wake", h);
    numawakes = CountBinStates(sleepBins, AWAKE_BIN);  // Is numAwakes really not part of the sleepArch?

    sleepArch.score = SleepScore(sleepArch.tst, sleepArch.timerem, sleepArch.timedeep, numawakes, sleepArch.timeawake);


  return (sleepArch);

}

function ScaleBins(bins, scaleFactor) {
  const newBinList = [];
  for (i=0; i<bins.length; i++) 
    newBinList.push(bins[i].map(x => x * scaleFactor));
  return newBinList;
}

// SURVEY Q1
// Returns a synthetic SleepArchitecture object based on only Population averages and Age alone
function SleepSynthForAge(sleepEval) {
  const age = sleepEval.Age;
  const sleepRec = FetchSleepStats(sleepAvgTable, age);
  const sleepBins = MapSleepPhases(sleepRec);
  console.log("SleepSynthForAge() Bins = " + JSON.stringify(sleepBins));
  const sleepArch = SynthHypno(sleepRec.InBed, sleepBins);
console.log("SCORE inside SleepSynthForAge is " + sleepArch.score);
  return(sleepArch);
}

// SURVEY Q1-4
// Returns a synthetic SleepArchitecture object based on Population averages and Age + ACTUAL InBed, Onset and Wakeups
function SleepSynthWithExtents(sleepEval) {
  const age = sleepEval.Age;
  const inBed = sleepEval.InBed;
  const onset = sleepEval.Onset;
  const wakeup = sleepEval.Wakeup;
  
  // First, synth Pop Ave Hypno from just AGE
  var sleepRec = FetchSleepStats(sleepAvgTable, age);
  // modify sleepRec now based on ACTUALs
  sleepRec.InBed = inBed;
  const sleepBins = MapSleepPhases(sleepRec);
  var totalTimeInBedTime = (sleepRec.InBed > 12) ? ((24 - sleepRec.InBed) +  wakeup) * 60 : (wakeup - sleepRec.Inbed) * 60;
  // This is the tricky part....since we know the user's sleep extents, we can calc how much bigger/smaller they are vs. pop ave numbers, then use this to scale up/down all of those numbers
  var scaleFactor = totalTimeInBedTime/(sleepRec.TST + sleepRec.Onset + sleepRec.WakeT);
  var scaledSleepBins = ScaleBins(sleepBins, scaleFactor);
  console.log("SleepSynthWithExtents() Bins = " + JSON.stringify(scaledSleepBins));
  const sleepArch = SynthHypno(sleepRec.InBed, scaledSleepBins);
  return(sleepArch);
}


const REM_QUESTION_CENTER = 2;  // the 'center' question in the survey for REM ...eg a center of 2 means the Q range is 0 - 4
const REM_PERCENT_CHANGE = 0.25;  // % change in REM base no Survey question deviation from average
const DEEP_QUESTION_CENTER = 2;
const DEEP_PERCENT_CHANGE = 0.25;
const OVERALL_QUESTION_CENTER = 5;
const OVERALL_PERCENT_CHANGE = 1.05;

// eg sleepEval = {Age: 30, InBed: 23, Onset: 5, Wakeup: 5.5, Dreams: 2, WakeN: 3, WakeT: 15, Deep: 4, Overall: 6};


// SURVEY Q1-5
// Returns a synthetic SleepArchitecture object based on Population averages and Age + ACTUAL InBed, Onset and Wakeups + the survey results for Dreams
function SleepSynthWithDreams(sleepEval) {
  const age = sleepEval.Age;
  const inBed = sleepEval.InBed;
  const onset = sleepEval.Onset;
  const wakeup = sleepEval.Wakeup;
  const dreams = sleepEval.Dreams;

  // First, synth Pop Ave Hypno from just AGE
  var sleepRec = FetchSleepStats(sleepAvgTable, age);
  // modify sleepRec now based on ACTUALs
  sleepRec.InBed = inBed;
  const sleepBins = MapSleepPhases(sleepRec);
  var totalTimeInBedTime = (sleepRec.InBed > 12) ? ((24 - sleepRec.InBed) +  wakeup) * 60 : (wakeup - sleepRec.Inbed) * 60;
  // This is the tricky part....since we know the user's sleep extents, we can calc how much bigger/smaller they are vs. pop ave numbers, then use this to scale up/down all of those numbers
  var scaleFactor = totalTimeInBedTime/(sleepRec.TST + sleepRec.Onset + sleepRec.WakeT);
  var scaledSleepBins = ScaleBins(sleepBins, scaleFactor);
  // Now take the Dreams factor into account, and increase/decrease REM time with a proportionate increase/decrease in Light sleep
  remChange = (dreams - REM_QUESTION_CENTER) * (REM_PERCENT_CHANGE);   // -/+10% for each tick left/right of average
  console.log("REM change = " + remChange);
  var REMscaledSleepBins = ApplyBinSwapScaling(scaledSleepBins, remChange, REM_BIN);
  console.log("SleepSynthWithDreams() Bins = " + JSON.stringify(REMscaledSleepBins));
  const sleepArch = SynthHypno(sleepRec.InBed, REMscaledSleepBins);
  return(sleepArch);
}

// SURVEY Q1-7
// Returns a synthetic SleepArchitecture object based on Population averages and Age + numAwakes and awake time
// Awake strategy is trickier than the rest.
function SleepSynthWithAwakes(sleepEval) {
  const age = sleepEval.Age;
  const inBed = sleepEval.InBed;
  const onset = sleepEval.Onset;
  const wakeup = sleepEval.Wakeup;
  const dreams = sleepEval.Dreams;
  const numAwakes = sleepEval.WakeN;
  const awakeTime = sleepEval.WakeT;

  // First, synth Pop Ave Hypno from just AGE
  var sleepRec = FetchSleepStats(sleepAvgTable, age);
  // modify sleepRec now based on ACTUALs
  sleepRec.InBed = inBed;
  sleepRec.Onset = onset;
  sleepRec.WakeN = numAwakes;
  sleepRec.WakeT = awakeTime;
  const sleepBins = MapSleepPhases(sleepRec);
  var totalTimeInBedTime = (sleepRec.InBed > 12) ? ((24 - sleepRec.InBed) +  wakeup) * 60 : (wakeup - sleepRec.Inbed) * 60;
  // Adjust using actual sleep times
  var scaleFactor = totalTimeInBedTime/(sleepRec.TST + sleepRec.Onset + sleepRec.WakeT);
  var scaledSleepBins = ScaleBins(sleepBins, scaleFactor);
  // Now take the Dreams factor into account, and increase/decrease REM time with a proportionate increase/decrease in Light sleep
  remChange = (dreams - REM_QUESTION_CENTER) * (REM_PERCENT_CHANGE);   // -/+10% for each tick left/right of average
  console.log("REM change = " + remChange);
  var REMscaledSleepBins = ApplyBinSwapScaling(scaledSleepBins, remChange, REM_BIN);
  console.log("SleepSynthWithAwakes() Bins = " + JSON.stringify(REMscaledSleepBins));
  const sleepArch = SynthHypno(sleepRec.InBed, REMscaledSleepBins);
  return(sleepArch);
}

// SURVEY Q1-8
// Returns a synthetic SleepArchitecture object based on Population averages and Age + ACTUAL InBed, Onset and Wakeups + the survey results for Dreams
function SleepSynthWithDeep(sleepEval) {
  const age = sleepEval.Age;
  const inBed = sleepEval.InBed;
  const onset = sleepEval.Onset;
  const wakeup = sleepEval.Wakeup;
  const dreams = sleepEval.Dreams;
  const numAwakes = sleepEval.WakeN;
  const awakeTime = sleepEval.WakeT;
  const deep = sleepEval.Deep;

  // First, synth Pop Ave Hypno from just AGE
  var sleepRec = FetchSleepStats(sleepAvgTable, age);
  // modify sleepRec now based on ACTUALs
  sleepRec.InBed = inBed;
  sleepRec.Onset = onset;
  sleepRec.WakeN = numAwakes;
  sleepRec.WakeT = awakeTime;
  const sleepBins = MapSleepPhases(sleepRec);
  var totalTimeInBedTime = (sleepRec.InBed > 12) ? ((24 - sleepRec.InBed) +  wakeup) * 60 : (wakeup - sleepRec.Inbed) * 60;
  // Adjust using actual sleep times
  var scaleFactor = totalTimeInBedTime/(sleepRec.TST + sleepRec.Onset + sleepRec.WakeT);
  var scaledSleepBins = ScaleBins(sleepBins, scaleFactor);
  // Now take the Dreams factor into account, and increase/decrease REM time with a proportionate increase/decrease in Light sleep
  remChange = (dreams - REM_QUESTION_CENTER) * (REM_PERCENT_CHANGE);   // -/+10% for each tick left/right of average
  console.log("REM change = " + remChange);
  var REMscaledSleepBins = ApplyBinSwapScaling(scaledSleepBins, remChange, REM_BIN);
  console.log("SleepSynthWithAwakes() Bins = " + JSON.stringify(REMscaledSleepBins));
  
  deepChange = (deep - DEEP_QUESTION_CENTER) * (DEEP_PERCENT_CHANGE);   // -/+10% for each tick left/right of average
  console.log("DEEP change = " + deepChange);
  var deepScaledSleepBins = ApplyBinSwapScaling(REMscaledSleepBins, deepChange, DEEP_BIN);

  const sleepArch = SynthHypno(sleepRec.InBed, deepScaledSleepBins);
  return(sleepArch);
}

// FINAL SleepSynth SURVEY Q1-9
// Returns a synthetic SleepArchitecture object based on Population averages and Age + ACTUAL InBed, Onset and Wakeups + the survey results for Dreams
function SleepSynthOverall(sleepEval) {
  const age = sleepEval.Age;
  const inBed = sleepEval.InBed;
  const onset = sleepEval.Onset;
  const wakeup = sleepEval.Wakeup;
  const dreams = sleepEval.Dreams;
  const numAwakes = sleepEval.WakeN;
  const awakeTime = sleepEval.WakeT;
  const deep = sleepEval.Deep;
  const overall = sleepEval.Overall;

  // First, synth Pop Ave Hypno from just AGE
  var sleepRec = FetchSleepStats(sleepAvgTable, age);

  // Modify sleepRec now based on ACTUALs
  sleepRec.InBed = inBed;
  sleepRec.Onset = onset;
  sleepRec.WakeN = numAwakes;
  sleepRec.WakeT = awakeTime;
  const sleepBins = MapSleepPhases(sleepRec);
  var totalTimeInBedTime = (sleepRec.InBed > 12) ? ((24 - sleepRec.InBed) +  wakeup) * 60 : (wakeup - sleepRec.Inbed) * 60;
 
  //  Scale the non-actuals using the actuals 
  var scaleFactor = totalTimeInBedTime/(sleepRec.TST + sleepRec.Onset + sleepRec.WakeT);
  var scaledSleepBins = ScaleBins(sleepBins, scaleFactor);

  // Now take the Overall question into account to adjust the "good parts of sleep" up and down
  // To do this, we're going to increase/reduce Awake right now, and add in a multiplier to the Increase/Reduce 
  // From the REM and Deep questions
  OverallMultiplier = OVERALL_PERCENT_CHANGE * (overall - OVERALL_QUESTION_CENTER) * 0.33;  

  // Now take the Dreams factor into account, and increase/decrease REM time with a proportionate increase/decrease in Light sleep
  remChange = (dreams - REM_QUESTION_CENTER) * (REM_PERCENT_CHANGE * OverallMultiplier);   // -/+10% for each tick left/right of average
  console.log("REM change = " + remChange);
  var REMscaledSleepBins = ApplyBinSwapScaling(scaledSleepBins, remChange, REM_BIN);
  console.log("SleepSynthWithAwakes() Bins = " + JSON.stringify(REMscaledSleepBins));
 
  // Now factor in the Deep question's answer
  deepChange = (deep - DEEP_QUESTION_CENTER) * (DEEP_PERCENT_CHANGE * OverallMultiplier);   // -/+10% for each tick left/right of average
  console.log("DEEP change = " + deepChange);
  var deepScaledSleepBins = ApplyBinSwapScaling(REMscaledSleepBins, deepChange, DEEP_BIN);

  // Finally, synth the Hypno
  const sleepArch = SynthHypno(sleepRec.InBed, deepScaledSleepBins);
  return(sleepArch);
}



function CountBinVal(bins, slot) {
  var count = 0;
  for (i=0; i<bins.length; i++) 
    count+=bins[i][slot];
  return(count);
}

function CountBinStates(bins, slot) {
  var count = 0;
  for (i=0; i<bins.length; i++) 
    count += bins[i][slot] > 0 ? 1 : 0;
  return(count);
}


// Alter the REM bins by remChange % and alter the light bins to compensate
function ApplyBinSwapScaling(bins, binChange, bin_slot) {
  const newBinList = [];
  const currentBinToChange = CountBinVal(bins, bin_slot);
  const currentLight = CountBinVal(bins, LIGHT_BIN);
  console.log("Current BIN=" + currentBinToChange + " and Current Light=" + currentLight);
  // Scale the REM bins
  for (i=0; i<bins.length; i++) 
    bins[i][bin_slot] = bins[i][bin_slot] * (1+binChange);
  const newBinToChange = CountBinVal(bins, bin_slot);
  // Now scale the Light bins to compensate
  const lightBinScaleFactor = (currentBinToChange - newBinToChange)/currentLight;
  for (i=0; i<bins.length; i++) 
    bins[i][LIGHT_BIN] = bins[i][LIGHT_BIN] * (1+lightBinScaleFactor);
  const newLight = CountBinVal(bins, LIGHT_BIN);
  console.log("New BIN=" + newBinToChange + " and New Light=" + newLight);

  return bins;
}



/*

function SleepSynth(startTime, endTime, age) {
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
*/

/*

function endTMilFraction(milTimeFrac, minsToAdd) {
console.log("Adding " + minsToAdd + " minutes to " + milTimeFrac);
  return((milTimeFrac + minsToAdd/60) % 24);
}

/
// Synthesizes a SleepArchitecture object based on population data averages and demographic information, and then 'warps'
// this sleep architecture based on the customer-subjective "feel" information
// startTime/endTime :  epoch millisecond start/end times
// age : years
function RoughSynth(age) {
  const sleepArch = {hypno: []};
  const cycleStates = ["Wake", "Light", "Deep", "REM"];
  var h;
  var sleepState;
  var startTime, endTime;

  const sleepRecForAge = fetchSleepStats(sleepAvgTable, age);
console.log("Sleep Stats for (" + age + ") =" + JSON.stringify(sleepRecForAge));
  //startTime = LastNight(sleepRecForAge.Onset, 0);

  startTime = LastNight(Math.floor(sleepRecForAge.InBed), Math.floor((sleepRecForAge.InBed - Math.floor(sleepRecForAge.InBed)) * 60));
  var eT = endTMilFraction(sleepRecForAge.InBed, sleepRecForAge.Onset + sleepRecForAge.TST + sleepRecForAge.WakeT);
//  endTime = ThisMorning(6, 30);
  console.log("eT/endTMilFraction = " + eT + "/" + eT.toFixed(2));
  endTime = ThisMorning(Math.floor(eT), Math.floor((Math.floor(eT) - eT) * 60));

 console.log("EndTime = " + JSON.stringify(endTime));
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
  console.log("ROUGH Sleep Arch = " + JSON.stringify(h));

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

*/

function SleepScore(tst, rem, deep, numAwakes, awake) {
  const ES_CENTER = 60; 
  const DS_WEIGHT = 0.5;
  const ES_WEIGHT = 0.3;
  const CS_WEIGHT = 0.2;

  let ds = 0; // duration score
  let es = 0; // eff score
  let cs = 0;
  // let fs = 0; // frag score

  if (tst == 0) {
    ds = 0.0;
    es = 0.0;
    cs = 0.0;
  } else {
    ds = Math.max(50 - (Math.max(Math.abs(480 - tst / 60 / 1000) - 60, 0) / 60 * 15), 0) * 2;
    es =(Math.min(ES_CENTER * ((rem / 60 + deep / 60) / Math.max(tst / 60, 1)),30) /30) *100;
    // cs =(Math.max(20 - numAwakes * 2 + (10 * tst) / (tst + awake), 0) / 20) * 100;
    cs = Math.max((20-numAwakes)*tst/(tst+(awake/2)), 0) / 20 * 100 //proposed
  }
  let combined_score = (ds * DS_WEIGHT) + (es * ES_WEIGHT) + (cs * CS_WEIGHT);

  return(Math.round(combined_score));
}

// For a Hypnogram h, count the total amount of time in state 'state' and return it
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

/*

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
*/
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
console.log("LastNight with " + hour + ":" + min);
  // assume PM
  var previous = new Date();
  previous.setDate(previous.getDate() - 1);
  previous.setHours(hour);
  previous.setMinutes(min);
console.log("LastNight = " + previous.toTimeString());
  return previous.getTime();
}

//Helper functino that returns utc epoch time corresponding to Last Night at Hour 
function ThisMorning(hour, min) {
  // assumes 'am'
  const startDate = new Date();
  startDate.setHours(hour, min, 0);
  console.log("This Morning =" + startDate.toTimeString());
  return startDate.getTime();
}


// Helper function to sum an array
function arraySum(arr) {
  return(arr.reduce((a, i)=>a+i,0));
}

