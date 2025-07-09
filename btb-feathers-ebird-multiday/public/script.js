/*

This is an example of using p5.js to get data from the eBird API. Code for communicating with the API is in the server.js file.

This program uses a proxy which is found at:

  https://btb-ebird.glitch.me/history

And can be called with

  https://btb-ebird.glitch.me/history?loc={{location}}&date={{date}}

The location is either a code for a location or a region. 
Date is in yyyy/MM/dd format.

The easiest way to find codes for regions is here: https://ebird.org/explore

  If I search for Kings county, I get this url:

  https://ebird.org/region/US-NY-047?yr=all

  The code for Kings is US-NY-047.

And for hotspots:

https://ebird.org/hotspots

  If I search for Brooklyn Bridge Park and click 'view details' I get this url:

  https://ebird.org/hotspot/L1902982
  
  The code for Brookyln Bridge park is L1902982

Note that using large regions will result in large sets of results!

The history endpoint unfortunately doesn't return all observations on a day - for this we'd need to 
use the big eBird dataset. Instead it returns all individual taxa reported and the latest count.


IMPORTANT: You need to put your own API key into the .env file, which is on the left.
Use this URL to get a key: https://ebird.org/api/keygen

*/

//eBird location to use (see above)
let loc = "L1902982";

let featherScale = 3;

//Multi-day setup
let dayScope = 3;
let currentDay = 0;
let dayResults = [];
let dates = [];

//Store a unique color for each bird in a dictionary
let colorDict = {};

function setup() {
  //Make a canvas object that takes up the whole window.
  //Give it a bit of space below
  createCanvas(displayWidth, displayHeight - 200);
  //Make it white
  background(255);

  //Load the first day in our day scope
  getPreviousDay(currentDay);
}

function draw() {
  //Set the random seed
  randomSeed(1);
  background("white");
  //Draw each day
  for (let i = 0; i < dayResults.length; i++) {
    push();
    translate(50 + i * 350, 50);
    fill(0);
    textSize(24);
    text(dates[i], 0, 0)
    translate(0,50);
    drawBirds(dayResults[i], 10);
    pop();
  }
}

function drawBirds(_list, _num) {
  //If the birdlist is empty, give a message
  if (_list.length == 0) {
    console.log("NO BIRDS!!!");
    fill(255);
    text("Oh no! I did not find any birds here.", 50, 100);
  }

  //For every bird, we'll draw a circle and label it.
  let stackHeight = 0;
  for (let i = 0; i < _num; i++) {
    let bird = _list[i];
    //Set the size of the circle to be it's square root, then scale it so it's not too small.
    let size = sqrt(bird.count) * 10;
    //This is an easy way to map the count to color
    stroke(255, map(bird.count, 0, 100, 120, 255), 0, 185);
    //stroke(0,45);
    //Draw the feather
    push();
    translate(0, stackHeight);
    rotate(-PI / 2 + random(-0.3, 0.3));
    drawFeather(size * featherScale, colorDict[bird.commonName]);
    pop();

    //Increase the stack height so the next feather ends up in the right place. 3 pixel space so it doesn't crowd at the bottom.
    stackHeight += max(14, size + 3);
    //Label
    fill(0);
    noStroke();
    textSize(14);
    textFont("Merriweather");
    text(
      bird.commonName + " (" + bird.count + ")",
      size * featherScale + 5,
      stackHeight - size + 6
    );

    if (stackHeight > height - 150) {
      stackHeight = 0;
      translate(375, 0);
    }
  }
}

function getPreviousDay(_shift) {
  //Today
  let theDay = new Date();
  //Shift backwards
  theDay.setDate(theDay.getDate() - _shift);
  let y = theDay.getFullYear() - 1;
  let m = theDay.getMonth() + 1;
  let d = theDay.getDate();
  let date = y + "/" + m + "/" + d;
  dates.push(date);
  loadBirds(loc, date);
}

function loadBirds(_location, _date) {
  //Get the data
  console.log("Loading bird data for " + _date);
  let url = "/history?loc=" + _location + "&date=" + _date;
  console.log(url);
  //Ask for the data and call onBirds when we get it
  loadJSON(url, onBirds);
  background(255);
  fill(0);
  text("Waiting on some bird data", 50, 50);
}

function onBirds(_data) {
  console.log("GOT BIRD DATA!");
  console.log(_data);
  //----------- 2. -------------
  //The _data argument contains an array of observations from the requested place and date.
  //The observations look like this:
  //  {"speciesCode":"brant","comName":"Brant","sciName":"Branta bernicla","locId":"L1902982","locName":"Brooklyn Bridge Park","obsDt":"2024-02-01 16:46","howMany":78,"lat":40.6996104,"lng":-73.9973745,"obsValid":true,"obsReviewed":false,"locationPrivate":false,"subId":"S160379591"}

  let _dayList = [];

  _data.forEach((_observation) => {
    console.log(_observation);
    let commonName = _observation.comName;

    let bird = {
      commonName: commonName,
      count: _observation.howMany,
    };

    if (!bird.count) bird.count = 0;

    //Put a color for the bird in the color dictionary if there isn't already one there
    if (!colorDict[commonName]) {
      colorDict[commonName] = [
        color(random(255), random(255), random(255)),
        color(random(255), random(255), random(255)),
        color(random(255), random(255), random(255)),
      ];
    }

    //Put it into the array - this is like putting it on the shelf
    _dayList.push(bird);
  });

  //Let's sort the list by count
  _dayList = _dayList.sort(function (a, b) {
    return b.count - a.count;
  });

  //Put the day list into the array of days
  dayResults.push(_dayList);

  //clear the loading message
  if (currentDay == 0) {
    background("white");
  }

  //Get the next day!
  currentDay++;
  if (currentDay < dayScope) {
    getPreviousDay(currentDay);
  }
}

//Function to get an array of colors from an image
function createPalette(_img, _num, _start, _end) {
  let _pal = [];
  for (let i = 0; i < _num; i++) {
    let x = map(i, 0, _num, _start[0], _end[0]);
    let y = map(i, 0, _num, _start[1], _end[1]);
    _pal.push(_img.get(floor(x), floor(y)));
  }
  return _pal;
}

//Feather stuff
function drawFeather(_length, _colors) {
  push();
  scale(1, 1.65);
  drawFeatherSide(_length, _colors);
  scale(-1, 1);
  drawFeatherSide(_length, _colors);
  pop();
}

function drawFeatherSide(_length, _colors) {
  let hf = 0.5;
  let w = _length * 0.15;
  let h = _length * hf;
  let step = 2.5;
  let end = createVector(0, h);

  let stack = 0;
  let stuck = false;
  for (let i = 0; i < _length; i += step) {
    if (_colors) {
      stroke(_colors[floor(map(i, 0, _length, 0, _colors.length))]);
    }
    if (!stuck && random(100) < 10) {
      stuck = true;
    }
    if (stuck && (random(100) < 20 || i > length - 3)) {
      stuck = !stuck;
    }
    //three points
    //Width out from the central axis - this is a sin curve
    let aw = sin(map(i, 0, _length, 0, PI)) * w;
    if (i < _length * 0.2) aw *= random(0.1, 0.3);

    if (!stuck) stack += step * hf + pow(i, 0.03) * 0.25;
    //point anchored to the middle
    let p0 = createVector(0, stack * 0.75);
    //point
    let p1 = createVector(aw, stack);

    noFill();
    beginShape();
    vertex(p0.x, p0.y);
    vertex(p1.x, p1.y);
    endShape();

    stroke(255, 150);
    point(p1.x, p1.y);
  }
}
