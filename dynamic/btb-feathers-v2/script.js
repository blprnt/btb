let birdImage;

function preload() {
  birdImage = loadImage("https://cdn.glitch.global/5baa61f6-0046-437c-b864-7a36ecff27f7/900.jpeg?v=1743201979980");
}

function setup() {
  createCanvas(400, 400);
  frameRate(3);
}

function draw() {
  background(200);
  push();
  
  translate(width/2, height/2);
  scale(1);
  rotate(mouseX * 0.01);
  
  let palette = createPalette(birdImage, 50, [575,530], [770,170]);
  
  //let colors = ["#FF3300","#FF6600","#FF9900"];
  drawFeather(200, palette);
  pop();
  
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
    vertex(p0.x , p0.y);
    vertex(p1.x , p1.y);
    endShape();

    stroke(255, 150);
    point(p1.x, p1.y);
  }
}

