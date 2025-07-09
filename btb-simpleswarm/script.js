let birds = [];

function setup() {
  createCanvas(400, 400);
  addBird(50,50);
}

function draw() {
  background("#91F4C2");

  birds.forEach(b => {
    goToMouse(b);
    b.life ++;
    ellipse(b.x, b.y, 10,10);
  });
}

function mousePressed() {
  addBird(mouseX, mouseY);
}

function goToMouse(_b) {
  //rad = how far from the mouse to circle
  let tx = mouseX + (cos(_b.life * 0.1) * _b.rad);
  let ty = mouseY + (sin(_b.life * 0.1) * _b.rad);
  //speed = how fast to move to the mouse (bigger = slower)
  _b.x += (tx - _b.x) / _b.speed;
  _b.y += (ty - _b.y) / _b.speed;
}

function addBird(_x, _y) {
  let b = {
    x:_x,
    y:_y,
    life:0,
    rad:random(50,100),
    speed:random(30,90)
  };
  birds.push(b);
}
