let colors = [
  "#f7fcfd",
  "#e0ecf4",
  "#bfd3e6",
  "#9ebcda",
  "#8c96c6",
  "#8c6bb1",
  "#88419d",
  "#810f7c",
  "#4d004b",
];

let featureBirds = [];


function setup() {
  //This code happens once
  createCanvas(windowWidth, windowHeight);
  loadTable("data.tsv", onBirdData);
}

function draw() {
  background("DarkOrange");
  //Go through the featured rows and viz them
  let cols = 1;
  let rowHeight = height / ceil(featureBirds.length / cols);
  for (let i = 0; i < featureBirds.length; i++) {
    let x = (i % cols) * (width / cols);
    let y = floor(i / cols) * rowHeight;
    push();
    translate(x, y);
    vizBird(featureBirds[i], width / cols, rowHeight, true);
    //vizBirdRadial(featureBirds[i], min(width / cols, rowHeight));
    pop();
  }
  
}

function onBirdData(_data) {
  console.log("Got bird data!");
  //Go through the rows and collect the ones with a keyword in a name
  console.log(_data.getRowCount());

  for (let i = 0; i < _data.getRowCount(); i++) {
    let birdName = _data.getRow(i).get(0);
    if (birdName.indexOf("Warbler") != -1) {
      featureBirds.push(_data.getRow(i));
    }
  }
}

function vizBirdRadial(_bird, _chartSize) {
  
  /*
  let months = "JFMAMJJASOND";
  for (let i = 0; i < 12; i++) {
    let theta = map(i, 0, 12, 0, 2 * PI);
    push();
      translate(_chartSize/2, _chartSize/2);
      rotate(theta - PI/2);
      stroke(255);
      line(20,0,70,0)
      fill(255);
      translate(80,0);
      rotate(PI/2);
      text(months.charAt(i), 0, 0);
    pop();
  }
  */
  
  
  noFill();
  //rect(0,0,_chartSize, _chartSize);

  let donutHole = 0.2
  for (let i = 0; i < 48; i++) {
    let num = _bird.get(i + 1);
    let theta = map(i, 0, 48, 0, TAU);
    let holeEdge = (_chartSize * donutHole)/2;
    let rad = map(num, 0, 1, 0 ,(_chartSize - donutHole)/2);
    push();
    translate(_chartSize / 2, _chartSize / 2);
    rotate(theta - PI / 2);
    rect(holeEdge, 0, rad, 3);
    pop();
  }
}

function vizBird(_bird, _chartWidth, _chartHeight, _isUp) {
  for (let i = 0; i < 48; i++) {
    let num = _bird.get(i + 1);
    let ci = floor(map(num, 0, 1, 0, colors.length));
    let c = colors[ci];
    //let c = map(num, 0, 1, 0, 255);
    //fill(c,0,255);
    //colorMode(HSB);
    fill(c);
    noStroke();
    if (_isUp) {
      rect(
        i * (_chartWidth / 48),
        _chartHeight,
        _chartWidth / 48,
        -num * _chartHeight
      );
    } else {
      rect(i * (_chartWidth / 48), 0, _chartWidth / 48, num * _chartHeight);
    }
  }

  fill(255);
  textFont("Merriweather");
  textSize(24);
  text(_bird.get(0), 50, _chartHeight / 2);
}
