
// =================================================================
// HYPNOCHRON.JS 
// =================================================================
// 
// Notes on data structures
//
// A 'hypno' object is the most important part of a 'sleep' object.  A 'hypno' is a list of time/state
// quantized pairings that look like this:    [{x: <state>, y: [startTime, stopTime]} .... ]
// where 'state' == 'Wake' | 'Light' | 'Deep' | 'REM' and startTime and stopTime are absolute times in 
// epoch ms.
//
// A 'sleep' contains meta-data that can be computed from the hypno, and looks like this:
// exampleSleep = {tst: <total sleep time>, timeawake: <awake time>, timerem: <rem time>, timedeep: <deep time>, timelight: <light time>, hypno: <hypno>}
// where all times are in ms

const AWAKE_COLOR = '#f91a3f';
const LIGHT_COLOR = '#2e77be';
const REM_COLOR = '#0caaff';
const DEEP_COLOR = '#133f9a';
const DAY_COLOR = '#372554';
const HYPNO_STATE_COLORS = [AWAKE_COLOR, LIGHT_COLOR, DEEP_COLOR, REM_COLOR, DAY_COLOR];

const HYPNO_COLORS = { 'Wake': AWAKE_COLOR, 'Light': LIGHT_COLOR, 'REM': REM_COLOR, 'Deep': DEEP_COLOR, 'Day': DAY_COLOR};

const HYPNO_TIME_TEXT_COLOR = '#CCC9C8';
const HYPNO_CARAT_COLOR = '#D2B48C';
const HYPNO_OUTER_DIAL_COLOR = '#656097';
const HYPNO_INTERIOR_COLOR = '#390245';
const HYPNO_TIME_TEXT_BACKGROUND = '#2F4F4F';
const HYPNO_TICK_COLOR = '#485086';

const HYPNO_SLICE_DRAW_DELAY = 60;   // Normally 50
const HYPNOGRAM_WIDTH = 600;
const HYPNOCHRON_WIDTH = 600;
const HYPNOSTATS_WIDTH = 600;
const HYPNO_OUTER_RADIUS = HYPNOGRAM_WIDTH/3.14;
const HYPNO_INNER_RADIUS = HYPNO_OUTER_RADIUS * 0.7;

const DIAL_NUMBERS_TEXT_COLOR = '#e7eaef';

var loopIndex = 0;
var intervalTimer;



// Creates a new HypnoGram in the div eleement 'elID' of size 'size' using the sleep data 'sleep'
// Animates the drawing of the pie slices depending on 'isAnimated'.  Returns a ptr to the canvas used so it can be 
// properly disposed of...
function CreateHypnochron(elID, size, isAnimated, sleep) {
   var canvas, ctx, hypno, radius;
   var buf = "";
   var targetDivEl;
   
   // Create the canvas element to draw into 
   targetDivEl = document.getElementById(elID);
 //  buf += '<hypnochron-canvas id="canvas" width="' + size + '" > \
   buf += '<canvas id="hypnochron-canvas" width="' + size + '" height="' + size * 0.6 + '"> \
            </canvas>';
   targetDivEl.innerHTML = buf;

   // Set up to draw the sleep's hypno on the canvas
   canvas = document.getElementById("hypnochron-canvas");
   ctx = canvas.getContext("2d");
   hypno = JSON.parse(sleep.hypno);       // NOTE:  this is because the 'hypno' is stringified inside of the 'sleep' for historical reasons
   radius = HYPNO_OUTER_RADIUS;
   ctx.translate(HYPNO_OUTER_RADIUS, HYPNO_OUTER_RADIUS);
   radius = HYPNO_INNER_RADIUS;

   // Draw dial, then slices, then the final adornments
   DrawDial(ctx, radius);
   if (isAnimated) {
      // for animated Hypno, just start the timer and draw the first slice
      intervalTimer = setInterval(TimedHypnoSlice, HYPNO_SLICE_DRAW_DELAY, sleep, ctx);
   } else {
      var slice;
      for (i=0; i<hypno.length; i++) {
         slice = hypno[i];
//console.log("Hypno State Colors=" + slice.x);
         DrawPieSlice(ctx, HYPNO_COLORS[slice.x], slice.y[0], slice.y[1]);
     }
     FinishHypnoPaint(sleep, ctx);
   }
   return (canvas);
}

function ScoreFcn(hypnoScore) {

   var attaBoyText;
console.log("Entered Score FCN");

   if (hypnoScore < 70) {
       attaBoyText = "REST UP";
    } else if (hypnoScore < 80) {
       attaBoyText = "NOT BAD";
    } else if (hypnoScore < 90) {
       attaBoyText = "GOOD SLEEP";
    } else {
       attaBoyText = "OPTIMAL!";
    } 
    return(attaBoyText);
}

// Draw center dial, carats, start and end time
function FinishHypnoPaint(sleep, ctx) {
   hypno = JSON.parse(sleep.hypno);       // NOTE:  this is because the 'hypno' is stringified inside of the 'sleep' for historical reasons

   var startTime = hypno[0].y[0];   
   var endTime = hypno[hypno.length-1].y[1];
    // Finish up
   DrawScore(ctx, ScoreFcn, sleep.score);

   // Draw Start/EndTimes
   DrawStartEndTimes(ctx, startTime, endTime);
   DrawCarats(ctx, startTime, endTime);      
   clearInterval(intervalTimer);
}

// Draw the current slice of the hypno
function TimedHypnoSlice(sleep, ctx) {
   var hypnoSlices = sleep.hypno;
   if (loopIndex == hypnoSlices.length) 
      FinishHypnoPaint(sleep, ctx);
   else {
      slice = hypnoSlices[loopIndex++];
      DrawPieSlice(ctx, HYPNO_COLORS[slice.x], slice.y[0], slice.y[1]);
   }
}

// Draws Hypnogram Pie slices
function DrawPieSlice(ctx, sliceColor, epochStartTime, epochEndTime) {
   var startTime = MarshallTime(epochStartTime);
   var endTime = MarshallTime(epochEndTime);
   //      console.log("Drawing Pie Slice: (" + sliceColor +", " + beginTime + "," + endTime);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, HYPNO_INNER_RADIUS*0.95, (1.5*Math.PI) + (startTime*2*Math.PI)/12, (1.5*Math.PI) + (endTime*2*Math.PI)/12);
      ctx.fillStyle = sliceColor;
      ctx.lineTo(0, 0);
      ctx.fill();
}

// Draw Score in the center of the Hypnogram
function DrawScore(ctx, ScoreFcn, hypnoScore) {
console.log("HYPNO SCORE(DrawScore)=" + hypnoScore);   
   var attaBoyText = ScoreFcn(hypnoScore);

   var gradient = ctx.createRadialGradient(0,0,0, 0,0,HYPNO_INNER_RADIUS*0.45);
   var attaBoyText; 
 //  var gaugeColor = '#cfe8f7';

   // Add three color stops
   gradient.addColorStop(0, 'gray');
   gradient.addColorStop(.85, '#2F3768');
   gradient.addColorStop(1, '#615F94');

   // Draw the 'dial' and fill with the gradient
   ctx.fillStyle = gradient;
   ctx.beginPath();
   ctx.arc(0, 0, HYPNO_INNER_RADIUS*0.5, 0, 2*Math.PI);
   ctx.fill();

   //draw outer ring for the score  
   ctx.strokeStyle = '#eaf0f';
   ctx.lineWidth = 3;
   ctx.beginPath();
   ctx.arc(0, 0, HYPNO_INNER_RADIUS*0.4, 0, 2 * Math.PI);
   ctx.stroke();

   //draw outer ring around hypnogram
 
   ctx.strokeStyle = 'black';
   ctx.lineWidth = 3;
   ctx.beginPath();
   ctx.arc(0, 0, HYPNO_INNER_RADIUS*.94, 0, 2 * Math.PI);
   ctx.stroke();

   // draw score
    ctx.font = "bold " + HYPNO_INNER_RADIUS*0.5 + "px Calibri";
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    ctx.fillStyle = 'white';
    ctx.translate(0, 0);
    ctx.fillText(hypnoScore, 0, 0);

    // draw the attaboy message
    ctx.font = HYPNO_INNER_RADIUS*0.09 + "px Calibri";
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    ctx.fillStyle = 'white';
    ctx.translate(0, 39);
    ctx.fillText(attaBoyText, 0, 0);
    ctx.translate(0, -39);
}

function DrawDial(ctx) {
   
   // draw the outer dial
   ctx.beginPath();
   ctx.strokeStyle = HYPNO_OUTER_DIAL_COLOR;
   ctx.lineWidth = HYPNO_INNER_RADIUS*0.15;
   ctx.arc(0, 0, HYPNO_INNER_RADIUS, 0, 2*Math.PI);
   ctx.stroke();

   // paint the background
   ctx.beginPath();
   ctx.arc(0, 0, HYPNO_INNER_RADIUS*.92, 0, 2*Math.PI);
   ctx.fillStyle = HYPNO_INTERIOR_COLOR;
   ctx.fill();

   DrawNumbers(ctx);
   DrawTicks(ctx);   
}


function DrawNumbers(ctx) {
  var ang;
  var num;
  ctx.font = HYPNO_INNER_RADIUS*0.10 + "px Calibri";
  ctx.textBaseline="middle";
  ctx.textAlign="center";

  for(num = 1; num < 13; num++){
     if (num % 3 == 0) {
        ang = num * Math.PI / 6;
 // console.log("Numbers angle=" + ang);

        ctx.rotate(ang);
        ctx.fillStyle = DIAL_NUMBERS_TEXT_COLOR;
        ctx.translate(0, -HYPNO_INNER_RADIUS*1.01);
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, HYPNO_INNER_RADIUS*1.01);
        ctx.rotate(-ang);
     }
  }
}

function DrawTicks(ctx) {
   var ang;
   var num;

   ctx.strokeStyle = HYPNO_TICK_COLOR;
   ctx.lineWidth = 1;
   for(num = 1; num < 4*13; num++) {
      if (num % 12 != 0) {
         ang = num/4 * Math.PI / 6;
         ctx.beginPath();
         ctx.rotate(ang);
         ctx.moveTo(HYPNO_INNER_RADIUS*0.97, 0);
         ctx.lineTo(HYPNO_INNER_RADIUS*1.05, 0);
         ctx.stroke();
         ctx.rotate(-ang);
      }
   }
}

function DrawCarats(ctx, epochStartTime, epochEndTime) {
   // convert Epoch times to decimal hours for easier clock face computations
   var startTime = MarshallTime(epochStartTime);
   var endTime = MarshallTime(epochEndTime);
   var ang;
   const innerRDim = 0.96;   // the % of the radius that defines the inner dimension
   const outerRDim = 1.09;   // the % of the radius that defines the outer dimension
   const caratWidth = 10;    // how wide the fat part of the carat triangle is

   ctx.fillStyle = HYPNO_CARAT_COLOR;

   ang = (startTime - 3) * (Math.PI)/6.0;

    ctx.beginPath();
    ctx.rotate(ang);
    ctx.moveTo(HYPNO_INNER_RADIUS*innerRDim, 0);
    ctx.lineTo(HYPNO_INNER_RADIUS*outerRDim, caratWidth);
    ctx.lineTo(HYPNO_INNER_RADIUS*outerRDim, -caratWidth);
    ctx.fill();
    ctx.rotate(-ang);

    ang = (endTime - 3) * (Math.PI)/6.0;

    ctx.beginPath();
    ctx.rotate(ang);
    ctx.moveTo(HYPNO_INNER_RADIUS*innerRDim, 0);
    ctx.lineTo(HYPNO_INNER_RADIUS*outerRDim, caratWidth);
    ctx.lineTo(HYPNO_INNER_RADIUS*outerRDim, -caratWidth);
    ctx.fill();
    ctx.rotate(-ang);
}


function DrawStartEndTimes(ctx, epochStartTime, epochEndTime) {
   // convert Epoch times to decimal hours for easier clock face computations
   var startTime = MarshallTime(epochStartTime);
   var endTime = MarshallTime(epochEndTime);
   var ang;
   var num;
   ctx.font = HYPNO_INNER_RADIUS*0.09 + "px Calibri";
   ctx.textBaseline="middle";
   ctx.textAlign="center";

   num = startTime;   //draw at the 9:30 position
   ang = num * Math.PI / 6;
   ctx.rotate(ang);
   ctx.translate(0, -HYPNO_INNER_RADIUS*1.01);
   ctx.rotate(-ang);
   // Draw box for text
   ctx.fillStyle = HYPNO_TIME_TEXT_BACKGROUND;
   ctx.fillRect(-45, -9, 30, 15)
   // Draw actual text
   ctx.fillStyle = HYPNO_TIME_TEXT_COLOR;
   ctx.fillText(MarshallTimeForDisplay(startTime*60), -30, 0);

   ctx.rotate(ang);
   ctx.translate(0, HYPNO_INNER_RADIUS*1.01);
   ctx.rotate(-ang);

   num = endTime;   //draw at the 6:30 position
   ang = num * Math.PI / 6;
   ctx.rotate(ang);
   ctx.translate(0, -HYPNO_INNER_RADIUS*1.01);
   ctx.rotate(-ang);
   // Draw box for text
   ctx.fillStyle = HYPNO_TIME_TEXT_BACKGROUND;
   ctx.fillRect(-15, 17, 30, 15)
   // Draw actual text
   ctx.fillStyle = HYPNO_TIME_TEXT_COLOR;
   ctx.fillText(MarshallTimeForDisplay(endTime*60), 0, 25);

   ctx.rotate(ang);
   ctx.translate(0, HYPNO_INNER_RADIUS*1.01);
   ctx.rotate(-ang);
}

// Takes 'num' minutes and returns a formatted time string of 'hours:mins' with appropriate suffix
function MarshallTimeForDisplay(num)
 { 
  var hours = Math.floor(num / 60);  
//  var minutes = math.floor((num/60 - hours) * 100);
  var minutes = (num % 60).toFixed(0);
  return ((hours > 0) ? (hours.toFixed(0) + ":") : "") + minutes.toString().padEnd(2,'0');         
}
 
function MStoHours(num) {
   return(num/3600000).toFixed(2);
}

function Hours12(date) { return (date.getHours() + 24) % 12 || 12; };


function MarshallTime(epochTime) {
   var dateTime = new Date(epochTime);

//   console.log("DateTime Hours/Mins=" + Hours12(dateTime) + "." + dateTime.getMinutes());
   return (Hours12(dateTime) + dateTime.getMinutes()/60);
}