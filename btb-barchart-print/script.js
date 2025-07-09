/*

Binoculars to Binomials Example - Save and Print
Jer Thorp
jer.thorp@hey.com
Spring, 2025

Uses the p5.PDF library - make sure this is in your files

*/

//Define a reference to the canvas object we can use to save
let cnv;
//Define a reference to the table row for our bird
let myBird;
//Define a boolean (true/false) so we can know if we're done loading data
let loaded = false;
//Define a boolean to see if we're writing to the PDF
let PDFing = false;

//Layout Stuff
let topMargin = 60;
//How many bars do we want? Default is 48
//(Should be cleanly divisible - ie 24, 12, 8, 6, 3, 2)
//Note: We are using the max value instead of an average (mean or median)
let barCount = 12;

function setup() {
  //This code happens once
  //Make the sketch
  cnv = createCanvas(850 * 2, 1100 * 2);
  //Load the bird data
  loadTable("data.tsv", onBirdData);

  //Save Button
  let saveButton = createButton("Save Image");
  saveButton.mousePressed(doSave);

  //Print Button
  let printButton = createButton("Make PDF");
  printButton.mousePressed(doPrint);

  //PDF object
  pdf = createPDF();
}

function draw() {
  if (PDFing) {
    pdf.beginRecord();
  }

  background(255);
  //This code happens once per frame
  if (loaded) {
    drawGraph(myBird);
  }

  if (PDFing) {
    PDFing = false;
    pdf.save();
  }
}

//----------------- Bird Data Stuff-----------------//
function onBirdData(_data) {
  console.log("Got bird data!");
  myBird = _data.getRow(222);
  loaded = true;
}

function drawGraph(_bird) {
  let step = 48 / barCount;
  let barWidth = width / barCount;
  for (let i = 0; i < 48; i += step) {
    //Calculate the max for the bar
    let counts = [];
    for (let j = 0; j < step; j++) {
      let num = _bird.get(i + j + 1);
      counts.push(num);
    }
    let barHeight = max(counts);

    //Draw the bar
    noFill();
    stroke(0);
    let x = (i / step) * barWidth;
    let y = topMargin;
    rect(x, y, barWidth, barHeight * (height - topMargin));

    //Labels
    textFont("Merriweather");
    textSize(10);
    push();
    translate(x + barWidth/2, y);
    rotate(-PI/2);
    text(floor(i / step) + " - " + nf(parseFloat(barHeight),1,2), 10,0 );
    pop();
  }

  fill(0);
  textFont("Merriweather");
  textSize(24);
  text(_bird.get(0), 50, height - 30);
}

//----------------- Print & Save Stuff-----------------//
function doSave() {
  save(cnv, "myImage.png");
}

function doPrint() {
  PDFing = true;
}
