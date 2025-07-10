e/*

This project uses my personal eBird Data.

Download yours:

https://ebird.org/downloadMyData

  //0              1           2              3               4      5              6      7            8        9        10        11    12     13
  //Submission ID,Common Name,Scientific Name,Taxonomic Order,Count,State/Province,County,Location ID,Location,Latitude,Longitude,Date,Time,Protocol,Duration (Min),All Obs Reported,Distance Traveled (km),Area Covered (ha),Number of Observers,Breeding Code,Observation Details,Checklist Comments,ML Catalog Numbers


*/

//How many pixels per day - set this higher if you have only been birding for a short time!
let dayMagnification = 3;

//Reference to table object
let ebirdData;

//Two modes:
// "lifers" - shows new bird species
// "species" - shows all sightings of one species
let mode = "species";
let species = "Canada Goose";

//Dictionary of observation lists indexed by species
// ie. birdMap["Northern Cardinal"] = [obs1, obs2... obsN];
let birdMap = {};

//List of names to iterate through
let birdList = [];

//Start and end dates for the timeline
let startDate;
let endDate;

//Base height
let baseHeight;

let lifeCount;
let lastMark;
let lifeMarkAdjust;

//List of close observations to iterate through and find the closest
let closestObservations = [];

function preload() {
  //Get the data so it's ready to go when we do setup
  ebirdData = loadTable("data/ebirdDataJer.csv", "csv", "header");
}

function setup() {
  //Crunch the data
  processData();

  //Set the canvas size based on the length of the data
  let days = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  console.log(floor(days * 3));
  createCanvas(max(windowWidth, floor(days * dayMagnification)), windowHeight);

  //Set the bottom baseline
  baseHeight = height - height / 5;
}

function draw() {
  colorMode(RGB);
  background("#E7BB41");
  textFont("Merriweather");

  //Title
  fill("white");
  textSize(48);
  text("A Lifelist.", 50, 100);

  noFill();
  stroke("white");
  line(0, baseHeight, width, baseHeight);

  //Clear the closests
  closestObservations = [];

  //Used to make the count marks
  lifeCount = 0;
  lastMark = -100;
  lifeMarkAdjust = 0;

  if (mode == "lifers") {
    for (let i = 0; i < birdList.length; i++) {
      //The first entry in every bird is our lifer!
      renderObservation(birdMap[birdList[i]].observations[0]);
    }
  } else {
    let bird = birdMap[species];
    for (let i = 0; i < bird.observations.length; i++) {
      renderObservation(bird.observations[i]);
    }
    
  }

  //Find the closest observation to the mouse
  let close = 200;
  let closest = null;
  closestObservations.forEach((obs) => {
    let distToObv = dist(obs.x, obs.y, mouseX, mouseY);
    if (abs(distToObv) < close) {
      close = abs(distToObv);
      closest = obs;
    }
  });

  if (close < 20) {
    //Draw the box for the closest one
    if (closest != null) {
      let label = closest.row.get(4) + " " + closest.row.get(1);
      let place = closest.row.get(8);
      let date = closest.row.get(11);
      textSize(18);

      let boxWidth = max(textWidth(label) + 40, textWidth(place) + 40);
      let boxHeight = 100;

      stroke("white");
      let cx = closest.x;
      constrain(cx, window.scrollX + 100, window.scrollX + (width - boxWidth));
      let boxPos = {
        x: cx - 10,
        y: min(200, closest.y - (boxHeight + 10)),
      };

      fill("#44BBA455");
      rect(boxPos.x, boxPos.y, boxWidth, boxHeight);
      line(closest.x, closest.y, boxPos.x, boxPos.y + boxHeight);

      translate(boxPos.x, boxPos.y);
      //text
      noStroke();
      fill("white");

      text(label, 20, 30);
      text(place, 20, 60);
      textSize(14);
      text(date, 20, 85);
    }
  }
}

function renderObservation(_row) {
  //Get the date
  let dateString = _row.get(11) + " " + _row.get(12);
  let d = new Date(dateString);
  //Set the x pos from the date
  let obsX = map(
    d.getTime(),
    startDate.getTime(),
    endDate.getTime(),
    100,
    width - 100
  );

  //Calculate a magnification based on how close the mouse is to the observation
  let mag = 1;
  let driftMag = 1;
  let distance = mouseX - obsX;
  let magRange = 100;
  if (abs(distance) < magRange) {
    //add the obs to a candidate list of close ones
    mag += (magRange - abs(distance)) / magRange;
  }

  //Line height is related to the count
  let lheight = 100 + sqrt(parseFloat(_row.get(4))) * 8;
  lheight *= sqrt(mag);

  //Set the y for the top of the stalk, used for distance calculation
  let obsY = baseHeight - lheight;

  push();
  translate(obsX, baseHeight);

  //Make the stalks drift with a mathematical wind!
  let drift = (noise((obsX + (frameCount * 0.3)) * 0.01) - 0.2) * 120;
  noFill();
  stroke("white");
  //stalk
  beginShape();
  curveVertex(0, 0);
  curveVertex(0, 0);
  curveVertex(drift / 3, -lheight / 2);
  curveVertex(drift, -lheight);
  curveVertex(drift, -lheight);
  endShape();

  //top
  translate(drift, -lheight);

  //Get the color related to the bird
  noStroke();
  let col = birdMap[_row.get(1)].col;
  fill(red(col), green(col), blue(col), 50);
  ellipse(
    0,
    0,
    8 + sqrt(parseFloat(_row.get(4))),
    8 + sqrt(parseFloat(_row.get(4)))
  );
  fill("white");
  ellipse(0, 0, 5, 5);

  pop();

  //If it's close to the mouse, put it into the closest list
  if (mag > 1) {
    closestObservations.push({
      x: obsX + drift,
      y: obsY,
      row: _row,
    });
  }
  
  lifeCount++;

  if (lifeCount % 10 == 0) {
    
    if (obsX - lastMark < 30) {
      lifeMarkAdjust += 20;
    } else {
      lifeMarkAdjust = 0;
    }

    textSize(18);
    noStroke();
    fill(255,150);
    text(lifeCount, obsX + 5, baseHeight + 30 + lifeMarkAdjust);
    
    stroke(255,100);
    line(obsX, baseHeight, obsX, baseHeight + lifeMarkAdjust + 22);

    lastMark = obsX;
  }

  //Radial - tried and didn't like!
  /*
  let theta = map(d.getTime(), startDate.getTime(), endDate.getTime(), 0, TAU);
  let height = 10 + (sqrt(parseFloat(_row.get(4))) * 5);
  
  push();
    rotate(theta);
    line(rad, 0, rad + height, 0);
  pop();
  */
}

function processData() {
  //Set the start date and end date out of bounds
  //start can be today
  startDate = new Date();
  //end can be a long time ago
  endDate = new Date("1901-01-01");
  
  //Make a date-sorted list of rows
  let allRows = [];
  for (let i = 0; i < ebirdData.getRowCount(); i++) {
    allRows.push(ebirdData.getRow(i));
  }
  allRows = allRows.sort(sortByDateRows);
  

  for (let i = 0; i < allRows.length; i++) {
    let r = allRows[i];
    
    let comName = r.get("Common Name");
    //If there isn't an entry in the dictionary for the bird, make one
    colorMode(HSB);
    if (!birdMap[comName]) {
      birdMap[comName] = {
        name: comName,
        col: color(random(255), 255, 255),
        observations: [],
      };
      //Set the name and a random color
      birdList.push(comName);
    }

    

    //Add the row
    birdMap[comName].observations.push(r);

    //Check the date bounds
    let dateString = r.get(11) + " " + r.get(12);
    let d = new Date(dateString);

    if (d.getTime() < startDate.getTime()) {
      startDate = d;
    }

    if (d.getTime() > endDate.getTime()) {
      endDate = d;
    }
  }

  //Sort the bird list by the date of the first observation
  birdList = birdList.sort(sortByDateNames);
}

function sortByDateNames (_a, _b) {
    let rowA = birdMap[_a].observations[0];
    let rowB = birdMap[_b].observations[0];
    let dateA = new Date(rowA.get(11) + " " + rowA.get(12));
    let dateB = new Date(rowB.get(11) + " " + rowB.get(12));
    return dateA.getTime() - dateB.getTime();
  }

function sortByDateRows (_rowA, _rowB) {
    let dateA = new Date(_rowA.get(11) + " " + _rowA.get(12));
    let dateB = new Date(_rowB.get(11) + " " + _rowB.get(12));
    return dateA.getTime() - dateB.getTime();
  }
