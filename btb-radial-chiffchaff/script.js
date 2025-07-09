// Aim - map of Chiffchaff distribution across the year
// based on hitoric data on Fair Isle

// trying to make radial following
// https://editor.p5js.org/codingtrain/sketches/xe3uKLkl-

let numPts = 48;
let data = [];

// add image of CC RSPB
function preload() {
  img1 = loadImage(
    "https://cdn.glitch.global/720b5682-6c04-43d6-bb7e-15937b8de5e6/cc.jpg.png?v=1743010828656"
  );
}

function setup() {
  // This code happens once at set up
  createCanvas(400, 400);
  // load in hotspot data for FI
  loadTable("data.tsv", onBirdData); // call funtion once data is ready
  angleMode(DEGREES);

  data = [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1052632, 0.1428571,
    0.3529412, 0.32, 0.45, 0.28, 0.4285714, 0.3333333, 0.3333333, 0.3181818,
    0.3076923, 0.2, 0.3333333, 0.1333333, 0.0, 0.2222222, 0.0769231, 0.0869565,
    0.0416667, 0.0740741, 0.0555556, 0.1355932, 0.0555556, 0.1052632, 0.1756757,
    0.2765957, 0.4817518, 0.6206897, 0.3648649, 0.6, 0.5, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0,
  ];
}

function draw() {}
function onBirdData(_data) {
  // new function (name _ came into function)
  console.log("Got bird data!"); // check did what wanted
  //console.log(_data.get(1, 2)); // check data where expected col / rows
  // let myBird = _data.getRow(107); // Black Guillemot
  let myBird = _data.getRow(233); // Chiffchaff
  console.log(_data.getRow(233));
  background(164, 141, 89); // mantle colour
  image(img1, 150, 150, 100, 100);
  vizBird(myBird);
}
function vizBird(_dataRow) {
  
  
  
  translate(width / 2, height / 2);
  
  //Circle for scale
  fill(255,20);
  noStroke();
  ellipse(0,0,160,160);
  
  stroke(255);
  noFill();
  beginShape();

  for (let i = 0; i < numPts; i++) {
    //radius
    let rad = map(_dataRow.get(i + 1), 0, 1, 80, 200);
    //rotation
    let rot = map(i, 0, data.length, 0, 360);
    let x = rad * cos(rot);
    let y = rad * sin(rot);
    vertex(x, y);
  }
  //Close the circle
  vertex(80,0);
  endShape();

  fill(241, 212, 146);
  textFont("Merriweather");
  textSize(24);
  let t = "Chiffchaff, Fair Isle";
  // text(_bird.get(0), 50, height / 1.95); // Black Guillemot
  text(t, -175, 180); // flank colour
}
