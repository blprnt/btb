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
let loc = "L276107";

//dictionary to tally bird objects which will look like this:
//  {commonName:"American Robin", count:23}
//To retrieve items out of the dictionary, we use the name. ie. birdDict["American Robin"]
let birdDict = {};

//List to keep the same items, but with a numerical index
//To retrieve items out of the array, we use the index. ie. birdList[0]
let birdList = [];

let featherScale = 2.5;

let rewindCount = 1;
let maxRewindCount = 10;
let searchDay;

function setup() {
  //----------- 1. -------------
  //Make a canvas object that takes up the whole window.
  //Give it a bit of space below
  createCanvas(displayWidth, displayHeight - 200);
  //Make it white
  background(255);

  //Make the buttons
  makeMenu();

  //load some birds from a year ago today
  getLastYear();
  background("black");
}

function draw() {}

function drawBirds() {
  //Clear anything that was there before
  background("black");

  //If the birdlist is empty, give a message
  if (birdList.length == 0) {
    console.log("NO BIRDS!!!");
    fill(255);
    text("Oh no! I did not find any birds here.", 50, 100);
  }

  //----------- 3. -------------
  //first let's move over so we're not drawing up in the corner
  translate(50, 50);
  //For every bird, we'll draw a circle and label it.
  let stackHeight = 0;
  for (let i = 0; i < birdList.length; i++) {
    let bird = birdList[i];
    //Set the size of the circle to be it's square root, then scale it so it's not too small.
    let size = sqrt(bird.count) * 10;
    //This is an easy way to map the count to color
    stroke(255, map(bird.count, 0, 30, 120, 255), 0, 185);
    //stroke(0,45);
    //Draw the feather
    push();
    translate(0, stackHeight);
    rotate(-PI / 2 + random(-0.3, 0.3));
    drawFeather(size * featherScale);
    pop();
    //Old code to draw a circle
    //circle(0, stackHeight, size, size);
    //Increase the stack height so the next feather ends up in the right place. 3 pixel space so it doesn't crowd at the bottom.
    stackHeight += max(14, size + 3);
    //Label
    fill(255);
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

function getLastYear() {
  let now = new Date();
  let y = now.getFullYear() - 1;
  let m = now.getMonth() + 1;
  let d = now.getDate();
  
  //store the date as our search date
  searchDate = now;
  
  if (m == 2 && d == 29) {
    d = 28;
  }
  let date = y + "/" + m + "/" + d;
  loadBirds(loc, date);
}

function getPastBirds(_rewind) {
  let day = new Date();
  day.setDate(day.getDate() - _rewind);
  let y = day.getFullYear();
  let m = day.getMonth() + 1;
  let d = day.getDate();
  
  //store the date as our search date
  searchDate = day;
  
  let date = y + "/" + m + "/" + d;
  loadBirds(loc, date);
}

function getRewindBirds(_date, _rewindcount) {
  _date.setDate(_date.getDate() - _rewindcount);
  
  let y = _date.getFullYear();
  let m = _date.getMonth() + 1;
  let d = _date.getDate();
  
  let date = y + "/" + m + "/" + d;
  loadBirds(loc, date);
  
  
}

function makeMenu() {
  let button = createButton("Last Year");
  button.position(100, 20);
  button.mousePressed(() => {
    getLastYear();
  });

  let button2 = createButton("Yesterday");
  button2.position(220, 20);
  button2.mousePressed(() => {});
  button2.mousePressed(() => {
    getPastBirds(1);
  });

  let button3 = createButton("Next Week");
  button3.position(340, 20);
  button3.mousePressed(() => {});
  button3.mousePressed(() => {
    let nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    let y = nextWeek.getFullYear() - 1;
    let m = nextWeek.getMonth() + 1;
    let d = nextWeek.getDate();
    
    //store the date as our search date
    searchDate = nextWeek;
    
    let date = y + "/" + m + "/" + d;
    loadBirds(loc, date);
  });
}

function loadBirds(_location, _date) {
  //Clear the objects
  birdList = [];
  birdDict = {};
  //Get the data
  console.log("Loading bird data for " + _date);
  let url = "/history?loc=" + _location + "&date=" + _date;
  console.log(url);
  //Ask for the data and call onBirds when we get it
  loadJSON(url, onBirds);
  fill(255);
  text("Waiting on some bird data", 50, 50);
}

function onBirds(_data) {
  console.log("GOT BIRD DATA!");
  if (_data.length == 0) {
    //Empty return
    console.log("Didn't get bird data:" + rewindCount);
    rewindCount++;
    if (rewindCount < maxRewindCount) {
      getRewindBirds(searchDate, rewindCount);
    } else {
      console.log("Hit the max number of past days");
      rewindCount = 0;
    }
  } else {
    rewindCount = 0;
    console.log(_data);
    //----------- 2. -------------
    //The _data argument contains an array of observations from the requested place and date.
    //The observations look like this:
    //  {"speciesCode":"brant","comName":"Brant","sciName":"Branta bernicla","locId":"L1902982","locName":"Brooklyn Bridge Park","obsDt":"2024-02-01 16:46","howMany":78,"lat":40.6996104,"lng":-73.9973745,"obsValid":true,"obsReviewed":false,"locationPrivate":false,"subId":"S160379591"}
    //Let's go through it and populate the dictionary

    _data.forEach((_observation) => {
      console.log(_observation);
      let commonName = _observation.comName;

      let bird = {
        commonName: commonName,
        count: _observation.howMany,
      };

      if (!bird.count) bird.count = 0;

      //Put it in the dictionary - this would be like putting a book into a catalogue
      birdDict[commonName] = bird;

      //Put it into the array - this is like putting it on the shelf
      birdList.push(bird);
    });

    //At this point we should have a full dictionary! Let's check...
    console.log(birdDict);

    //Let's sort the list by count

    birdList = birdList.sort(function (a, b) {
      return b.count - a.count;
    });

    //And see what we get
    console.log(birdList);
    //We see that we now have an ordered list of birds, like this:
    //
    //{commonName: 'Ring-billed Gull', count: 250}
    //{commonName: 'Brant', count: 78}
    //{commonName: 'Herring Gull', count: 60}
    //...
    //
    //We can now visualize this using the drawBirds() function
    drawBirds();
  }
}

function drawFeather(_length) {
  push();
  scale(1, 2);
  drawFeatherSide(_length);
  scale(-1, 1);
  drawFeatherSide(_length);
  pop();
}

function drawFeatherSide(_length) {
  let hf = 0.5;
  let w = _length * 0.15;
  let h = _length * hf;
  let step = 5;
  let end = createVector(0, h);

  let stack = 0;
  let stuck = false;
  for (let i = 0; i < _length; i += step) {
    if (!stuck && random(100) < 10) {
      stuck = true;
    }
    if (stuck && random(100) < 20) {
      stuck = !stuck;
    }
    //three points
    let vh = 200;
    let aw = sin(map(i, 0, _length, 0, PI)) * w;
    if (!stuck) stack += step * hf + pow(i, 0.2) * 0.75 * hf;
    let p0 = createVector(0, i * hf * 0.75);
    let p1 = createVector(aw, stack);
    let p2 = p1.lerp(end, map(i, 0, _length, 0, 1));

    if (i < _length * 0.1) {
      p2.x *= random(0.8, 1.2);
      p2.y *= random(0.8, 1.2);
    }

    beginShape();
    vertex(p0.x, p0.y);
    vertex(p1.x, p1.y);
    endShape();
  }
}
